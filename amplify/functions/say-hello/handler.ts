// import { Handler } from 'aws-lambda';
// import { env } from '$amplify/env/say-hello'; // the import is '$amplify/env/<function name>'

// export const handler: Handler = async (event, context) => {
//   // the env object has intellisense for all environment variables that are available to the function
//   return `Hello, ${env.NAME}!`;
// };

import type { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient, PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { env } from '$amplify/env/say-hello';

let dynamoClient = new DynamoDBClient({ region: process.env.REGION });
let tableName = env.DYNAMODB_TABLE_NAME_MASTER;

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log("event", event);

  let item = {
    id: {
      S: "some"
    }
  }

  const command = new PutItemCommand({
    TableName: tableName,
    Item: item
  })

  const response = await dynamoClient.send(command);
  console.log("this is the result")
  console.log('RESPONSE:');

  console.log(JSON.stringify(response));
  console.log("ENV")
  console.log(JSON.stringify(tableName))

  return {
    statusCode: 200,
    // Modify the CORS settings below to match your specific requirements
    headers: {
      "Access-Control-Allow-Origin": "*", // Restrict this to domains you trust
      "Access-Control-Allow-Headers": "*", // Specify only the headers you need to allow
    },
    body: JSON.stringify(`Hello from the other side! ${tableName}`),

  };
};