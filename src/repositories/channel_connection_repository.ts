import { ChannelConnection } from '../interfaces/channel';
import BaseRepository from './base_repository';


export default class ChannelConnectionRepository extends BaseRepository {

  tableName = 'ChannelConnections';

  async createChannelConnection(
    channelId: string,
    connectionId: string,
    userId: string,
  ): Promise<ChannelConnection> {
    const SECONDS_IN_A_DAY = 60 * 60 * 24;
    const secondsSinceEpoch = Math.round(Date.now() / 1000);
    const channelConnection: ChannelConnection = {
      channelId,
      connectionId,
      userId,
      connectedAt: (new Date()).toISOString(),
    };
    return new Promise((resolve, reject) =>
      this.awsClient.put({
        TableName: this.tableName,
        Item: {
          ...channelConnection,
          expiringAtSeconds: secondsSinceEpoch + SECONDS_IN_A_DAY // Kill a channel connection after a day
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

  async removeChannelConnection(channelId: string, connectionId: string): Promise<boolean> {
    return new Promise((resolve, reject) =>
      this.awsClient.delete({
        TableName: this.tableName,
        Key: { channelId, connectionId }
      }, (err, data) => {
        if (err) {
          console.error('Failed to delete connection', channelId, connectionId, err);
          return resolve(false);
        }
        return resolve(true);
      })
    );
  }

  async getChannelByConnectionId(connectionId: string): Promise<ChannelConnection|null> {
    return new Promise((resolve, reject) =>
      this.awsClient.query({
        TableName: this.tableName,
        IndexName: 'ConnectionChannelIndex',
        KeyConditionExpression: 'connectionId = :connectionId',
        ExpressionAttributeValues: { ':connectionId': connectionId },
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
      this.awsClient.query({
        TableName: this.tableName,
        KeyConditionExpression: 'channelId = :channelId',
        ExpressionAttributeValues: {
          ':channelId': channelId,
        }
      }, (err, data) => {
        if (err) {
          console.error('Failed to get channel connections', channelId, err);
          return resolve([]);
        }
        return resolve(data.Items);
      })
    );
  }

}
