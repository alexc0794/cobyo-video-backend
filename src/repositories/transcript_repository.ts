import BaseRepository from './base_repository'

type Transcript = {
  body: string,
  table_id: string,
  added_at: string,
};

export default class TranscriptRepository extends BaseRepository {

  table_name = 'Transcripts';

  async get_transcripts_by_table_id(table_id: string): Promise<Array<Transcript>> {
    return new Promise((resolve, _) => {
      this.aws_client.query({
        'TableName': this.table_name,
        'ProjectionExpression': 'table_id, body, added_at',
        'KeyConditionExpression': 'table_id = :tid and added_at < :aat',
        'ExpressionAttributeValues': {
          ':tid': table_id,
          ':aat': (new Date()).toISOString(),
        }
      }, (err, data) => {
        if (data && data.Items) {
          return resolve(data.Items);
        }
        console.error(`Could not find transcripts for table ${table_id}`, err, data);
        return resolve([]);
      });
    });
  }

  async save_transcript(table_id: string, body: string): Promise<boolean> {
    const item = {
      'table_id': table_id,
      'body': body,
      'added_at': (new Date()).toISOString(),
    };
    return new Promise((resolve, _) => {
      this.aws_client.put({
        'TableName': this.table_name,
        'Item': item,
      }, (err, data) => {
        if (err) {
          console.error('Failed to save transcript', table_id, err);
          return resolve(false);
        }
        return resolve(true);
      });
    });
  }

}
