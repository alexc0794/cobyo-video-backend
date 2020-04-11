import ChannelConnectionRepository from '../repositories/channel_connection_repository';
import { broadcastToChannel } from './channel_helpers';

const DEFAULT_CHANNEL_ID = 'room';

export default async function channelConnectionHandler(event, context, callback) {
  const connectionId = event.requestContext.connectionId;

  if (event.requestContext.eventType === "CONNECT") {
    let channelId, userId;
    if (event.queryStringParameters && event.queryStringParameters.channelIdUserId) {
      const [ _channelId, _userId ] = event.queryStringParameters.channelIdUserId.split(',');
      channelId = _channelId;
      userId = _userId;
    } else if (event.queryStringParameters && event.queryStringParameters.userId) {
      channelId = event.queryStringParameters.channelId || DEFAULT_CHANNEL_ID;
      userId = event.queryStringParameters.userId;
    } else {
      return callback(null, { statusCode: 401 });
    }
    if (!await channelConnect(channelId, connectionId, userId)) {
      return callback(null, { statusCode: 500 });
    }
    await broadcastToChannel(event, channelId, {
      userId,
      action: event.requestContext.eventType,
    });
  }

  // Handle DISCONNECT
  if (event.requestContext.eventType === "DISCONNECT") {
    if (!await channelDisconnect(connectionId)) {
      return callback(null, { statusCode: 500 });
    }
    const channelConnection = await (new ChannelConnectionRepository()).getChannelByConnectionId(connectionId);
    if (channelConnection) {
      const { channel_id: channelId, user_id: userId } = channelConnection;
      await broadcastToChannel(event, channelId, {
        userId,
        action: event.requestContext.eventType,
      });
    } else {
      console.warn('Couldnt find channel connection to broadcast user disconnected', connectionId);
    }
  }
  return callback(null, { statusCode: 200 });
}

export async function channelConnect(channelId: string, connectionId: string, userId: string): Promise<boolean> {
  try {
    await (new ChannelConnectionRepository()).createChannelConnection(channelId, connectionId, userId);
  } catch {
    return false;
  }
  return true;
}

export async function channelDisconnect(connectionId: string): Promise<boolean> {
  try {
    const channelConnectionRepository = new ChannelConnectionRepository();
    const channelConnection = await channelConnectionRepository.getChannelByConnectionId(connectionId);
    if (!channelConnection) {
      return false;
    }
    const channelId = channelConnection.channel_id;
    await channelConnectionRepository.removeChannelConnection(channelId, connectionId);
  } catch {
    return false;
  }

  return true;
}
