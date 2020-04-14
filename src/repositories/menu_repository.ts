import BaseRepository from './base_repository';
import { Storefront } from '../enums/storefront';
import { MenuItemCategory } from '../enums/menu';
import { Menu, MenuItem } from '../interfaces/menu';

export default class MenuRepository extends BaseRepository {

  items = {
    daquiri: {
      itemId: 'daquiri',
      name: 'Daiquiri',
      cents: 1000,
      inventory: 1,
      category: MenuItemCategory.Drink,
      imageUrl: 'https://cobyo-video-images.s3.amazonaws.com/menu/daiquiri.png',
      expirationInSeconds: 1800 // 30 minutes
    },
    'midori-sour': {
      itemId: 'midori-sour',
      name: 'Midori Sour',
      cents: 500,
      inventory: 1,
      category: MenuItemCategory.Drink,
      imageUrl: 'https://cobyo-video-images.s3.amazonaws.com/menu/midori.png',
      expirationInSeconds: 1800 // 30 minutes
    },
    'mojito': {
      itemId: 'mojito',
      name: 'Mojito',
      cents: 700,
      inventory: 1,
      category: MenuItemCategory.Drink,
      imageUrl: 'https://cobyo-video-images.s3.amazonaws.com/menu/mojito.png',
      expirationInSeconds: 1800 // 30 minutes
    }
  }

  get_menu_by_storefront(storefront: Storefront): Menu {
    switch (storefront) {
      case Storefront.Club:
        return {
          items: ['daquiri', 'midori-sour', 'mojito'].map(itemId => this.items[itemId])
        };
      default:
        return {
          items: [],
        };
    }
  }

  getMenuByItemId(itemId: string) : MenuItem|null {
    return itemId in this.items ? this.items[itemId] : null;
  }
}
