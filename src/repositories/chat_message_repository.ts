import { ChatMessage } from '../interfaces/chat';
import BaseRepository from './base_repository';

export default class ChatMessageRepository extends BaseRepository {

  table_name = 'ChatMessages';

  create_message(chat_message: ChatMessage): Promise<boolean> {
    const SECONDS_IN_AN_HOUR = 60 * 60;
    const seconds_since_epoch = Math.round(Date.now() / 1000);
    return new Promise((resolve, reject) =>
      this.aws_client.put({
        'TableName': this.table_name,
        'Item': {
          ...chat_message,
          'expiring_at': seconds_since_epoch + SECONDS_IN_AN_HOUR // Expire a chat message after an hour
        }
      }, (err, data) => {
        if (err) {
          console.error('Failed to create message', chat_message, err);
          return resolve(false);
        }
        return resolve(true);
      })
    );
  }

  get_message(message_id: string): Promise<ChatMessage> {
    return new Promise((resolve, reject) =>
      this.aws_client.query({
        'TableName': this.table_name,
        'KeyConditionExpression': 'message_id = :message_id',
        'ExpressionAttributeValues': {
          ':message_id': message_id,
        },
      }, (err, data) => {
        if (err) {
          console.error(err);
          return reject();
        }
        if (!data.Items || data.Items.length === 0) {
          console.error('No message found', message_id);
          return reject();
        }

        return resolve(data.Items[0]);
      })
    );
  }

  get_messages(before_sent_at: string|null, limit: number): Promise<Array<ChatMessage>> {
    const params = {
      'TableName': this.table_name,
      'Limit': limit,
    };
    if (before_sent_at) {
      params['FilterExpression'] = 'sent_at < :before_sent_at';
      params['ExpressionAttributeValues'] = {
        ':before_sent_at': before_sent_at,
      };
    }

    return new Promise((resolve, reject) =>
      this.aws_client.scan(params, (err, data) => {
        if (err) {
          console.error('Failed to get messages', limit, before_sent_at);
          return resolve([]);
        }
        return resolve(data.Items);
      })
    );
  }

}
