import { Router, Request, Response } from 'express';
import bodyParser from 'body-parser';
import { featureOverrides, authenticate } from '../middleware';
import { Storefront } from '../../enums/storefront';
import { Menu, MenuItem } from '../../interfaces/menu';
import { InventoryItem } from '../../interfaces/user';
import MenuRepository from '../../repositories/menu_repository';
import UserRepository from '../../repositories/users/user_repository';
import UserInventoryRepository from '../../repositories/users/user_inventory_repository';

export default (app: Router) => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  type GetMenuResponse = {
    menu: Menu,
  };

  app.get('/menu/:storefront', function(req: Request, res: Response) {
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
    const menuRepository = new MenuRepository();
    const menu: Menu = menuRepository.getMenuByStorefront(storefront);

    const response: GetMenuResponse = { menu };
    res.send(response);
  });

  type PurchaseFromMenuResponse = {
    updatedWalletInCents: number,
    inventoryItem: InventoryItem,
    toUserIds: Array<string>,
  };

  // TODO: Authenticate instead of pass fromUserId from body
  app.post('/menu/purchase', async function (req: any, res) {
    const fromUserId: string = req.body.fromUserId;
    const itemId: string = req.body.itemId;
    const toUserId: string = req.body.toUserId || fromUserId;
    const toUserIds: Array<string> = [toUserId]; // TODO: Implement purchase for multiple ppl
    const menuItem: MenuItem|null = (new MenuRepository()).getMenuItemById(itemId)
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

    const response: PurchaseFromMenuResponse = { updatedWalletInCents, inventoryItem, toUserIds };
    return res.send(response);
  });
}
