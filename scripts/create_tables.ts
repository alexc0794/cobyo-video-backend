import { AWS_CONFIG } from '../config';

const AWS = require('aws-sdk');
AWS.config.update(AWS_CONFIG);

const dynamodb = new AWS.DynamoDB();

const TABLES_WITH_TTL = [
  'ActiveUsers',
  'ChannelConnections',
  'ChatConnections',
  'ChatMessages',
  'Transcripts',
  'UserInventory',
];

function createTable(params: any): void {
  dynamodb.createTable(params, (err, data) => {
    if (err) {
      console.error(`❌ Unable to create ${params.TableName}`, err.message, err.code);
    } else {
      console.log(`✅ Created table ${params.TableName}`);
      if (TABLES_WITH_TTL.includes(params.TableName)) {
        updateTTL(params.TableName);
      }
    }
  });
}

function updateTTL(tableName: string): void {
  dynamodb.updateTimeToLive({
    TableName: tableName,
    TimeToLiveSpecification: {
      AttributeName: 'expiring_at',
      Enabled: true
    }
  }, (err, data) => {
    if (err) {
      console.error(`❌ Unable to update TTL for ${tableName}`, err.message, err.code);
    } else {
      console.log(`✅ Created TTL for ${tableName}`);
    }
  });
}

createTable({
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
});

createTable({
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
  },
});

createTable({
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
});

createTable({
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
  },
});

createTable({
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
  },
});

createTable({
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
  },
});

createTable({
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
  },
  GlobalSecondaryIndexes: [{
     // We want to check if a user has already logged in with their Facebook account before creating a new user account
    IndexName: 'ConnectionChannelIndex',
    KeySchema: [
      { AttributeName: 'connection_id', KeyType: 'HASH' }
    ],
    Projection: { ProjectionType: 'ALL' },
    ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
    }
  }]
});

createTable({
  TableName: 'UserInventory',
  KeySchema: [
    { AttributeName: 'userId', KeyType: 'HASH' },
    { AttributeName: 'itemIdPurchasedAt', KeyType: 'RANGE' },
  ],
  AttributeDefinitions: [
    { AttributeName: 'userId', AttributeType: 'S' },
    { AttributeName: 'itemIdPurchasedAt', AttributeType: 'S' },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5
  },
});
