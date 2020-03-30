import BaseRepository from './base_repository';

type ActiveUser = {
  user_id: string,
  last_active_at: string,
};

export default class ActiveUserRepository extends BaseRepository {

  table_name = 'ActiveUsers';

  async get_active_users(): Promise<Array<ActiveUser>> {
    return new Promise((resolve, reject) =>
      this.aws_client.scan({
        'TableName': this.table_name,
      }, (err, data) => {
        if (data && data.Items) {
          return resolve(data.Items);
        }
        console.error(`Could not find active users`)
        return resolve([]);
      })
    );
  }

  async update_active_user(user_id: string): Promise<undefined> {
    const SECONDS_IN_A_MINUTE = 60;
    const seconds_since_epoch = Math.round(Date.now() / 1000);
    const item = {
      'user_id': user_id,
      'last_active_at': (new Date()).toISOString(),
      'expiring_at': seconds_since_epoch + (SECONDS_IN_A_MINUTE * 2) // TTL is 2 minutes for each record. User is no longer deemed "active" after this point
    };
    return new Promise((resolve, reject) =>
      this.aws_client.put({
        'TableName': this.table_name,
        'Item': item
      }, (err, data) => {
        if (err) {
          console.error('Failed to update active user', user_id, err);
          return reject();
        }
        return resolve();
      })
    );
  }

}
