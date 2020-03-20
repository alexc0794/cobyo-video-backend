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
      console.error('Unable to create Tables', JSON.stringify(err, null, 2));
    } else {
      console.log("Created Tables", JSON.stringify(data, null, 2));
    }
  }
);

dynamodb.createTable(
  {
    TableName: 'Transcripts',
    KeySchema: [
      { AttributeName: 'table_id', KeyType: 'HASH' },
      { AttributeName: 'added_at', KeyType: 'RANGE' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'table_id', AttributeType: 'S' },
      { AttributeName: 'added_at', AttributeType: 'S' }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 10,
      WriteCapacityUnits: 10
    }
  },
  (err, data) => {
    if (err) {
      console.error('Unable to create Transcripts', JSON.stringify(err, null, 2));
    } else {
      console.log("Created Transcripts", JSON.stringify(data, null, 2));
    }
  }
);
