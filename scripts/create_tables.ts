import { AWS_CONFIG } from '../config';

const AWS = require('aws-sdk');
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

dynamodb.createTable(
  {
    TableName: 'Users',
    KeySchema: [
      { AttributeName: 'user_id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'user_id', AttributeType: 'S' },
      { AttributeName: 'facebook_user_id', AttributeType: 'S' },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 10,
      WriteCapacityUnits: 10
    },
    GlobalSecondaryIndexes: [{
       // We want to check if a user has already logged in with their Facebook account before creating a new user account
      IndexName: 'FacebookUserIndex',
      KeySchema: [
        { AttributeName: 'facebook_user_id', KeyType: 'HASH' }
      ],
      Projection: { ProjectionType: 'KEYS_ONLY' }, // Should return user_id and facebook_user_id
      ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
      }
    }]
  },
  (err, data) => {
    if (err) {
      console.error('Unable to create Users', JSON.stringify(err, null, 2));
    } else {
      console.log("Created Users", JSON.stringify(data, null, 2));
    }
  }
);

dynamodb.createTable(
  {
    TableName: 'ActiveUsers',
    KeySchema: [
      { AttributeName: 'user_id', KeyType: 'HASH' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'user_id', AttributeType: 'S' },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  },
  (err, data) => {
    if (err) {
      console.error('Unable to create ActiveUsers', JSON.stringify(err, null, 2));
    } else {
      console.log("Created ActiveUsers", JSON.stringify(data, null, 2));
    }
  }
);

dynamodb.createTable(
  {
    TableName: 'ChatConnections',
    KeySchema: [
      { AttributeName: 'connection_id', KeyType: 'HASH' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'connection_id', AttributeType: 'S' },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  },
  (err, data) => {
    if (err) {
      console.error('Unable to create ChatConnections', JSON.stringify(err, null, 2));
    } else {
      console.log("Created ChatConnections", JSON.stringify(data, null, 2));
    }
  }
);

dynamodb.createTable(
  {
    TableName: 'ChatMessages',
    KeySchema: [
      { AttributeName: 'message_id', KeyType: 'HASH' },
      { AttributeName: 'sent_at', KeyType: 'RANGE' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'message_id', AttributeType: 'S' },
      { AttributeName: 'sent_at', AttributeType: 'S' }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  },
  (err, data) => {
    if (err) {
      console.error('Unable to create ChatMessages', JSON.stringify(err, null, 2));
    } else {
      console.log("Created ChatMessages", JSON.stringify(data, null, 2));
    }
  }
);

dynamodb.createTable(
  {
    TableName: 'ChannelConnections',
    KeySchema: [
      { AttributeName: 'channel_id', KeyType: 'HASH' },
      { AttributeName: 'connection_id', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'channel_id', AttributeType: 'S' },
      { AttributeName: 'connection_id', AttributeType: 'S' },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  },
  (err, data) => {
    if (err) {
      console.error('Unable to create ChannelConnections', JSON.stringify(err, null, 2));
    } else {
      console.log("Created ChannelConnections", JSON.stringify(data, null, 2));
    }
  }
);
