import { Router } from 'express';
import bodyParser from 'body-parser';
import { feature_overrides } from '../middleware';
import StorefrontRepository from '../../repositories/storefront_repository';
import moment from 'moment-timezone';

function get_nyc_moment() {
  return moment().tz("America/New_York");
}

export default (app: Router) => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.get('/storefront', feature_overrides, function(req, res) {
    const storefront_repository = new StorefrontRepository();
    const { storefront, status } = storefront_repository.get_storefront_by_moment(get_nyc_moment());
    const table_id_grid = storefront_repository.get_storefront_table_id_grid(storefront);

    res.send({
      storefront,
      status,
      table_id_grid,
    });
  });
}
