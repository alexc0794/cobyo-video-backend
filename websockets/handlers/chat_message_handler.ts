import uuid4 from 'uuid4';
import { ChatConnection, ChatMessage } from '../interfaces/chat';
import ChatConnectionRepository from '../repositories/chat_connection_repository';
import ChatMessageRepository from '../repositories/chat_message_repository';
import ApiGatewayService from '../services/api_gateway_service';

interface ChatMessageInput {
  message: string,
  user_id: string,
};

function extract_chat_message_input(body): ChatMessageInput {
  const body_json = JSON.parse(body);
  const message = body_json.message;
  const user_id = body_json.user_id;
  if (!message || !user_id) {
    throw new Error(`Missing input message:<${message}>, user_id:<${user_id}>`);
  }
  return {
    message,
    user_id,
  };
}

export default async function chat_message_handler(event, context, callback) {
  console.log(event, context, callback);
  let message, user_id;
  try {
    const input = extract_chat_message_input(event.body);
    message = input.message;
    user_id = input.user_id;
  } catch (e) {
    console.error(e);
    return callback(null, {
      statusCode: 400,
    });
  }

  const chat_message: ChatMessage = {
    message_id: uuid4(),
    user_id,
    sent_at: (new Date()).toISOString(),
    message,
  };
  // Save chat to data store
  const chat_message_repository = new ChatMessageRepository();
  const success = await chat_message_repository.create_message(chat_message);
  if (!success) {
    return callback(null, {
      statusCode: 500
    });
  }

  // Send chat to all connections
  const chat_connection_repository = new ChatConnectionRepository();
  const connections: Array<ChatConnection> = await chat_connection_repository.get_connections();
  const api_gateway_service = new ApiGatewayService(`${event.requestContext.domainName}/${event.requestContext.stage}`);
  connections.forEach((connection: ChatConnection) => {
    api_gateway_service.send(connection.connection_id, chat_message);
  });

  return callback(null, {
    statusCode: 200
  });
}
