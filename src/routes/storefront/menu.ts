import { Router } from 'express';
import bodyParser from 'body-parser';
import { feature_overrides } from '../middleware';
import { Storefront } from '../../enums/storefront';
import { Menu } from '../../interfaces/menu';
import MenuRepository from '../../repositories/menu_repository';

export default (app: Router) => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.get('/menu/:storefront', function(req, res) {
    let storefront: Storefront;
    switch (req.params.storefront.toUpperCase()) {
      case 'CLUB': {
        storefront = Storefront.Club;
        break;
      }
      case 'CAFE': {
        storefront = Storefront.Cafe;
        break;
      }
      case 'CAFETERIA': {
        storefront = Storefront.Cafeteria;
        break;
      }
      default:
        storefront = Storefront.Cafeteria;
    }
    const menu_repository = new MenuRepository();
    const menu: Menu = menu_repository.get_menu_by_storefront(storefront);

    res.send({
      menu,
    });
  });
}