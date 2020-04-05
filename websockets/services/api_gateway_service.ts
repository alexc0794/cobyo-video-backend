const AWS = require('aws-sdk');
import { AWS_CONFIG } from '../../config';

AWS.config.update(AWS_CONFIG);


export default class ApiGatewayService {

  aws_client

  constructor(endpoint: string) {
    this.aws_client = new AWS.ApiGatewayManagementApi({
      apiVersion: '2018-11-29',
      endpoint
    });
  }

  async send(connection_id: string, message: string) {
    const response = await this.aws_client.postToConnection({
      'ConnectionId': connection_id,
      'Data': message,
    }).promise();
    console.log('Sent?', response);
  }
}
