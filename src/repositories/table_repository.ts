import BaseRepository from './base_repository';
import { Connection, Shape } from '../enums/table';
import Table, { Seat } from '../interfaces/table';

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
        console.error(`Could not find table ${table_id}`)
        return resolve();
      })
    );
  }

  async get_tables_by_ids(table_ids: Array<string>): Promise<Array<Table>> {
    if (table_ids.length === 0) {
      return Promise.resolve([]);
    }
    
    return new Promise((resolve, reject) =>
      this.aws_client.batchGet({
        'RequestItems': {
          [this.table_name]: {
            'Keys': table_ids.map(table_id => ({
              'table_id': table_id,
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

  async update_table(
    table_id: string,
    seats: Array<Seat|null>,
    name: string,
    connection: Connection,
    shape: Shape,
  ): Promise<Table> {
    const item = {
      'table_id': table_id,
      'seats': seats,
      'name': name,
      'last_updated_at': (new Date()).toISOString(),
      'connection': connection,
      'shape': shape,
    };
    return new Promise((resolve, reject) =>
      this.aws_client.put({
        'TableName': this.table_name,
        'Item': item
      }, (err, data) => {
        if (err) {
          console.error('Failed to update table', table_id, err);
          return reject();
        }
        return resolve(item);
      })
    );
  }

}
