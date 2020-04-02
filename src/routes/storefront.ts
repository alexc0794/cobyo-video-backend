import { Router } from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import { authenticate } from './middleware';
import StorefrontRepository from '../repositories/storefront_repository';
import moment from 'moment-timezone';

function get_nyc_moment() {
  return moment().tz("America/New_York");
}

export default (app: Router) => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.get('/storefront', function(req, res) {
    const storefront_repository = new StorefrontRepository();
    const { storefront, status } = storefront_repository.get_storefront_by_moment(get_nyc_moment());
    const table_ids = storefront_repository.get_storefront_table_ids(storefront);

    res.send({
      storefront,
      status,
      table_ids,
    });
  });
}
