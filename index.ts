/**
  Currently assuming there is only one user. So there can only exist one valid authorization code at a time.
**/
import serverless from 'serverless-http';
import express from 'express';
import connection_handler from './websockets/handlers/connection_handler';
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

module.exports.connectionHandler = connection_handler;

module.exports.defaultHandler = (event, context, callback) => {
  callback(null, {
    statusCode: 200,
    body: "default handler was called."
  });
};
