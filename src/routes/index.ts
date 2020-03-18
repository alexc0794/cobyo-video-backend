import express, { Router } from 'express';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
import { AGORA_APP_ID, AGORA_APP_CERTIFICATE } from '../../config';


const router = Router();

export default (app: express.Application) => {
  app.get('/', function(req, res) {
    const ONE_HOUR_S = 3600
    const token = RtcTokenBuilder.buildTokenWithAccount(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      'channelName',
      'accountName',
      RtcRole.PUBLISHER,
      ONE_HOUR_S
    );
    res.send(token);
  });
};
