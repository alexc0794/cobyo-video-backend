# cobyo-video-backend
Express backend for video chat capabilities

## Development
The project is written in TypeScript, so the .ts files need to be built into .js files, which are located in the /build folder.
```
// [Tab 1] Build local changes and run the Express API locally on port 8080
npm run dev

// [Tab 2] Build local changes and run WebSockets locally on port 8888
npm run ws

// [Tab 3] Run local DynamoDB on port 8000 (see DynamoDB section for more info)
java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb
```

See `package.json` for other scripts to run.

### DynamoDB
Install [AWS CLI](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Tools.CLI.html) and [local DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.DownloadingAndRunning.html).

Create DynamoDB tables locally by adding the command in `scripts/create_tables.ts`.
```
// Build local changes and run the script
npm run ddb
```

### WebSockets
The project uses WebSockets to implement features like chat. There are two ways to test this in development.
The first is to manually test it with several tabs open acting as different users chatting back and forth.
The second involves using the terminal to simulate a connection.

```
// Install from npm if you dont have wscat already. This command will connect you to the chat.
wscat -c ws://localhost:8888 // if successful, you should see "Connected (press CTRL+C to quit)"

// Now send a message
{"action": "chat_message", "message": "hi", "user_id": "1"} // if successful, you should see the message sent back to you
```

## Deploying
This project is deployed using [serverless](https://dashboard.serverless.com/tenants/alexchou94/applications/). Deploying can be done by simply running `npm run deploy` command, which will build the project and deploy with the `serverless` CLI. This change should propogate to AWS. Configuration can be found in `serverless.yml`.
