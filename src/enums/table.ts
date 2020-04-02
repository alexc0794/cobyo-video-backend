export enum Shape {
  Rectangular = 'RECTANGULAR', // No one at ends. If we want ppl at ends, add a new enum
  Round = 'ROUND',
};

export const DEFAULT_SHAPE = Shape.Rectangular;

export enum Connection {
  VideoAudio = 'VIDEO_AUDIO',
  VideoOnly = 'VIDEO_ONLY',
  AudioOnly = 'AUDIO_ONLY',
  VideoAudioBroadcast = 'VIDEO_AUDIO_BROADCAST',
  AudioOnlyBroadcast = 'AUDIO_ONLY_BROADCAST', // use case: subscribe to a DJ?
};

export const DEFAULT_CONNECTION_TYPE = Connection.VideoAudio;
