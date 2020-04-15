import BaseRepository from './base_repository';
import { Transcript } from '../interfaces/transcript';

export default class TranscriptRepository extends BaseRepository {

  tableName = 'Transcripts';

  async getTranscriptsByChannelId(channelId: string): Promise<Array<Transcript>> {
    return new Promise((resolve, reject) => {
      this.awsClient.query({
        TableName: this.tableName,
        ProjectionExpression: 'channelId, body, addedAt',
        KeyConditionExpression: 'channelId = :channelId and addedAt < :addedAt',
        ExpressionAttributeValues: {
          ':channelId': channelId,
          ':addedAt': (new Date()).toISOString(),
        }
      }, (err, data) => {
        if (err) {
          console.error('Could not get transcripts by channel id', channelId, err);
          return resolve([]);
        }
        return resolve(data.Items);
      });
    });
  }

  async saveTranscript(channelId: string, body: string): Promise<boolean> {
    const SECONDS_IN_AN_HOUR = 60 * 60;
    const secondsSinceEpoch = Math.round(Date.now() / 1000);
    const item = {
      channelId,
      body,
      addedAt: (new Date()).toISOString(),
      expiringAtSeconds: secondsSinceEpoch + SECONDS_IN_AN_HOUR
    };
    return new Promise((resolve, reject) => {
      this.awsClient.put({
        TableName: this.tableName,
        Item: item,
      }, (err, data) => {
        if (err) {
          console.error('Failed to save transcript', channelId, err);
          return resolve(false);
        }
        return resolve(true);
      });
    });
  }

}
