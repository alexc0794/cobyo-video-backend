export default interface User {
  user_id: string,
  facebook_user_id: string|null,
  email: string|null,
  first_name: string,
  last_name: string|null,
  profile_picture_url: string|null,
  wallet_in_cents: number,
};

export interface InventoryItem {
  userId: string,
  itemId: string,
  fromUserId: string,
  purchasedAt: string,
  itemIdPurchasedAt: string,
  expiringAtSeconds: number,
};
