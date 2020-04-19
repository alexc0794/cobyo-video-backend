import ChannelRepository from '../src/repositories/channel_repository';
import { VideoConnection, DEFAULT_VIDEO_CONNECTION, TableShape } from '../src/enums';

async function populate() {
  const channelRepository = new ChannelRepository();
  await channelRepository.updateChannel(
    'devclub1a',
    new Array(10).fill(null),
    'Table 1',
    DEFAULT_VIDEO_CONNECTION,
    TableShape.UDown,
  );

  await channelRepository.updateChannel(
    'devclub1b',
    new Array(10).fill(null),
    'Table 2',
    DEFAULT_VIDEO_CONNECTION,
    TableShape.UDown,
  );

  await channelRepository.updateChannel(
    'devclub2a',
    new Array(24).fill(null),
    'Dance Floor',
    VideoConnection.AudioOnly,
    TableShape.DanceFloor,
  );

  await channelRepository.updateChannel(
    'devclub2b',
    new Array(6).fill(null),
    'Table 3',
    DEFAULT_VIDEO_CONNECTION,
    TableShape.Rectangular,
  );

  await channelRepository.updateChannel(
    'devclub2c',
    new Array(6).fill(null),
    'Table 4',
    DEFAULT_VIDEO_CONNECTION,
    TableShape.Rectangular,
  );

  await channelRepository.updateChannel(
    'devclub3a',
    new Array(8).fill(null),
    'Table 5',
    DEFAULT_VIDEO_CONNECTION,
    TableShape.UUp,
  );

  await channelRepository.updateChannel(
    'devclub3b',
    new Array(8).fill(null),
    'Table 6',
    DEFAULT_VIDEO_CONNECTION,
    TableShape.UUp,
  );
}

populate();
