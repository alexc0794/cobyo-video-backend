import { Router, Request, Response } from 'express';
import bodyParser from 'body-parser';
import { softAuthenticate } from './middleware';
import { IS_DEV } from '../../config';
import { VideoConnection, TableShape, DEFAULT_VIDEO_CONNECTION, DEFAULT_TABLE_SHAPE } from '../enums';
import { Channel, ChannelConnection, User, Seat, CurrentlyPlaying } from '../interfaces';
import ChannelRepository from '../repositories/channel_repository';
import ChannelConnectionRepository from '../repositories/channel_connection_repository';
import CurrentlyPlayingRepository from '../repositories/currently_playing_repository';
import UserRepository from '../repositories/users/user_repository';
import ActiveUserRepository from '../repositories/users/active_user_repository';

// const SEAT_INACTIVITY_EXPIRATION_IN_SECONDS = IS_DEV ? 10 : 60; // expire seat

export default (app: Router) => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  type GetChannelResponse = {
    channel: Channel,
    users: Array<User>
  };

  app.get('/channel/:channelId', softAuthenticate, async function(req: Request, res: Response) {
    const channelId = req.params.channelId;
    const channel: Channel | null = await (new ChannelRepository()).getChannelById(channelId);
    if (!channel) {
      return res.status(500).send({ error: `Failed to find channel ${channelId}` });
    }
    const channelConnections: Array<ChannelConnection> = await (new ChannelConnectionRepository()).getChannelConnections(channelId);
    const userIds: Array<string> = channelConnections.map((channelConnection: ChannelConnection) => channelConnection.userId);
    const users: Array<User> = await (new UserRepository()).getUsersByIds(userIds);

    const response: GetChannelResponse = { channel, users };
    res.send(response);
  });

  type GetChannelsResponse = {
    channels: Array<Channel>,
    users: Array<User>,
  };

  app.get('/channels', async function(req: any, res) {
    const channelIds: Array<string> = req.query.channelIds ? req.query.channelIds.split(',') : [];
    const channels: Array<Channel> = await (new ChannelRepository()).getChannelsByIds(channelIds);
    const channelConnections: Array<ChannelConnection> = []; // await (new ChannelConnectionRepository()).getChannelConnectionsByChannelIds(channelIds);
    const userIds: Array<string> = channelConnections.map((channelConnection: ChannelConnection) => channelConnection.userId);
    const users = await (new UserRepository()).getUsersByIds(userIds);

    const response: GetChannelsResponse = { channels, users };
    res.send(response);
  });

  type UpdateChannelResponse = {
    channel: Channel,
  };

  app.put('/channel', async function(req: Request, res: Response) {
    const channelId = req.body.channelId
    const name = req.body.name
    try {
      const channel: Channel = await (new ChannelRepository()).updateChannelName(channelId, name);
      const response: UpdateChannelResponse = { channel };
      return res.send(response);
    } catch (e) {
      return res.sendStatus(500)
    }
  });

  type CreateChannelResponse = {
    channel: Channel,
  };

  app.post('/channel', async function(req: Request, res: Response) {
    const channelId: string = req.body.channelId;
    const seats: Array<Seat | null> = req.body.seats;
    if (!channelId || !seats) {
      return res.sendStatus(400);
    }

    const channelName: string = req.body.channelName || '';
    const videoConnection = req.body.videoConnection || DEFAULT_VIDEO_CONNECTION;
    const tableShape = req.body.tableShape || DEFAULT_TABLE_SHAPE;

    try {
      const channel: Channel = await (new ChannelRepository()).updateChannel(
        channelId,
        seats,
        channelName,
        videoConnection,
        tableShape,
      );
      const response: CreateChannelResponse = { channel };
      return res.send(response);
    } catch {
      return res.send(null);
    }
  });

  type LeaveChannelResponse = Channel;

  app.post('/channel/leave', async function(req: Request, res: Response) {
    const channelId = req.body.channelId;
    const userId = req.body.userId;
    if (!channelId || !userId) {
      return res.sendStatus(400);
    }

    try {
      const channel: Channel = await (new ChannelRepository()).leaveChannel(channelId, userId);
      const response: LeaveChannelResponse = channel;
      return res.send(response);
    } catch {
      return res.sendStatus(500);
    }
  });

  type JoinTableResponse = {
    channel: Channel,
  };

  app.post('/channel/join', async function(req: Request, res: Response) {
    const channelId = req.body.channelId;
    const userId = req.body.userId;
    const channel: Channel | null = await (new ChannelRepository()).getChannelById(channelId);
    if (!channel) {
      return res.status(500).send({ error: `Failed to find channel ${channelId}` });
    }

    let seats: Array<Seat | null> = channel.seats;
    let seatNumber = parseInt(req.body.seatNumber, 10);
    if (isNaN(seatNumber)) {
      const openSeatNumbers = seats.map((seat, i) => seat ? -1 : i).filter(i => i != -1);
      seatNumber = openSeatNumbers[Math.floor(Math.random() * Math.floor(openSeatNumbers.length))];
    }

    if (seatNumber > seats.length - 1) {
      return res.status(400).send({ error: `Invalid seat number ${seatNumber}` });
    }

    const seat: Seat | null = seats[seatNumber];
    if (seat != null && seat.userId !== userId) {
      return res.status(400).send({ error: `Different user ${seat.userId} is sitting there ${seatNumber}` });
    }

    const now = (new Date()).toISOString();
    if (seat != null && seat.userId === userId) {
      seats[seatNumber] = {
        userId: seat.userId,
        seatNumber,
        satDownAt: seat.satDownAt,
      };
    } else {
      // Remove user from previous seat if already at the channel so user doesnt show up twice.
      seats = seats.map(seat => (seat && seat.userId !== userId) ? seat : null);
      seats[seatNumber] = {
        userId,
        seatNumber,
        satDownAt: now,
      };
    }
    const updatedChannel = await (new ChannelRepository()).updateChannel(
      channelId,
      seats,
      channel.channelName,
      channel.videoConnection,
      channel.tableShape,
    );

    const response: JoinTableResponse = { channel: updatedChannel };
    res.send(response);
  });


  type GetCurrentlyPlayingResponse = {
    currentlyPlaying: CurrentlyPlaying,
  };

  app.get('/channel/:channelId/currently-playing', async function(req: Request, res: Response) {
    const channelId = req.params.channelId;
    try {
      const currentlyPlaying: CurrentlyPlaying = await (new CurrentlyPlayingRepository()).getChannelCurrentlyPlaying(channelId);
      const response: GetCurrentlyPlayingResponse = { currentlyPlaying };
      return res.send(response);
    } catch {
      return res.sendStatus(404);
    }
  });

}
