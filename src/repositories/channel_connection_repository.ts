import { ChannelConnection } from '../interfaces/channel';
import BaseRepository from './base_repository';


export default class ChannelConnectionRepository extends BaseRepository {

  table_name = 'ChannelConnections';

  async create_channel_connection(channel_id: string, connection_id: string): Promise<ChannelConnection> {
    const SECONDS_IN_A_DAY = 60 * 60 * 24;
    const seconds_since_epoch = Math.round(Date.now() / 1000);
    const channel_connection: ChannelConnection = {
      'channel_id': channel_id,
      'connection_id': connection_id,
      'connected_at': (new Date()).toISOString(),
    };
    return new Promise((resolve, reject) =>
      this.aws_client.put({
        'TableName': this.table_name,
        'Item': {
          ...channel_connection,
          'expiring_at': seconds_since_epoch + SECONDS_IN_A_DAY // Kill a channel connection after a day
        }
      }, (err, data) => {
        if (err) {
          console.error('Failed to create connection', connection_id, err);
          return reject();
        }
        return resolve(channel_connection);
      })
    );
  }

  async remove_channel_connection(channel_id: string, connection_id: string): Promise<void> {
    return new Promise((resolve, reject) =>
      this.aws_client.delete({
        'TableName': this.table_name,
        'Key': {
          'channel_id': channel_id,
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

  async get_channel_connections(channel_id: string): Promise<Array<ChannelConnection>> {
    return new Promise((resolve, reject) =>
      this.aws_client.query({
        'TableName': this.table_name,
        'KeyConditionExpression': 'channel_id = :channel_id',
        'ExpressionAttributeValues': {
          ':channel_id': channel_id,
        }
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
