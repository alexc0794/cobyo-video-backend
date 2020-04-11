const AWS = require('aws-sdk');
import { AWS_CONFIG } from '../../config';
import { ChatMessage } from '../interfaces/chat';

AWS.config.update(AWS_CONFIG);

export default class ApiGatewayService {

  awsClient

  constructor(endpoint: string) {
    this.awsClient = new AWS.ApiGatewayManagementApi({
      apiVersion: '2018-11-29',
      endpoint
    });
  }

  async send(connectionId: string, payload: any) {
    try {
      await this.awsClient.postToConnection({
        'ConnectionId': connectionId,
        'Data': JSON.stringify(payload),
      }).promise();
    } catch (e) {
      console.warn('Failed to send', connectionId, JSON.stringify(payload), e);
    }
  }
}
