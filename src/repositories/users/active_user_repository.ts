import BaseRepository from '../base_repository';
import { ActiveUser } from '../../interfaces/user';

export default class ActiveUserRepository extends BaseRepository {

  tableName = 'ActiveUsers';

  async getActiveUsers(): Promise<Array<ActiveUser>> {
    return Promise.resolve([]);
    // return new Promise((resolve, reject) =>
    //   this.awsClient.scan({
    //     TableName: this.tableName
    //   }, (err, data) => {
    //     if (err) {
    //       console.error(`Could not find active users`);
    //       return resolve([]);
    //     }
    //     return resolve(data.Items);
    //   })
    // );
  }

  async updateActiveUser(userId: string): Promise<boolean> {
    return Promise.resolve(false);
    // const SECONDS_IN_A_MINUTE = 60;
    // const secondsSinceEpoch = Math.round(Date.now() / 1000);
    // const item = {
    //   userId,
    //   lastActiveAt: (new Date()).toISOString(),
    //   expiringAtSeconds: secondsSinceEpoch + (SECONDS_IN_A_MINUTE * 2)
    // };
    // return new Promise((resolve, reject) =>
    //   this.awsClient.put({
    //     TableName: this.tableName,
    //     Item: item
    //   }, (err, data) => {
    //     if (err) {
    //       console.error('Failed to update active user', userId, err);
    //       return resolve(false);
    //     }
    //     return resolve(true);
    //   })
    // );
  }

}
