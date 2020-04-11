import { Shape, Connection } from '../enums/table';

export interface Seat {
  user_id: string,
  last_updated_at: string,
  sat_down_at: string,
};

export default interface Table {
  table_id: string,
  seats: Array<Seat|null>,
  table_name: string,
  last_updated_at: string,
  shape: Shape,
  connection: Connection
};
