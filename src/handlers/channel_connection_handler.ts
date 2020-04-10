import ChannelConnectionRepository from '../repositories/channel_connection_repository';

const DEFAULT_CHANNEL_ID = 'room';

export default async function channel_connection_handler(event, context, callback) {
  const connection_id = event.requestContext.connectionId;
  if (event.requestContext.eventType === "CONNECT") {
    const channel_id = event.queryStringParameters.channelId || DEFAULT_CHANNEL_ID;
    const user_id = event.queryStringParameters.userId;
    if (!user_id) {
      return callback(null, { statusCode: 401 });
    }
    if (!await channel_connect(channel_id, connection_id, user_id)) {
      return callback(null, { statusCode: 500 });
    }
  } else if (event.requestContext.eventType === "DISCONNECT") {
    if (!await channel_disconnect(connection_id)) {
      return callback(null, { statusCode: 500 });
    }
  }
  return callback(null, { statusCode: 200 });
}

export async function channel_connect(channel_id: string, connection_id: string, user_id: string): Promise<boolean> {
  try {
    const channel_connection_repository = new ChannelConnectionRepository();
    await channel_connection_repository.create_channel_connection(channel_id, connection_id, user_id);
  } catch {
    return false;
  }
  return true;
}

export async function channel_disconnect(connection_id: string): Promise<boolean> {
  try {
    const channel_connection_repository = new ChannelConnectionRepository();
    const channel_id = await channel_connection_repository.get_channel_by_connection_id(connection_id);
    if (!channel_id) {
      return false;
    }
    await channel_connection_repository.remove_channel_connection(channel_id, connection_id);
  } catch {
    return false;
  }

  return true;
}
