import BaseRepository from './base_repository';
import { Storefront } from '../enums/storefront';
import { MenuItemCategory } from '../enums/menu';
import { Menu, MenuItem } from '../interfaces/menu';

export default class MenuRepository extends BaseRepository {

  get_menu_by_storefront(storefront: Storefront): Menu {
    switch (storefront) {
      case Storefront.Club:
        return {
          items: [{
            name: 'Daiquiri',
            cents: 10000,
            inventory: 1,
            category: MenuItemCategory.Drink,
            imageUrl: 'https://cobyo-video-images.s3.amazonaws.com/menu/daiquiri.png',
          }, {
            name: 'Midori Sour',
            cents: 5000,
            inventory: 1,
            category: MenuItemCategory.Drink,
            imageUrl: 'https://cobyo-video-images.s3.amazonaws.com/menu/midori.png',
          }, {
            name: 'Mojito',
            cents: 7000,
            inventory: 1,
            category: MenuItemCategory.Drink,
            imageUrl: 'https://cobyo-video-images.s3.amazonaws.com/menu/mojito.png',
          }]
        };
      default:
        return {
          items: [],
        };
    }
  }

}
