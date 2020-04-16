export interface User {
  userId: string,
  facebookUserId: string|null,
  email: string|null,
  firstName: string,
  lastName: string|null,
  profilePictureUrl: string|null,
  walletInCents: number,
};

export interface InventoryItem {
  userId: string,
  itemId: string,
  fromUserId: string,
  purchasedAt: string,
  itemIdPurchasedAt: string,
  expiringAtSeconds: number,
};

export type ActiveUser = {
  userId: string,
  lastActiveAt: string,
};
