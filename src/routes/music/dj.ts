import { Router, Request, Response } from 'express';
import bodyParser from 'body-parser';
import { DJ, ChannelConnection } from '../../interfaces';
import ChannelConnectionRepository from '../../repositories/channel_connection_repository';

export default (app: Router) => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  type GetDJQueue = {
    userIds: Array<string>,
  };

  app.get('/dj/queue', async function(req: Request, res: Response) {
    if (!req.query.channelId) { return res.sendStatus(400); }

    const channelId: string = req.query.channelId;
    const channelConnections: Array<ChannelConnection> = await (new ChannelConnectionRepository()).getChannelConnections(channelId);
    const spotifyConnections: Array<ChannelConnection> = channelConnections.filter(
      channelConnection => channelConnection.spotifyConnectedAtSeconds > 0
    );
    const orderedSpotifyConnections: Array<ChannelConnection> = spotifyConnections.sort(
      (a: ChannelConnection, b: ChannelConnection) => b.spotifyConnectedAtSeconds - a.spotifyConnectedAtSeconds
    ); // Lowest value first so order of DJ queue is based on who connected first.

    const userIds: Array<string> = orderedSpotifyConnections.map(connection => connection.userId);

    const response: GetDJQueue = { userIds };
    res.send(response);
  });

}
