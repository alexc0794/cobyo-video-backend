# cobyo-video-backend
Express backend for video chat capabilities

## Development
The project is written in TypeScript, so the .ts files need to be built into .js files, which are located in the /build folder.
```
// Build local changes and run app locally
npm run dev
```

See `package.json` for other scripts to run.

### DynamoDB
Create DynamoDB tables locally by adding the command in `scripts/create_tables.ts`.
```
// Build local changes and run the script
npm run ddb
```

## Deploying
This project is deployed using [serverless](https://dashboard.serverless.com/tenants/alexchou94/applications/). Deploying can be done by simply running `npm run deploy` command, which will build the project and deploy with the `serverless` CLI. This change should propogate to AWS. Configuration can be found in `serverless.yml`.
