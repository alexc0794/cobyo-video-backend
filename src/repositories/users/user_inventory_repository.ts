import BaseRepository from '../base_repository';
import User, { InventoryItem } from '../../interfaces/user';


export default class UserInventoryRepository extends BaseRepository {

  table_name = 'UserInventory';

  async getInventoryByUserId(userId: string): Promise<Array<InventoryItem>> {
    return new Promise((resolve, reject) =>
      this.aws_client.query({
        'TableName': this.table_name,
        'KeyConditionExpression': 'userId = :userId',
        'ExpressionAttributeValues': {
          ':userId': userId,
        }
      }, (err, data) => {
        if (err) {
          console.error('Failed to get inventory with user id', userId, err);
          return reject();
        }
        return resolve(data.Items);
      })
    );
  }

  async addItemToInventory(userId: string, itemId: string, fromUserId: string, expirationInSeconds: number): Promise<InventoryItem> {
    const purchasedAt = (new Date()).toISOString();
    const item: InventoryItem = {
      userId,
      itemId,
      fromUserId: userId,
      purchasedAt,
      itemIdPurchasedAt: `${itemId}_${purchasedAt}`,
      expiringAtSeconds: Math.round(Date.now() / 1000) + expirationInSeconds,
    };
    return new Promise((resolve, reject) =>
      this.aws_client.put({
        'TableName': this.table_name,
        'Item': item,
      }, (err, data) => {
        if (err) {
          console.error('Failed to add item to user inventory', userId, itemId, err);
          return reject();
        }
        return resolve(item);
      })
    );
  }

}
