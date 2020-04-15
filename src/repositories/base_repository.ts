const AWS = require('aws-sdk');
import { AWS_CONFIG } from '../../config';

AWS.config.update(AWS_CONFIG);

export default abstract class BaseRepository {

  tableName?: string;

  awsClient

  constructor() {
    this.awsClient = new AWS.DynamoDB.DocumentClient()
  }
}
