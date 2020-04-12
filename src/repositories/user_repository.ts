import BaseRepository from './base_repository';
import User from '../interfaces/user';

export default class UserRepository extends BaseRepository {

  table_name = 'Users';

  async get_user_by_id(user_id: string): Promise<User|null> {
    return new Promise((resolve, reject) =>
      this.aws_client.get({
        'TableName': this.table_name,
        'Key': {
          user_id
        }
      }, (err, data) => {
        if (data && data.Item && data.Item) {
          return resolve(data.Item);
        }
        console.error(`Could not find user ${user_id}`)
        return resolve(null);
      })
    );
  }

  async get_users_by_ids(user_ids: Array<string>): Promise<Array<User>> {
    if (user_ids.length === 0) {
        return Promise.resolve([]);
    }

    return new Promise((resolve, reject) =>
      this.aws_client.batchGet({
        'RequestItems': {
          [this.table_name]: {
            'Keys': user_ids.map(user_id => ({
              'user_id': user_id,
            }))
          }
        }
      }, (err, data) => {
        if (data && data.Responses && data.Responses[this.table_name]) {
          return resolve(data.Responses[this.table_name]);
        }
        console.error(err);
        return resolve([]);
      })
    );
  }

  // Given a facebook user id, return a user id if it exists
  async get_user_id_by_facebook_user_id(facebook_user_id: string): Promise<string|null> {
    return new Promise((resolve, reject) =>
      this.aws_client.query({
        'TableName': this.table_name,
        'IndexName': 'FacebookUserIndex',
        'KeyConditionExpression': 'facebook_user_id = :fbuid',
        'ExpressionAttributeValues': { ':fbuid': facebook_user_id },
      }, (err, data) => {
        if (data && data.Items && data.Items.length > 0) {
          return resolve(data.Items[0].user_id);
        }
        return resolve(null);
      })
    );
  }

  async create_user(
    user_id: string,
    facebook_user_id: string|null,
    email: string|null,
    first_name: string,
    last_name: string|null,
    profile_picture_url: string|null,
  ): Promise<User|undefined> {
    const item = {
      user_id,
      facebook_user_id,
      email,
      first_name,
      last_name,
      profile_picture_url,
      'created_at': (new Date()).toISOString(),
    };
    const filteredItem = Object.keys(item).reduce((acc: any, key: string) => {
      if (item[key] !== null) {
          return { ...acc, [key]: item[key] };
      }
      return acc;
    }, {});
    return new Promise((resolve, reject) =>
      this.aws_client.put({
        'TableName': this.table_name,
        'Item': filteredItem
      }, (err, data) => {
        if (err) {
          console.error('Failed to create user', user_id, err);
          return reject();
        }
        return resolve(item);
      })
    );
  }

}
