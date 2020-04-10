import ChannelConnectionRepository from '../repositories/channel_connection_repository';

export default async function channel_connection_handler(event, context, callback) {
  console.log(event);
  const connection_id = event.requestContext.connectionId;
  const channel_id = '1';

  if (event.requestContext.eventType === "CONNECT") {
    const success = await channel_connect(channel_id, connection_id);
    if (!success) {
      return callback(null, { statusCode: 500 });
    }
    return callback(null, { statusCode: 200 });
  } else if (event.requestContext.eventType === "DISCONNECT") {
    const success = await channel_disconnect(channel_id, connection_id);
    if (!success) {
      return callback(null, { statusCode: 500 });
    }
    return callback(null, { statusCode: 200 });
  }
}

export async function channel_connect(channel_id: string, connection_id: string): Promise<boolean> {
  try {
    const channel_connection_repository = new ChannelConnectionRepository();
    await channel_connection_repository.create_channel_connection(channel_id, connection_id);
  } catch {
    return false;
  }
  return true;
}

export async function channel_disconnect(channel_id: string, connection_id: string): Promise<boolean> {
  try {
    const channel_connection_repository = new ChannelConnectionRepository();
    await channel_connection_repository.remove_channel_connection(channel_id, connection_id);
  } catch {
    return false;
  }
  return true;
}
