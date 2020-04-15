export enum VideoConnection {
  VideoAudio = 'VIDEO_AUDIO',
  VideoOnly = 'VIDEO_ONLY',
  AudioOnly = 'AUDIO_ONLY',
  VideoAudioBroadcast = 'VIDEO_AUDIO_BROADCAST',
  AudioOnlyBroadcast = 'AUDIO_ONLY_BROADCAST',
};

export const DEFAULT_VIDEO_CONNECTION = VideoConnection.VideoAudio;

export enum TableShape {
  Rectangular = 'RECTANGULAR', // No one at ends. If we want ppl at ends, add a new enum
  Round = 'ROUND',
  UUp = 'U_UP',
  UDown = 'U_DOWN',
  DanceFloor = 'DANCE_FLOOR',
};

export const DEFAULT_TABLE_SHAPE = TableShape.Rectangular;
