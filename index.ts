/**
  Currently assuming there is only one user. So there can only exist one valid authorization code at a time.
**/
import serverless from 'serverless-http';
import express from 'express';
import {IS_DEV, PORT} from './config';

const app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

require('./src/routes').default(app);

if (IS_DEV) {
  app.listen(PORT, () => {
    console.log('List of available endpoints:');
    console.log();
    console.log(`http://localhost:${PORT}/token/1`);
    console.log(`http://localhost:${PORT}/table/1`);
    console.log(`http://localhost:${PORT}/table/1/keywords`);
    console.log(`http://localhost:${PORT}/storefront`);
    // Add more here
  });
}

module.exports.handler = serverless(app);
