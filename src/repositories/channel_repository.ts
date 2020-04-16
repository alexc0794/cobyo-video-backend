import BaseRepository from './base_repository';
import { VideoConnection, TableShape } from '../enums';
import { Channel, Seat } from '../interfaces';

export default class ChannelsRepository extends BaseRepository {

  tableName = 'Channels';

  async getChannelById(channelId: string): Promise<Channel|null> {
    return new Promise((resolve, reject) =>
      this.awsClient.get({
        TableName: this.tableName,
        Key: { channelId },
      }, (err, data) => {
        if (err) {
          console.error('Could not find channel', channelId, err);
          return resolve(null);
        }
        return resolve(data.Item);
      })
    );
  }

  async getChannelsByIds(channelIds: Array<string>): Promise<Array<Channel>> {
    if (channelIds.length === 0) {
      return Promise.resolve([]);
    }

    return new Promise((resolve, reject) =>
      this.awsClient.batchGet({
        RequestItems: {
          [this.tableName]: {
            Keys: channelIds.map((channelId: string) => ({ channelId }))
          }
        }
      }, (err, data) => {
        if (err) {
          console.error('Could not get channels by ids', channelIds, err);
          return resolve([]);
        }
        if (data && data.Responses && data.Responses[this.tableName]) {
          return resolve(data.Responses[this.tableName]);
        }
        return resolve([]);
      })
    );
  }

  async updateChannel(
    channelId: string,
    seats: Array<Seat|null>,
    channelName: string,
    videoConnection: VideoConnection,
    tableShape: TableShape,
  ): Promise<Channel> {
    const item: Channel = {
      channelId,
      seats,
      channelName,
      videoConnection,
      tableShape,
      lastUpdatedAt: (new Date()).toISOString(),
    };
    return new Promise((resolve, reject) =>
      this.awsClient.put({
        TableName: this.tableName,
        Item: item
      }, (err, data) => {
        if (err) {
          console.error('Failed to update channel', channelId, err);
          return reject();
        }
        return resolve(item);
      })
    );
  }

  async leaveChannel(channelId: string, userId: string): Promise<Channel> {
    let channel: Channel|null = await this.getChannelById(channelId);
    if (!channel) {
      return Promise.reject(null);
    }
    const seats = channel.seats.map(seat => seat && seat.userId !== userId ? seat : null);
    try {
      channel = await this.updateChannel(
        channelId,
        seats,
        channel.channelName,
        channel.videoConnection,
        channel.tableShape,
      );
    } catch {
      return Promise.reject(null);
    }
    return channel;
  }

  async updateChannelName(channelId: string, name: string): Promise<Channel> {
    return new Promise((resolve, reject) =>
      this.awsClient.update({
        TableName: this.tableName,
        Key: { channelId },
        UpdateExpression: 'SET channelName = :name',
        ExpressionAttributeValues: { ':name': name },
        ReturnValues: 'ALL_NEW',
      }, (err, data) => {
        if (err) {
          console.error('Failed to update channel', channelId, name, err);
          return reject();
        }
        return resolve(data.Attributes);
      })
    )
  }
}
