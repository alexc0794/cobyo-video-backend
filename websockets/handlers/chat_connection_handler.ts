import ChatConnectionRepository from '../repositories/chat_connection_repository';

export default async function chat_connection_handler(event, context, callback) {
  console.log(event, context, callback);
  const connection_id = event.requestContext.connectionId;
  const chat_connection_repository = new ChatConnectionRepository();

  if (event.requestContext.eventType === "CONNECT") {
    try {
      await chat_connection_repository.create_chat_connection(connection_id);
    } catch (e) {
      return callback(null, {
        statusCode: 500,
      });
    }
    return callback(null, {
      statusCode: 200,
    });
  } else if (event.requestContext.eventType === "DISCONNECT") {
    try {
      await chat_connection_repository.remove_chat_connection(connection_id);
    } catch (e) {
      return callback(null, {
        statusCode: 500,
      });
    }
    return callback(null, {
      statusCode: 200,
    });
  }
}
