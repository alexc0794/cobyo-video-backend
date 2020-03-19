import express, { Router } from 'express';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
import { AGORA_APP_ID, AGORA_APP_CERTIFICATE } from '../../config';
import table from './table';

const router = Router();

export default (app: express.Application) => {
  app.get('/token/:uid', function(req, res) {
    const uid = req.params.uid;
    const ONE_HOUR_S = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const expiredTimestamp = currentTimestamp + ONE_HOUR_S;
    const token = RtcTokenBuilder.buildTokenWithUid(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      'channelName',
      uid,
      RtcRole.PUBLISHER,
      expiredTimestamp,
    );
    res.send(token);
  });

  table(router);

  app.use('/', router);
};
