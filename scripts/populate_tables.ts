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

  await channelRepository.updateChannel(
    'club2b',
    new Array(6).fill(null),
    'Table 3',
    VideoConnection.AudioOnly,
    TableShape.Rectangular,
  );

  await channelRepository.updateChannel(
    'club2c',
    new Array(6).fill(null),
    'Table 4',
    VideoConnection.AudioOnly,
    TableShape.Rectangular,
  );

  await channelRepository.updateChannel(
    'club3a',
    new Array(8).fill(null),
    'Table 5',
    VideoConnection.AudioOnly,
    TableShape.UUp,
  );

  await channelRepository.updateChannel(
    'club3b',
    new Array(10).fill(null),
    'Table 6',
    VideoConnection.AudioOnly,
    TableShape.UUp,
  );

  await channelRepository.updateChannel(
    '1a',
    new Array(10).fill(null),
    'Table 1',
    DEFAULT_VIDEO_CONNECTION,
    TableShape.UDown,
  );

  await channelRepository.updateChannel(
    '1b',
    new Array(10).fill(null),
    'Table 2',
    DEFAULT_VIDEO_CONNECTION,
    TableShape.UDown,
  );

  await channelRepository.updateChannel(
    '2a',
    new Array(8).fill(null),
    'Table 3',
    DEFAULT_VIDEO_CONNECTION,
    TableShape.UUp,
  );

  await channelRepository.updateChannel(
    '2b',
    new Array(8).fill(null),
    'Table 4',
    DEFAULT_VIDEO_CONNECTION,
    TableShape.Rectangular,
  );

  await channelRepository.updateChannel(
    '2c',
    new Array(16).fill(null),
    'Table 5',
    DEFAULT_VIDEO_CONNECTION,
    TableShape.Rectangular,
  );

}

populate();
