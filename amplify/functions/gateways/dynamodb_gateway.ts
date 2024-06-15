import { DynamoDBClient, PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';

export const DynamodbQuery = async function (tableName: string, partitionKey: string) {
    let dynamoClient = new DynamoDBClient({ region: process.env.REGION });

    const command = new QueryCommand({
        TableName: tableName,
        KeyConditionExpression:
          "todoId = :id",
        ExpressionAttributeValues: {
          ":id": {"S": partitionKey}
        }
      });
    
    let response:any = {}
    
    await dynamoClient.send(command).then((result) => {
      console.log("data:" + result);
      response = result;
    })
    .catch((err) => {
      console.log("err", err);
    });;

    console.log("AND THE RESPONSE IS ")
    console.log(response)

    return response
}

export const DynamodbWrite = async function (tableName: string, item: any) {
    let dynamoClient = new DynamoDBClient({ region: process.env.REGION });

    const command = new PutItemCommand({
        TableName: tableName,
        Item: item
    })
    
    const response = await dynamoClient.send(command);
}