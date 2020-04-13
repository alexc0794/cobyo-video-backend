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

### HTTPS
The backend is run on https, so you must have `server.cert` and `server.key`. These should be generated locally and not made public, which is why they are in the .gitignore. To generate a self-signed certificate, go to the root `cobyo-video-backend` folder and run:
```
openssl req -nodes -new -x509 -keyout server.key -out server.cert
```

### DynamoDB
Install [AWS CLI](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Tools.CLI.html) and [local DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.DownloadingAndRunning.html).

Create DynamoDB tables locally by adding the appropriate commands in in `scripts/create_tables.ts` and `scripts/delete_tables.ts`.
```
// Create tables
npm run ddb

// Or more aggressively, delete tables and create new ones
npm run ddbr
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

{"action": "purchasedMenuItem", "fromUserId": "1", "itemId": "daquiri", "userId": "3935076807", "channelId": "club1b"}
```

## Deploying
This project is deployed using [serverless](https://dashboard.serverless.com/tenants/alexchou94/applications/). Deploying can be done by simply running `npm run deploy` command, which will build the project and deploy with the `serverless` CLI. This change should propogate to AWS. Configuration can be found in `serverless.yml`.
