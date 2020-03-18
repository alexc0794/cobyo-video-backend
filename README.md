# cobyo-video-backend
Express backend for video chat capabilities

## Endpoints
### GET /token
- Request token from Agora API

## Development
The project is written in TypeScript, so the .ts files need to be built into .js files, which are located in the /build folder.
```
// Build local changes and run app locally
npm run build && npm run start
```
If the app does not start listening to localhost, check your .env file. The app should listen when `process.env.NODE_ENV=='development`.

See `package.json` for other scripts to run.

## Deploying
This project is deployed using [serverless](https://dashboard.serverless.com/tenants/alexchou94/applications/). Deploying can be done by simply running `npm run deploy` command, which will build the project and deploy with the `serverless` CLI. This change should propogate to AWS. Configuration can be found in `serverless.yml`.
