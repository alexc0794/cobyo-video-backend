import { VideoConnection, TableShape } from '../enums';

export interface Seat {
  seatNumber: number,
  userId: string,
  satDownAt: string,
};

export interface ChannelConnection {
  channelId: string,
  connectionId: string,
  userId: string,
  spotifyConnectedAtSeconds: number,
  connectedAt: string,
};

export interface Channel {
  channelId: string,
  channelName: string,
  lastUpdatedAt: string,
  videoConnection: VideoConnection,
  tableShape: TableShape,
  seats: Array<Seat | null>,
};
