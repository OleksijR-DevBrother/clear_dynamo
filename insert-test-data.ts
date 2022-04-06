import { DynamoDB, Endpoint } from 'aws-sdk';
import { config as fromFile } from 'dotenv';

fromFile({ path: '.env' });

const config = {
  tableName: process.env.TABLE_NAME as string,
};

// const testItems = [
//   {
//     id: '1',
//     created_at: 4,
//   },
//   {
//     id: '2',
//     created_at: 1,
//   },
//   {
//     id: '3',
//     created_at: 6,
//   },
//   {
//     id: '4',
//     created_at: 2,
//   },
//   {
//     id: '5',
//     created_at: 3,
//   },
//   {
//     id: '6',
//     created_at: 7,
//   },
//   {
//     id: '7',
//     created_at: 5,
//   },
// ];

const testItems: Array<{ id: string; created_at: number }> = [];
for (let i = 1; i < 10000; i++) {
  testItems.push({
    id: String(i),
    created_at: i,
  });
}

async function main() {
  const dynamo = new DynamoDB.DocumentClient({
    region: 'us-east-1',
    accessKeyId: 'accessKeyId',
    secretAccessKey: 'secretAccessKey',
    endpoint: new Endpoint('http://localhost:8000'),
  });

  while (testItems.length !== 0) {
    const items = testItems.splice(0, 25);
    dynamo
      .batchWrite({
        RequestItems: {
          [config.tableName]: items.map((item) => ({
            PutRequest: {
              Item: item,
            },
          })),
        },
      })
      .promise();
  }

  // console.log(`Inserted ${testItems.length} items`);
}

main();
