import { AWS_CONFIG } from '../config';

const AWS = require('aws-sdk')
AWS.config.update(AWS_CONFIG);

const dynamodb = new AWS.DynamoDB();

dynamodb.createTable(
  {
    TableName: 'Tables',
    KeySchema: [
      { AttributeName: 'table_id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'table_id', AttributeType: 'S' },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 10,
      WriteCapacityUnits: 10
    }
  },
  (err, data) => {
    if (err) {
      console.error('Unable to create CafeteriaTables', JSON.stringify(err, null, 2));
    } else {
      console.log("Created CafeteriaTables", JSON.stringify(data, null, 2));
    }
  }
)
