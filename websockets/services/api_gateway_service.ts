const AWS = require('aws-sdk');
import { AWS_CONFIG } from '../../config';
import { ChatMessage } from '../interfaces/chat';

AWS.config.update(AWS_CONFIG);


export default class ApiGatewayService {

  aws_client

  constructor(endpoint: string) {
    this.aws_client = new AWS.ApiGatewayManagementApi({
      apiVersion: '2018-11-29',
      endpoint
    });
  }

  async send(connection_id: string, chat_message: ChatMessage) {
    try {
      await this.aws_client.postToConnection({
        'ConnectionId': connection_id,
        'Data': JSON.stringify(chat_message),
      }).promise();
    } catch (e) {
      console.warn('Failed to send message', connection_id, JSON.stringify(chat_message), e);
    }
  }
}
