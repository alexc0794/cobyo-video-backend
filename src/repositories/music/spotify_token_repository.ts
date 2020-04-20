import { SpotifyToken } from '../../interfaces/music';
import BaseRepository from '../base_repository';

export default class SpotifyTokenRepository extends BaseRepository {

  tableName = 'SpotifyTokens';

  getTokenByUserId(userId: string): Promise<SpotifyToken> {
    return new Promise((resolve, reject) =>
      this.awsClient.get({
        'TableName': this.tableName,
        'Key': {
          user_id: userId
        }
      }, (err, data) => {
        if (err) {
          console.error('Could not find token', userId, err);
          return reject();
        }
        const token: SpotifyToken = {
          userId: data.Item.user_id,
          accessToken: data.Item.accessToken,
          refreshToken: data.Item.refreshToken,
          lastRefreshedAt: data.Item.lastRefreshedAt,
        };
        return resolve(token);
      })
    );
  }

  putToken(userId: string, accessToken: string, refreshToken: string): Promise<void> {
    const SECONDS_IN_AN_HOUR = 60 * 60;
    const secondsSinceEpoch = Math.round(Date.now() / 1000);
    return new Promise((resolve, reject) =>
      this.awsClient.put({
        TableName: this.tableName,
        Item: {
          user_id: userId,
          accessToken,
          refreshToken,
          lastRefreshedAt: (new Date()).toISOString(),
          expiringAtSeconds: secondsSinceEpoch + SECONDS_IN_AN_HOUR // Expire a token after an hour
        }
      }, (err, data) => {
        if (err) {
          console.error('Failed to put token', userId, err);
          return reject();
        }
        return resolve();
      })
    );
  }

}
