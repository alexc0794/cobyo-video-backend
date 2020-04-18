import { CurrentlyPlaying } from '../interfaces';
import BaseRepository from './base_repository';

export default class ChatMessageRepository extends BaseRepository {

  tableName = 'CurrentlyPlaying';

  updateChannelCurrentlyPlaying(currentlyPlaying: CurrentlyPlaying): Promise<boolean> {
    const SECONDS_IN_TEN_MINUTES = 60 * 10;
    return new Promise((resolve, reject) =>
      this.awsClient.put({
        TableName: this.tableName,
        Item: {
          ...currentlyPlaying,
          expiringAtSeconds: currentlyPlaying.updatedAtMs + SECONDS_IN_TEN_MINUTES // Expire the currently playing song after 10 minutes (songs dont usually go longer than that?)
        }
      }, (err, data) => {
        if (err) {
          console.error('Failed to update currently playing', currentlyPlaying.channelId, err);
          return resolve(false);
        }
        return resolve(true);
      })
    );
  }

  getChannelCurrentlyPlaying(channelId: string): Promise<CurrentlyPlaying> {
    return new Promise((resolve, reject) =>
      this.awsClient.get({
        TableName: this.tableName,
        Key: { channelId },
      }, (err, data) => {
        if (err || !data.Item) {
          console.error('Could not find currently playing for channel', channelId, err);
          return reject();
        }
        return resolve(data.Item);
      })
    );
  }


}
