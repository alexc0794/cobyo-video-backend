import dotenv from 'dotenv';
dotenv.config();

export const IS_DEV = process.env.NODE_ENV == 'development';
export const PORT = 8080;
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

// Cobyo API configuration
// export const COBYO_API_URL = 'https://f3mf794ytg.execute-api.us-east-1.amazonaws.com/dev';

// OpenTok API configurations
export const AGORA_APP_ID = process.env.AGORA_APP_ID;
export const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

// AWS configurations
const AWS_LOCAL_CONFIG = {
  region: 'local',
  endpoint: 'http://localhost:8000',
};
const AWS_REMOTE_CONFIG = {
  region: 'us-east-1',
};
export const AWS_CONFIG = IS_DEV ? AWS_LOCAL_CONFIG : AWS_REMOTE_CONFIG;
