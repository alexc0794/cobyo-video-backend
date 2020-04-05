import dotenv from 'dotenv';
dotenv.config();

// Local ports
export const EXPRESS_PORT = 8080;
export const WS_PORT = 8888;
const DDB_PORT = 8000;

export const IS_DEV = process.env.NODE_ENV == 'development';
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;


// OpenTok API configurations
export const AGORA_APP_ID = process.env.AGORA_APP_ID;
export const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

// AWS configurations
const AWS_LOCAL_CONFIG = {
  region: 'local',
  endpoint: `http://localhost:${DDB_PORT}`,
};
const AWS_REMOTE_CONFIG = {
  region: 'us-east-1',
};
export const AWS_CONFIG = IS_DEV ? AWS_LOCAL_CONFIG : AWS_REMOTE_CONFIG;
