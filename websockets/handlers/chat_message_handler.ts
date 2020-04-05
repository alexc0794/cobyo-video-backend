import { ChatConnection } from '../interfaces/chat';
import ChatConnectionRepository from '../repositories/chat_connection_repository';
import ApiGatewayService from '../services/api_gateway_service';

export default async function chat_message_handler(event, context, callback) {
  console.log(event, context, callback);
  const message = JSON.parse(event.body).message;
  const chat_connection_repository = new ChatConnectionRepository();
  const connections: Array<ChatConnection> = await chat_connection_repository.get_connections();
  const api_gateway_service = new ApiGatewayService(`${event.requestContext.domainName}/${event.requestContext.stage}`);
  connections.forEach((connection: ChatConnection) => {
    console.log('Sending to connection', connection);
    api_gateway_service.send(connection.connection_id, message);
  });

  return callback(null, {
    statusCode: 200
  });
}
