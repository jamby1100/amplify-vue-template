// import { Handler } from 'aws-lambda';
// import { env } from '$amplify/env/say-hello'; // the import is '$amplify/env/<function name>'

// export const handler: Handler = async (event, context) => {
//   // the env object has intellisense for all environment variables that are available to the function
//   return `Hello, ${env.NAME}!`;
// };

import type { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { env } from '$amplify/env/say-hello';

let dynamoClient = new DynamoDBClient({ region: process.env.REGION });
let tableName = "Comment-t4jud5oxdzcxlhatv5xyxwh2pu-NONE"

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log("event", event);

  const command = new QueryCommand({
    // The tableName is correct and verified against the CF template
    TableName: tableName,
    ExpressionAttributeValues: {
      ':id': { S: 'da50b3fd-3766-42c3-9ba7-7ddee3aa3a0f' },
    },
    // I tryied all these variations
    // and also tryied removing ExpressionAttributeValues
    KeyConditionExpression: 'id = :id',
  });
  const response = dynamoClient.send(command);
  console.log("this is the result")
  console.log('RESPONSE:');

  let table_name = env.DYNAMODB_TABLE_NAME_MASTER;

  console.log(JSON.stringify(response));
  console.log("ENV")
  console.log(JSON.stringify(table_name))

  return {
    statusCode: 200,
    // Modify the CORS settings below to match your specific requirements
    headers: {
      "Access-Control-Allow-Origin": "*", // Restrict this to domains you trust
      "Access-Control-Allow-Headers": "*", // Specify only the headers you need to allow
    },
    body: JSON.stringify(`Hello from the other side! ${table_name}`),

  };
};