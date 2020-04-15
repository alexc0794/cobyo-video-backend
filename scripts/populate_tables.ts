import ChannelRepository from '../src/repositories/channel_repository';
import { VideoConnection, DEFAULT_VIDEO_CONNECTION, TableShape } from '../src/enums';

async function populate() {
  const channelRepository = new ChannelRepository();
  await channelRepository.updateChannel(
    'club1a',
    new Array(10).fill(null),
    'Table 1',
    DEFAULT_VIDEO_CONNECTION,
    TableShape.UDown,
  );

  await channelRepository.updateChannel(
    'club1b',
    new Array(10).fill(null),
    'Table 2',
    DEFAULT_VIDEO_CONNECTION,
    TableShape.UDown,
  );

  await channelRepository.updateChannel(
    'club2a',
    new Array(24).fill(null),
    'Dance Floor',
    VideoConnection.AudioOnly,
    TableShape.DanceFloor,
  );
}

populate();
