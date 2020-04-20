import { Router, Request, Response } from 'express';
import bodyParser from 'body-parser';
import { IS_DEV } from '../../../config';
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
    const channelConnections: Array<ChannelConnection> = await (new ChannelConnectionRepository()).getSpotifyConnections(channelId);
    const userIds: Array<string> = IS_DEV ? ['1289621830'] : channelConnections.map(connection => connection.userId);
    const response: GetDJQueue = { userIds };
    res.send(response);
  });

}
