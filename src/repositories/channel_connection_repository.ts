import { ChannelConnection } from '../interfaces/channel';
import BaseRepository from './base_repository';


export default class ChannelConnectionRepository extends BaseRepository {

  table_name = 'ChannelConnections';

  async createChannelConnection(channelId: string, connectionId: string, userId: string): Promise<ChannelConnection> {
    const SECONDS_IN_A_DAY = 60 * 60 * 24;
    const secondsSinceEpoch = Math.round(Date.now() / 1000);
    const channelConnection: ChannelConnection = {
      'channel_id': channelId,
      'connection_id': connectionId,
      'user_id': userId,
      'connected_at': (new Date()).toISOString(),
    };
    return new Promise((resolve, reject) =>
      this.aws_client.put({
        'TableName': this.table_name,
        'Item': {
          ...channelConnection,
          'expiring_at': secondsSinceEpoch + SECONDS_IN_A_DAY // Kill a channel connection after a day
        }
      }, (err, data) => {
        if (err) {
          console.error('Failed to create connection', connectionId, err);
          return reject();
        }
        return resolve(channelConnection);
      })
    );
  }

  async removeChannelConnection(channelId: string, connectionId: string): Promise<void> {
    return new Promise((resolve, reject) =>
      this.aws_client.delete({
        'TableName': this.table_name,
        'Key': {
          'channel_id': channelId,
          'connection_id': connectionId,
        }
      }, (err, data) => {
        if (err) {
          console.error('Failed to delete connection', connectionId, channelId, err);
          return reject();
        }
        return resolve();
      })
    );
  }

  async getChannelByConnectionId(connectionId: string): Promise<ChannelConnection|null> {
    return new Promise((resolve, reject) =>
      this.aws_client.query({
        'TableName': this.table_name,
        'IndexName': 'ConnectionChannelIndex',
        'KeyConditionExpression': 'connection_id = :connection_id',
        'ExpressionAttributeValues': { ':connection_id': connectionId },
      }, (err, data) => {
        if (err) {
          console.error('Failed to get channel with connection id', connectionId, err);
          return resolve(null);
        }
        if (data && data.Items && data.Items.length > 0) {
          return resolve(data.Items[0]);
        }
        return resolve(null);
      })
    );
  }

  async getChannelConnections(channelId: string): Promise<Array<ChannelConnection>> {
    return new Promise((resolve, reject) =>
      this.aws_client.query({
        'TableName': this.table_name,
        'KeyConditionExpression': 'channel_id = :channel_id',
        'ExpressionAttributeValues': {
          ':channel_id': channelId,
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
