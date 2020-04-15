import BaseRepository from '../base_repository';
import { User } from '../../interfaces/user';

export default class UserRepository extends BaseRepository {

  tableName = 'Users';

  async getUserById(userId: string): Promise<User|null> {
    return new Promise((resolve, reject) =>
      this.awsClient.get({
        TableName: this.tableName,
        Key: {
          userId
        }
      }, (err, data) => {
        if (data && data.Item && data.Item) {
          return resolve(data.Item);
        }
        return resolve(null);
      })
    );
  }

  async getUsersByIds(userIds: Array<string>): Promise<Array<User>> {
    if (!userIds.length) {
      return Promise.resolve([]);
    }
    return new Promise((resolve, reject) =>
      this.awsClient.batchGet({
        RequestItems: {
          [this.tableName]: {
            Keys: userIds.map(userId => ({ userId }))
          }
        }
      }, (err, data) => {
        if (err) {
          console.error('Could not get users by ids', userIds, err);
          return resolve([]);
        }
        return resolve(data.Responses[this.tableName]);
      })
    );
  }

  // Given a facebook user id, return a user id if it exists
  async getUserIdByFacebookUserId(facebookUserId: string): Promise<string|null> {
    return new Promise((resolve, reject) =>
      this.awsClient.query({
        TableName: this.tableName,
        IndexName: 'FacebookUserIndex',
        KeyConditionExpression: 'facebookUserId = :facebookUserId',
        ExpressionAttributeValues: { ':facebookUserId': facebookUserId },
      }, (err, data) => {
        if (err) {
          console.error('Could not get user id by facebook user id', facebookUserId, err);
          return resolve(null);
        }
        if (data && data.Items && data.Items.length > 0) {
          return resolve(data.Items[0].userId);
        }
        return resolve(null);
      })
    );
  }

  async createUser(
    userId: string,
    facebookUserId: string|null,
    email: string|null,
    firstName: string,
    lastName: string|null,
    profilePictureUrl: string|null,
    walletInCents: number,
  ): Promise<User|null> {
    const item = {
      userId,
      facebookUserId,
      email,
      firstName,
      lastName,
      profilePictureUrl,
      walletInCents,
      createdAt: (new Date()).toISOString(),
    };
    const filteredItem = Object.keys(item).reduce((acc: any, key: string) => {
      if (item[key] !== null) {
          return { ...acc, [key]: item[key] };
      }
      return acc;
    }, {});
    return new Promise((resolve, reject) =>
      this.awsClient.put({
        TableName: this.tableName,
        Item: filteredItem
      }, (err, data) => {
        if (err) {
          console.error('Failed to create user', userId, err);
          return reject(null);
        }
        return resolve(item);
      })
    );
  }

  async updateUserWallet(userId: string, differenceInCents: number): Promise<number> {
    return new Promise((resolve, reject) =>
      this.awsClient.update({
        TableName: this.tableName,
        Key: { userId },
        UpdateExpression: 'SET walletInCents = walletInCents + :differenceInCents',
        ConditionExpression: 'walletInCents >= :minimumWallet',
        ExpressionAttributeValues: {
          ':differenceInCents': differenceInCents,
          ':minimumWallet': -1 * differenceInCents,
        },
        ReturnValues: 'UPDATED_NEW',
      }, (err, data) => {
        if (err) {
          console.error('Failed to update user wallet', userId, differenceInCents, err);
          return reject();
        }
        if ('walletInCents' in data.Attributes) {
          return resolve(data.Attributes['walletInCents']);
        }
        return reject();
      })
    );
  }

}
