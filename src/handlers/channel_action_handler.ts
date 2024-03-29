import uuid4 from 'uuid4';
import { ChannelConnection, ChatMessage, CurrentlyPlaying } from '../interfaces';
import ChannelConnectionRepository from '../repositories/channel_connection_repository';
import MenuRepository from '../repositories/menu_repository';
import CurrentlyPlayingRepository from '../repositories/music/currently_playing_repository';
import ApiGatewayService from '../services/api_gateway_service';
import { broadcastToChannel } from './channel_helpers';

export default async function channelActionHandler(event, context, callback) {
  try {
    switch (event.requestContext.routeKey) {
      case 'sendMessage': {
        await sendMessage(event, context);
        break;
      }
      case 'purchasedMenuItem': {
        await purchasedMenuItem(event, context);
        break;
      }
      case 'CHANGE_SONG': {
        await changeSong(event, context);
        break;
      }
      default: {
        return callback(null, { statusCode: 404 });
      }
    }
  } catch (e) {
    console.error(e);
    return callback(null, { statusCode: 500 });
  }
  return callback(null, { statusCode: 200 });
}

async function sendMessage(event, context) {
  const body = JSON.parse(event.body);
  const action = body.action;
  const channelId = body.channelId;
  const userId = body.userId;
  const message = body.message;
  if (!channelId || !userId || !message) {
    return Promise.reject();
  }

  const chatMessage: ChatMessage = {
    messageId: uuid4(),
    userId: userId,
    sentAt: (new Date()).toISOString(),
    message
  };
  const payload = { ...chatMessage, action };
  await broadcastToChannel(event, channelId, payload);

  return Promise.resolve();
}

async function purchasedMenuItem(event, context) {
  const body = JSON.parse(event.body);
  const action = body.action;
  const channelId = body.channelId;
  const itemId = body.itemId;
  const userId = body.userId;
  const fromUserId = body.fromUserId;
  if (!itemId || !userId || !fromUserId) {
    return Promise.reject();
  }

  const menuItem = (new MenuRepository()).getMenuItemById(itemId);
  if (!menuItem) {
    return Promise.reject();
  }

  const payload = { action, itemId, userId, fromUserId, menuItem };
  await broadcastToChannel(event, channelId, payload);

  return Promise.resolve();
}

async function changeSong(event, context) {
  const body = JSON.parse(event.body);
  const action = body.action;
  const { channelId, fromUserId } = body;
  if (!channelId || !fromUserId) {
    return Promise.reject();
  }

  const currentlyPlaying: CurrentlyPlaying = {
    channelId,
    fromUserId,
    trackId: body.trackId,
    trackUri: body.trackUri,
    trackName: body.trackName,
    artistName: body.artistName,
    position: body.position,
    duration: body.duration,
    paused: body.paused,
    updatedAtMs: Math.round(Date.now() / 1000),
  };
  const didUpdate: boolean = await (new CurrentlyPlayingRepository()).updateChannelCurrentlyPlaying(currentlyPlaying);
  if (!didUpdate) {
    console.error('Failed to update currently playing song', channelId);
  }

  const payload = { action, ...body };
  await broadcastToChannel(event, channelId, payload);

  return Promise.resolve();
}
