// import { Handler } from 'aws-lambda';
// import { env } from '$amplify/env/say-hello'; // the import is '$amplify/env/<function name>'

// export const handler: Handler = async (event, context) => {
//   // the env object has intellisense for all environment variables that are available to the function
//   return `Hello, ${env.NAME}!`;
// };

import type { APIGatewayProxyHandler } from "aws-lambda";

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log("event", event);
  return {
    statusCode: 200,
    // Modify the CORS settings below to match your specific requirements
    headers: {
      "Access-Control-Allow-Origin": "*", // Restrict this to domains you trust
      "Access-Control-Allow-Headers": "*", // Specify only the headers you need to allow
    },
    body: JSON.stringify("Hello from the other side!"),

  };
};