import { MenuItemCategory } from '../enums/menu';

export interface MenuItem {
  name: string,
  cents: number,
  inventory: number,
  category: MenuItemCategory,
  imageUrl: string,
};

export interface Menu {
  items: Array<MenuItem>,
};
