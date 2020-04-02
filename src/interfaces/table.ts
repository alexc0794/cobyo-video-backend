import { Shape, Connection } from '../enums/table';

export interface Seat {
  userId: string,
  lastUpdatedAt: string,
  satDownAt: string,
};

export default interface Table {
  tableId: string,
  seats: Array<Seat|null>,
  name: string,
  lastUpdatedAt: string,
  shape: Shape,
  connection: Connection
};
