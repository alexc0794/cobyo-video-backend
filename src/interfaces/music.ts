export interface SpotifyToken {
  userId: string,
  accessToken: string,
  refreshToken: string,
  lastRefreshedAt: string,
};

export interface CurrentlyPlaying {
  channelId: string,
  fromUserId: string,
  trackId: string,
  trackUri: string,
  trackName: string,
  artistName: string,
  position: number,
  duration: number,
  paused: boolean,
  updatedAtMs: number,
};
