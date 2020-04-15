import { TABLE_NAMES } from './shared';
import { AWS_CONFIG } from '../config';

const AWS = require('aws-sdk');
AWS.config.update(AWS_CONFIG);

const dynamodb = new AWS.DynamoDB();

function deleteTable(tableName: string): void {
  dynamodb.deleteTable({ TableName: tableName }, (err, data) => {
    if (err) {
      console.error(`❌ Unable to delete ${tableName}`, err.message, err.code);
    } else {
      console.log(`✅ Deleted table ${tableName}`);
    }
  });
}

TABLE_NAMES.forEach((tableName: string) => deleteTable(tableName));
