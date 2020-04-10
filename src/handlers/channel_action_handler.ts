import uuid4 from 'uuid4';
import { ChannelConnection } from '../interfaces/channel';
import { ChatMessage } from '../interfaces/chat';
import ChannelConnectionRepository from '../repositories/channel_connection_repository';
import MenuRepository from '../repositories/menu_repository';
import ApiGatewayService from '../services/api_gateway_service';

export default function channel_action_handler(event, context, callback) {
  console.log(event, context);

  switch (event.requestContext.routeKey) {
    case 'sendMessage': {
      return sendMessage(event, context, callback);
    }
    default:
      return callback(null, { statusCode: 404 });
  }
}

async function sendMessage(event, context, callback) {
  const channelId = event.body.channelId;
  const userId = event.body.userId;
  const message = event.body.message;
  if (!channelId || !userId || !message) {
    return callback(null, { statusCode: 401 });
  }

  const chatMessage: ChatMessage = {
    message_id: uuid4(),
    user_id: userId,
    sent_at: (new Date()).toISOString(),
    message
  };
  const channelConnectionRepository = new ChannelConnectionRepository();
  const connections: Array<ChannelConnection> = await channelConnectionRepository.get_channel_connections(
    channelId
  );
  const apiGatewayService = new ApiGatewayService(`${event.requestContext.domainName}/${event.requestContext.stage}`);
  connections.forEach((connection: ChannelConnection) => {
    apiGatewayService.send(connection.connection_id, chatMessage);
  });

  return callback(null, {
    status: 200
  });
}

async function purchaseMenuItem(event, context, callback) {
  const itemId = event.body;
  const userId = event.body.userId;
  const fromUserId = event.body.fromUserId;
  if (!itemId || !userId || fromUserId) {
    return callback(null, { statusCode: 401 });
  }

  const menuItem = (new MenuRepository()).getMenuByItemId(itemId);
  if (!menuItem) {
    return callback(null, { statusCode: 401 });
  }

  // Do we need a socket for this? :think
  // Maybe this is triggered after purchase is validated thru a normal REST api

}
