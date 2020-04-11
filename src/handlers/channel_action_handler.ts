import uuid4 from 'uuid4';
import { ChannelConnection } from '../interfaces/channel';
import { ChatMessage } from '../interfaces/chat';
import ChannelConnectionRepository from '../repositories/channel_connection_repository';
import MenuRepository from '../repositories/menu_repository';
import ApiGatewayService from '../services/api_gateway_service';

export default async function channel_action_handler(event, context, callback) {
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

async function _sendToConnections(event, channelId, payload) {
  const channelConnectionRepository = new ChannelConnectionRepository();
  const connections: Array<ChannelConnection> = await channelConnectionRepository.get_channel_connections(channelId);
  const apiGatewayService = new ApiGatewayService(`${event.requestContext.domainName}/${event.requestContext.stage}`);
  connections.forEach((connection: ChannelConnection) => {
    apiGatewayService.send(connection.connection_id, payload);
  });
}

async function sendMessage(event, context) {
  const body = JSON.parse(event.body);
  const channelId = body.channelId;
  const userId = body.userId;
  const message = body.message;
  if (!channelId || !userId || !message) {
    return Promise.reject();
  }

  const chatMessage: ChatMessage = {
    message_id: uuid4(),
    user_id: userId,
    sent_at: (new Date()).toISOString(),
    message
  };
  await _sendToConnections(event, channelId, chatMessage);

  return Promise.resolve();
}

async function purchasedMenuItem(event, context) {
  const body = JSON.parse(event.body);
  const channelId = body.channelId;
  const itemId = body.itemId;
  const userId = body.userId;
  const fromUserId = body.fromUserId;
  if (!itemId || !userId || !fromUserId) {
    return Promise.reject();
  }

  const menuItem = (new MenuRepository()).getMenuByItemId(itemId);
  if (!menuItem) {
    return Promise.reject();
  }
  const channelConnectionRepository = new ChannelConnectionRepository();
  const connections: Array<ChannelConnection> = await channelConnectionRepository.get_channel_connections(channelId);
  const apiGatewayService = new ApiGatewayService(`${event.requestContext.domainName}/${event.requestContext.stage}`);
  const connection: ChannelConnection|undefined = connections.find(connection => connection.user_id === userId);
  if (connection) {
    apiGatewayService.send(connection.connection_id, { itemId, userId, fromUserId, menuItem });
  } else {
    return Promise.reject();
  }

  return Promise.resolve();
}
