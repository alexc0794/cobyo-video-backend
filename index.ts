/**
  Currently assuming there is only one user. So there can only exist one valid authorization code at a time.
**/
import serverless from 'serverless-http';
import express from 'express';
import chat_connection_handler from './websockets/handlers/chat_connection_handler';
import chat_message_handler from './websockets/handlers/chat_message_handler';
import {IS_DEV, PORT} from './config';

const app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

require('./express/routes').default(app);

if (IS_DEV) {
  app.listen(PORT, () => {
    console.log('List of available endpoints:');
    console.log();
    console.log(`http://localhost:${PORT}/storefront`);
    console.log(`http://localhost:${PORT}/token/1`);
    console.log(`http://localhost:${PORT}/table/1`);
    console.log(`http://localhost:${PORT}/table/1/keywords`);
    // Add more here
  });
}

module.exports.expressHandler = serverless(app);

module.exports.connectionHandler = chat_connection_handler;

module.exports.defaultHandler = chat_message_handler;
