// import { Handler } from 'aws-lambda';
// import { env } from '$amplify/env/say-hello'; // the import is '$amplify/env/<function name>'

// export const handler: Handler = async (event, context) => {
//   // the env object has intellisense for all environment variables that are available to the function
//   return `Hello, ${env.NAME}!`;
// };

import type { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient, PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { env } from '$amplify/env/say-hello';
import { SuccessHelper } from '../../helpers/response_helper'
import { DynamodbQuery } from '../../gateways/dynamodb_gateway'

let tableName = env.DYNAMODB_TABLE_NAME_MASTER;

interface EventBody {
  todoId: string
}

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log("event", event);
  console.log("and the event body is")

  let itemId:string = event.pathParameters!.item || ""

  console.log("and the item id is")
  console.log(itemId)

  let response = await DynamodbQuery(tableName, itemId)

  console.log("this is the result")
  console.log('RESPONSE:');

  console.log(JSON.stringify(response));
  console.log("ENV")
  console.log(JSON.stringify(tableName))

  return SuccessHelper({"data": response.Items});
};