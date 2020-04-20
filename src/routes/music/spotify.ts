import { Router, Request, Response } from 'express';
import bodyParser from 'body-parser';
import querystring from 'querystring';
import request from 'request';
import { authenticate, softAuthenticate } from '../middleware';
import { IS_DEV, COBYO_VIDEO_BASE_API, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from '../../../config';
import { ChannelConnection } from '../../interfaces/channel';
import SpotifyTokenRepository from '../../repositories/music/spotify_token_repository';
import ChannelConnectionRepository from '../../repositories/channel_connection_repository';

function getBaseUrl(req: Request): string {
  return IS_DEV ? `${req.protocol}://${req.get('host')}` : `${COBYO_VIDEO_BASE_API}`;
}

const SCOPES_TO_AUTHORIZE = [
  'streaming',
  'user-read-email',
  'user-read-private',
];

let recentlyAuthorizedUserId: string; // Wow. Legendary hack.

export default (app: Router) => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.get('/spotify/token', authenticate, async function(req: any, res) {
    const userId = req.user.userId;
    try {
      const spotifyToken = await (new SpotifyTokenRepository()).getTokenByUserId(userId);
      return res.send({ spotifyToken });
    } catch {
      return res.sendStatus(500);
    }
  });

  app.get('/spotify/authorize', async function(req, res, next) {
    const userId: string = req.query.userId;
    recentlyAuthorizedUserId = userId;

    const redirectUri = getBaseUrl(req) + '/callback';
    res.redirect('https://accounts.spotify.com/authorize' +
      '?response_type=code' +
      '&client_id=' + SPOTIFY_CLIENT_ID +
      (SCOPES_TO_AUTHORIZE ? '&scope=' + encodeURIComponent(SCOPES_TO_AUTHORIZE.join(',')) : '') +
      '&redirect_uri=' + encodeURIComponent(redirectUri)
    );
  });

  app.get('/callback', async function(req, res) {
    const code = req.query.code || null;
    if (!code) {
      res.redirect(getBaseUrl(req));
    }
    const redirectUri = getBaseUrl(req) + '/callback';
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, async (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const accessToken = body.access_token;
        const refreshToken = body.refresh_token;
        const tokenRepository = new SpotifyTokenRepository();
        // TODO: Get user_id from session???
        const userId = recentlyAuthorizedUserId;
        // Save the token to DDB
        await tokenRepository.putToken(userId, accessToken, refreshToken);
        // [Optional] Redirect
        res.status(200).send('✅Spotify was successfully authorized. You may now close the tab.');
      } else {
        res.status(500).send('❌There was an unexpected issue and Spotify was not successfully authorized. You may now close the tab.');
      }
    });
  });

  app.put('/spotify/connect', authenticate, async function(req: any, res: Response) {
    const channelId = req.body.channelId;
    const userId = req.user.userId
    const channelConnectionRepository = new ChannelConnectionRepository();
    const channelConnections: Array<ChannelConnection> = await channelConnectionRepository.getChannelConnections(channelId);
    const channelConnection: ChannelConnection | undefined = channelConnections.find(
      channelConnection => channelConnection.userId === userId
    );
    if (!channelConnection) {
      return res.sendStatus(404);
    }

    const updatedSpotifyConnectedAtSeconds: number = await channelConnectionRepository.updateSpotifyConnection(
      channelConnection.channelId,
      channelConnection.connectionId,
    );
    return res.send(updatedSpotifyConnectedAtSeconds);
  });

}
