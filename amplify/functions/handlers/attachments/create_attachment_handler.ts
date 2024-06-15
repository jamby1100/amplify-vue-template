// import { Handler } from 'aws-lambda';
// import { env } from '$amplify/env/say-hello'; // the import is '$amplify/env/<function name>'

// export const handler: Handler = async (event, context) => {
//   // the env object has intellisense for all environment variables that are available to the function
//   return `Hello, ${env.NAME}!`;
// };

import type { APIGatewayProxyHandler } from "aws-lambda";
import { env } from '$amplify/env/say-hello';
import { SuccessHelper } from '../../helpers/response_helper'
import { DynamodbWrite } from '../../gateways/dynamodb_gateway'

let tableName = env.DYNAMODB_TABLE_NAME_MASTER;

interface EventBody {
  todoId: string,
  imagePath: string
}

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log("event", event);
  console.log("and the event body is")

  let event_body: EventBody = JSON.parse(event.body || "{}");

  let item = {
    todoId: {
      S: event_body.todoId
    },
    imagePath: {
      S: event_body.imagePath
    }
  }

  let response = await DynamodbWrite(tableName, item)

  console.log("this is the result")
  console.log('RESPONSE:');

  console.log(JSON.stringify(response));
  console.log("ENV")
  console.log(JSON.stringify(tableName))

  return SuccessHelper({"reso": `Hello from the other side! ${tableName}`});
};