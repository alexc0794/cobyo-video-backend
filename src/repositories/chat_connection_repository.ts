import { ChatConnection } from '../interfaces/chat';
import BaseRepository from './base_repository';


export default class ChatConnectionRepository extends BaseRepository {

  table_name = 'ChatConnections';

  async create_chat_connection(connection_id): Promise<ChatConnection> {
    const SECONDS_IN_A_DAY = 60 * 60 * 24;
    const seconds_since_epoch = Math.round(Date.now() / 1000);
    const chat_connection: ChatConnection = {
      'connection_id': connection_id,
      'connected_at': (new Date()).toISOString(),
    };
    return new Promise((resolve, reject) =>
      this.aws_client.put({
        'TableName': this.table_name,
        'Item': {
          ...chat_connection,
          'expiring_at': seconds_since_epoch + SECONDS_IN_A_DAY // Kill a chat connection after a day
        }
      }, (err, data) => {
        if (err) {
          console.error('Failed to create connection', connection_id, err);
          return reject();
        }
        return resolve(chat_connection);
      })
    );
  }

  async remove_chat_connection(connection_id): Promise<void> {
    return new Promise((resolve, reject) =>
      this.aws_client.delete({
        'TableName': this.table_name,
        'Key': {
          'connection_id': connection_id,
        }
      }, (err, data) => {
        if (err) {
          console.error('Failed to delete connection', connection_id, err);
          return reject();
        }
        return resolve();
      })
    );
  }

  async get_connections(): Promise<Array<ChatConnection>> {
    return new Promise((resolve, reject) =>
      this.aws_client.scan({
        'TableName': this.table_name,
      }, (err, data) => {
        if (err) {
          console.error('Failed to get connections', err);
          return reject();
        }
        return resolve(data.Items);
      })
    );
  }
}
