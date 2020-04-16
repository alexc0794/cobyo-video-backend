import { ChatMessage } from '../interfaces/chat';
import BaseRepository from './base_repository';

export default class ChatMessageRepository extends BaseRepository {

  tableName = 'ChatMessages';

  createMessage(chatMessage: ChatMessage): Promise<boolean> {
    const SECONDS_IN_AN_HOUR = 60 * 60;
    const secondsSinceEpoch = Math.round(Date.now() / 1000);
    return new Promise((resolve, reject) =>
      this.awsClient.put({
        TableName: this.tableName,
        Item: {
          ...chatMessage,
          expiringAt: secondsSinceEpoch + SECONDS_IN_AN_HOUR // Expire a chat message after an hour
        }
      }, (err, data) => {
        if (err) {
          console.error('Failed to create message', chatMessage, err);
          return resolve(false);
        }
        return resolve(true);
      })
    );
  }

  getMessage(messageId: string): Promise<ChatMessage> {
    return new Promise((resolve, reject) =>
      this.awsClient.query({
        TableName: this.tableName,
        KeyConditionExpression: 'messageId = :messageId',
        ExpressionAttributeValues: {
          ':messageId': messageId,
        },
      }, (err, data) => {
        if (err) {
          console.error('Could not get message', messageId, err);
          return reject();
        }
        if (data.Items.length === 0) {
          console.error('No message found', messageId);
          return reject();
        }
        return resolve(data.Items[0]);
      })
    );
  }

  getMessages(beforeSentAt: string, limit: number): Promise<Array<ChatMessage>> {
    return new Promise((resolve, reject) =>
      this.awsClient.query({
        TableName: this.tableName,
        Limit: limit,
        KeyConditionExpression: 'sentAt < :beforeSentAt',
        ExpressionAttributeValues: { ':beforeSentAt': beforeSentAt }
      }, (err, data) => {
        if (err) {
          console.error('Failed to get messages', limit, beforeSentAt);
          return reject([])
        }
        return resolve(data.Items);
      })
    );
  }

}
