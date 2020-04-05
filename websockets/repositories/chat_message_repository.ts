import { ChatMessage } from '../interfaces/chat';
import BaseRepository from './base_repository';

export default class ChatMessageRepository extends BaseRepository {

  table_name = 'ChatMessages';

  async create_message(chat_message: ChatMessage): Promise<boolean> {
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
}
