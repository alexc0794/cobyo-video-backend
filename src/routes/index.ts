import express, { Router } from 'express';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
import { AGORA_APP_ID, AGORA_APP_CERTIFICATE } from '../../config';
import table from './table';
import transcript from './transcript';
import user from './user';
import storefront from './storefront';

const router = Router();

export default (app: express.Application) => {
  app.get('/token/:uid', function(req, res) {
    const uid = req.params.uid;
    const channel_name = req.query.channel_name || 'channelName';
    const ONE_HOUR_S = 3600;
    const current_timestamp = Math.floor(Date.now() / 1000);
    const expired_timestamp = current_timestamp + ONE_HOUR_S;
    const token = RtcTokenBuilder.buildTokenWithUid(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      channel_name,
      uid,
      RtcRole.PUBLISHER,
      expired_timestamp,
    );
    res.send(token);
  });

  table(router);
  transcript(router);
  user(router);
  storefront(router);

  app.use('/', router);
};
