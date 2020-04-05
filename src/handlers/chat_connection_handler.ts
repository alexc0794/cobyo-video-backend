import ChatConnectionRepository from '../repositories/chat_connection_repository';

export default async function chat_connection_handler(event, context, callback) {
  const connection_id = event.requestContext.connectionId;

  if (event.requestContext.eventType === "CONNECT") {
    const success = await chat_connect(connection_id);
    if (!success) {
      return callback(null, { statusCode: 500 });
    }
    return callback(null, { statusCode: 200 });
  } else if (event.requestContext.eventType === "DISCONNECT") {
    const success = await chat_disconnect(connection_id);
    if (!success) {
      return callback(null, { statusCode: 500 });
    }
    return callback(null, { statusCode: 200 });
  }
}

export async function chat_connect(connection_id: string): Promise<boolean> {
  try {
    const chat_connection_repository = new ChatConnectionRepository();
    await chat_connection_repository.create_chat_connection(connection_id);
  } catch {
    return false;
  }
  return true;
}

export async function chat_disconnect(connection_id: string): Promise<boolean> {
  try {
    const chat_connection_repository = new ChatConnectionRepository();
    await chat_connection_repository.remove_chat_connection(connection_id);
  } catch {
    return false;
  }
  return true;
}
