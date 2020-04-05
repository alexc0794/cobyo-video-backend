const AWS = require('aws-sdk');
import { AWS_CONFIG } from '../../config';

AWS.config.update(AWS_CONFIG);

export default abstract class BaseRepository {

  table_name?: string;

  aws_client

  constructor() {
    this.aws_client = new AWS.DynamoDB.DocumentClient()
  }
}
