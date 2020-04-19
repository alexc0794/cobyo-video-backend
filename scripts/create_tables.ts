import { TABLES_WITH_TTL } from './shared';
import { AWS_CONFIG } from '../config';

const AWS = require('aws-sdk');
AWS.config.update(AWS_CONFIG);

const dynamodb = new AWS.DynamoDB();

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
      AttributeName: 'expiringAtSeconds',
      Enabled: true,
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
  TableName: 'Channels',
  KeySchema: [
    { AttributeName: 'channelId', KeyType: 'HASH' }
  ],
  AttributeDefinitions: [
    { AttributeName: 'channelId', AttributeType: 'S' },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  }
});

createTable({
  TableName: 'Transcripts',
  KeySchema: [
    { AttributeName: 'channelId', KeyType: 'HASH' },
    { AttributeName: 'addedAt', KeyType: 'RANGE' }
  ],
  AttributeDefinitions: [
    { AttributeName: 'channelId', AttributeType: 'S' },
    { AttributeName: 'addedAt', AttributeType: 'S' }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  },
});

createTable({
  TableName: 'Users',
  KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
  AttributeDefinitions: [
    { AttributeName: 'userId', AttributeType: 'S' },
    { AttributeName: 'facebookUserId', AttributeType: 'S' },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  },
  GlobalSecondaryIndexes: [{
    IndexName: 'FacebookUserIndex',
    KeySchema: [{ AttributeName: 'facebookUserId', KeyType: 'HASH' }],
    Projection: { ProjectionType: 'KEYS_ONLY' },
    ProvisionedThroughput: {
      ReadCapacityUnits: 2,
      WriteCapacityUnits: 2,
    }
  }]
});

createTable({
  TableName: 'ChatMessages',
  KeySchema: [
    { AttributeName: 'messageId', KeyType: 'HASH' },
    { AttributeName: 'sentAt', KeyType: 'RANGE' }
  ],
  AttributeDefinitions: [
    { AttributeName: 'messageId', AttributeType: 'S' },
    { AttributeName: 'sentAt', AttributeType: 'S' }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5
  },
});

createTable({
  TableName: 'ChannelConnections',
  KeySchema: [
    { AttributeName: 'channelId', KeyType: 'HASH' },
    { AttributeName: 'connectionId', KeyType: 'RANGE' },
  ],
  AttributeDefinitions: [
    { AttributeName: 'channelId', AttributeType: 'S' },
    { AttributeName: 'connectionId', AttributeType: 'S' },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5
  },
  GlobalSecondaryIndexes: [{
    IndexName: 'ConnectionChannelIndex',
    KeySchema: [{ AttributeName: 'connectionId', KeyType: 'HASH' }],
    Projection: { ProjectionType: 'ALL' },
    ProvisionedThroughput: {
      ReadCapacityUnits: 2,
      WriteCapacityUnits: 2
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

createTable({
  TableName: 'SpotifyTokens',
  KeySchema: [
    { AttributeName: 'user_id', KeyType: 'HASH' }
  ],
  AttributeDefinitions: [
    { AttributeName: 'user_id', AttributeType: 'S' },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  }
});

createTable({
  TableName: 'CurrentlyPlaying',
  KeySchema: [
    { AttributeName: 'channelId', KeyType: 'HASH' }
  ],
  AttributeDefinitions: [
    { AttributeName: 'channelId', AttributeType: 'S' },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  }
});
