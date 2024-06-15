import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { sayHello } from './functions/say-hello/resource';
import { Stack } from "aws-cdk-lib";
import { Policy, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { storage } from './storage/resource';
import { Table, AttributeType } from "aws-cdk-lib/aws-dynamodb"
import { StringParameter } from "aws-cdk-lib/aws-ssm"
import * as iam from "aws-cdk-lib/aws-iam"

import {
  AuthorizationType,
  CognitoUserPoolsAuthorizer,
  Cors,
  LambdaIntegration,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";

import { Function } from 'aws-cdk-lib/aws-lambda';


const backend = defineBackend({
  auth,
  data,
  sayHello,
  storage
});



// create a new API stack
const apiStack = backend.createStack("api-stack");


const table = new Table(apiStack, 'AttachmentTable12345', {
  tableName: 'AttachmentTable12345',
  partitionKey: {
    name: 'id',
    type: AttributeType.STRING,
  }
});

const lambdaFunction = backend.sayHello.resources.lambda as Function;
lambdaFunction.addEnvironment('DYNAMODB_TABLE_NAME_MASTER', 'AttachmentTable12345');


const statement = new iam.PolicyStatement({
  sid: "AllowAllDynamo",
  actions: ["dynamodb:*"],
  resources: ["*"],
})


lambdaFunction.addToRolePolicy(statement)



// create a new REST API
const myRestApi = new RestApi(apiStack, "RestApi", {
  restApiName: "goldenRestApi",
  deploy: true,
  deployOptions: {
    stageName: "dev",
  },
  defaultCorsPreflightOptions: {
    allowOrigins: Cors.ALL_ORIGINS, // Restrict this to domains you trust
    allowMethods: Cors.ALL_METHODS, // Specify only the methods you need to allow
    allowHeaders: Cors.DEFAULT_HEADERS, // Specify only the headers you need to allow
  },
});

// create a new Lambda integration
const lambdaIntegration = new LambdaIntegration(
  backend.sayHello.resources.lambda
);


// const param = new StringParameter(apiStack, 'param1', {parameterName: "ATTACHMENTS_TABLE", stringValue: "AttachmentTable12345"})
// backend.sayHello.resources.cfnResources.cfnFunction.addOverride("Environment.ATTACHMENTS_TABLE","SomeHeart")



// create a new resource path with IAM authorization
const itemsPath = myRestApi.root.addResource("items", {
  defaultMethodOptions: {
    authorizationType: AuthorizationType.IAM,
  },
});

// add methods you would like to create to the resource path
itemsPath.addMethod("GET", lambdaIntegration);
itemsPath.addMethod("POST", lambdaIntegration);
itemsPath.addMethod("DELETE", lambdaIntegration);
itemsPath.addMethod("PUT", lambdaIntegration);

// add a proxy resource path to the API
itemsPath.addProxy({
  anyMethod: true,
  defaultIntegration: lambdaIntegration,
});

// create a new Cognito User Pools authorizer
const cognitoAuth = new CognitoUserPoolsAuthorizer(apiStack, "CognitoAuth", {
  cognitoUserPools: [backend.auth.resources.userPool],
});

// create a new resource path with Cognito authorization
const booksPath = myRestApi.root.addResource("cognito-auth-path");
booksPath.addMethod("GET", lambdaIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuth,
});

// create a new IAM policy to allow Invoke access to the API
const apiRestPolicy = new Policy(apiStack, "RestApiPolicy", {
  statements: [
    new PolicyStatement({
      actions: ["execute-api:Invoke"],
      resources: [
        `${myRestApi.arnForExecuteApi("*", "/items", "dev")}`,
        `${myRestApi.arnForExecuteApi("*", "/items/*", "dev")}`,
        `${myRestApi.arnForExecuteApi("*", "/cognito-auth-path", "dev")}`,
      ],
    }),
  ],
});



// attach the policy to the authenticated and unauthenticated IAM roles
backend.auth.resources.authenticatedUserIamRole.attachInlinePolicy(
  apiRestPolicy
);
backend.auth.resources.unauthenticatedUserIamRole.attachInlinePolicy(
  apiRestPolicy
);

// add outputs to the configuration file
backend.addOutput({
  custom: {
    API: {
      [myRestApi.restApiName]: {
        endpoint: myRestApi.url,
        region: Stack.of(myRestApi).region,
        apiName: myRestApi.restApiName,
      },
    },
  },
});