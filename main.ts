import { DynamoDB, Endpoint } from 'aws-sdk';
import { ScanInput } from 'aws-sdk/clients/dynamodb';
import { config as fromFile } from 'dotenv';

fromFile({ path: '.env' });

const config = {
  tableName: process.env.TABLE_NAME as string,
  fromCreatedAt: process.env.FROM_CREATED_AT,
  toCreatedAt: process.env.TO_CREATED_AT,
};

async function main() {
  const dynamo = new DynamoDB({
    region: 'us-east-1',
    accessKeyId: 'accessKeyId',
    secretAccessKey: 'secretAccessKey',
    endpoint: new Endpoint('http://localhost:8000'),
  });

  const scan = {
    TableName: config.tableName,
    FilterExpression: 'created_at BETWEEN :fromCreatedAt AND :toCreatedAt',
    ExpressionAttributeValues: {
      ':fromCreatedAt': { N: config.fromCreatedAt },
      ':toCreatedAt': { N: config.toCreatedAt },
    },
  } as ScanInput;

  const idsToDelete = (await dynamo.scan(scan).promise()).Items?.map(
    (item) => item.id.S,
  ) as string[];

  console.log(idsToDelete);

  const promises = [];
  while (idsToDelete.length !== 0) {
    const ids = idsToDelete.splice(0, 25);
    const promise = dynamo
      .batchWriteItem({
        RequestItems: {
          [config.tableName]: ids.map((id) => ({
            DeleteRequest: {
              Key: {
                id: {
                  S: id,
                },
              },
            },
          })),
        },
      })
      .promise();
    promises.push(promise);
  }

  // await Promise.all(promises);
}

main();
