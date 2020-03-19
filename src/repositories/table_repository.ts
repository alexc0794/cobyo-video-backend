import BaseRepository from './base_repository'

type UserInSeat = {
  user_id: string,
  sat_down_at: string,
} | null;

type Table = {
  table_id: string,
  seats: Array<UserInSeat>,
  name: string,
  last_updated_at: string,
};

export default class TableRepository extends BaseRepository {

  table_name = 'Tables';

  async get_table_by_id(table_id: string): Promise<Table|undefined> {
    return new Promise((resolve, reject) =>
      this.aws_client.get({
        'TableName': this.table_name,
        'Key': {
          table_id
        }
      }, (err, data) => {
        if (data && data.Item && data.Item) {
          return resolve(data.Item);
        }
        console.log(`Could not find table ${table_id}`)
        return resolve();
      })
    );
  }

  async update_table(table_id: string, seats: Array<UserInSeat>, name: string): Promise<void> {
    return new Promise((resolve, reject) =>
      this.aws_client.put({
        'TableName': this.table_name,
        'Item': {
          'table_id': table_id,
          'seats': seats,
          'name': name,
          'last_updated_at': (new Date()).toISOString(),
        }
      }, (err, data) => {
        if (err) {
          console.error('Failed to update table', table_id, err);
          return reject();
        }
        console.log('Successful update of table', table_id, data);
        return resolve();
      })
    );
  }

}
