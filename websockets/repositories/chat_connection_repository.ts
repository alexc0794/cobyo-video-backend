import BaseRepository from './base_repository';

type Chat = {
  connection_id: string,
  connected_at: string,
};

export default class ChatConnectionRepository extends BaseRepository {

  table_name = 'ChatConnections';

  async create_chat_connection(connection_id): Promise<Chat> {
    const item: Chat = {
      'connection_id': connection_id,
      'connected_at': (new Date()).toISOString(),
    };

    return new Promise((resolve, reject) =>
      this.aws_client.put({
        'TableName': this.table_name,
        'Item': item
      }, (err, data) => {
        if (err) {
          console.error('Failed to update ChatConnections', connection_id, err);
          return reject();
        }
        return resolve(item);
      })
    );
  }

  async remove_chat_connection(connection_id): Promise<void> {
    return new Promise((resolve, reject) =>
      this.aws_client.delete({
        'TableName': this.table_name,
        'Key': {
          'HashKey': connection_id,
        }
      }, (err, data) => {
        if (err) {
          console.error('Failed to delete ChatCOnnections', connection_id, err);
          return reject();
        }
        return resolve();
      })
    );
  }


}
