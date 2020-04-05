import serverless from 'serverless-http';
import express from 'express';
import { IS_DEV, EXPRESS_PORT } from './config';

const app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

require('./src/routes').default(app);

if (IS_DEV) {
  app.listen(EXPRESS_PORT, () => {
    console.log('List of available endpoints:');
    console.log();
    console.log(`http://localhost:${EXPRESS_PORT}/storefront`);
    console.log(`http://localhost:${EXPRESS_PORT}/token/1`);
    console.log(`http://localhost:${EXPRESS_PORT}/table/1`);
    console.log(`http://localhost:${EXPRESS_PORT}/table/1/keywords`);
    console.log(`http://localhost:${EXPRESS_PORT}/chat/messages`);
  });
}


module.exports.expressHandler = serverless(app);
