import { Router, Request, Response } from 'express';
import bodyParser from 'body-parser';
import { authenticate } from '../middleware';
import { InventoryItem } from '../../interfaces';
import UserInventoryRepository from '../../repositories/users/user_inventory_repository';

export default (app: Router) => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  type GetUserInventory = {
    inventoryItems: Array<InventoryItem>,
  };

  app.get('/user-inventory', authenticate, async function(req: any, res) {
    const userId: string = req.user.userId;
    try {
      const inventoryItems: Array<InventoryItem> = await (new UserInventoryRepository()).getInventoryByUserId(userId);
      const response: GetUserInventory = { inventoryItems };
      return res.send(response);
    } catch {
      return res.sendStatus(500);
    }
  });

}
