import express, { Router } from 'express';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
import { AGORA_APP_ID, AGORA_APP_CERTIFICATE } from '../../config';
import channel from './channel';
import chat from './chat';
import activeUser from './users/active_user';
import user from './users/user';
import userInventory from './users/user_inventory';
import menu from './storefront/menu';
import storefront from './storefront/storefront';
import transcript from './transcript';

const router = Router();

export default (app: express.Application) => {
  app.get('/token/:userId', function(req, res) {
    const userId = req.params.userId;
    const channelId = req.query.channelId;
    const ONE_HOUR_S = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const expiredTimestamp = currentTimestamp + ONE_HOUR_S;
    const token = RtcTokenBuilder.buildTokenWithUid(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      channelId,
      userId,
      RtcRole.PUBLISHER,
      expiredTimestamp,
    );
    res.send(token);
  });

  activeUser(router);
  channel(router);
  chat(router);
  menu(router);
  storefront(router);
  transcript(router);
  user(router);
  userInventory(router);

  app.use('/', router);
};
