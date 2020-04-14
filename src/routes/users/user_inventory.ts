import { Router } from 'express';
import bodyParser from 'body-parser';
import { authenticate } from '../middleware';
import { InventoryItem } from '../../interfaces/user';
import UserInventoryRepository from '../../repositories/users/user_inventory_repository';

export default (app: Router) => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.get('/user-inventory', authenticate, async function(req: any, res) {
    const userId: string = req.user.user_id;
    try {
      const inventoryItems: Array<InventoryItem> = await (new UserInventoryRepository()).getInventoryByUserId(userId);
      return res.send({ inventoryItems });
    } catch {
      return res.status(500).send({ inventoryItems: [] });
    }
  });

}
