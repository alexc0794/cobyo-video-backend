import { ChannelConnection } from '../interfaces/channel';
import ChannelConnectionRepository from '../repositories/channel_connection_repository';
import ApiGatewayService from '../services/api_gateway_service';

export async function broadcastToChannel(
  event: any,
  channelId: string,
  userId: string,
  payload: any,
): Promise<Array<ChannelConnection>> {
  const channelConnectionRepository = new ChannelConnectionRepository();
  const connections: Array<ChannelConnection> = await channelConnectionRepository.getChannelConnections(channelId);
  const apiGatewayService = new ApiGatewayService(`${event.requestContext.domainName}/${event.requestContext.stage}`);
  connections.forEach((connection: ChannelConnection) => {
    if (connection.userId !== userId) { // Don't send to self
      apiGatewayService.send(connection.connectionId, payload);
    }
  });
  return connections;
}
