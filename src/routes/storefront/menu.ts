import { Router } from 'express';
import bodyParser from 'body-parser';
import { feature_overrides, authenticate } from '../middleware';
import { Storefront } from '../../enums/storefront';
import { Menu, MenuItem } from '../../interfaces/menu';
import { InventoryItem } from '../../interfaces/user';
import MenuRepository from '../../repositories/menu_repository';
import UserRepository from '../../repositories/users/user_repository';
import UserInventoryRepository from '../../repositories/users/user_inventory_repository';

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

  app.post('/menu/purchase', authenticate, async function (req: any, res) {
    const fromUserId: string = req.user.user_id;
    const itemId: string = req.body.itemId;
    const toUserId: string = req.body.toUserId || fromUserId;
    const menuItem: MenuItem|null = (new MenuRepository()).getMenuByItemId(itemId)
    if (!menuItem) {
      return res.sendStatus(500);
    }

    let updatedWalletInCents: number;
    try {
      updatedWalletInCents = await (new UserRepository()).updateUserWallet(fromUserId, -1 * menuItem.cents);
      if (updatedWalletInCents < 0) {
        console.warn('Shouldnt have gotten to a state where user has negative amount in wallet');
        // Revert the update if user didnt have enough money
        updatedWalletInCents = await (new UserRepository()).updateUserWallet(fromUserId, menuItem.cents);
        return res.status(400).send({ updatedWalletInCents, inventoryItem: null });
      }
    } catch {
      return res.sendStatus(500);
    }

    let inventoryItem: InventoryItem;
    try {
      inventoryItem = await (new UserInventoryRepository()).addItemToInventory(
        toUserId, // Send to toUserId
        itemId,
        fromUserId,
        menuItem.expirationInSeconds,
      );
    } catch {
      // Add money back to user
      updatedWalletInCents = await (new UserRepository()).updateUserWallet(fromUserId, menuItem.cents);
      return res.status(400).send({ updatedWalletInCents, inventoryItem: null });
    }

    return res.send({
      updatedWalletInCents,
      inventoryItem,
    });
  });
}
