import { MenuItemCategory } from '../enums/menu';

export interface MenuItem {
  itemId: string,
  name: string,
  cents: number,
  inventory: number,
  category: MenuItemCategory,
  imageUrl: string,
  expirationInSeconds: number,
};

export interface Menu {
  items: Array<MenuItem>,
};
