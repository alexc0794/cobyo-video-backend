import { ChannelConnection } from '../interfaces/channel';
import ChannelConnectionRepository from '../repositories/channel_connection_repository';
import ApiGatewayService from '../services/api_gateway_service';

export async function broadcastToChannel(event, channelId, payload): Promise<Array<ChannelConnection>> {
  const channelConnectionRepository = new ChannelConnectionRepository();
  const connections: Array<ChannelConnection> = await channelConnectionRepository.get_channel_connections(channelId);
  const apiGatewayService = new ApiGatewayService(`${event.requestContext.domainName}/${event.requestContext.stage}`);
  connections.forEach((connection: ChannelConnection) => {
    apiGatewayService.send(connection.connection_id, payload);
  });
  return connections;
}
