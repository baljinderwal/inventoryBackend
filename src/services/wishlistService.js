import { v4 as uuidv4 } from 'uuid';
import redisClient from '../config/redisClient.js';

const getWishlistKey = (userId) => `s:user:${userId}:wishlists`;

export const getWishlistByUserId = async (userId) => {
  const wishlist = await redisClient.hgetall(getWishlistKey(userId));
  if (!wishlist) {
    return [];
  }
  return Object.values(wishlist).map(item => JSON.parse(item));
};

export const addProductToWishlist = async (userId, productId) => {
  const wishlistId = uuidv4();
  const wishlistItem = { id: wishlistId, productId };
  await redisClient.hset(getWishlistKey(userId), wishlistId, JSON.stringify(wishlistItem));
  return wishlistItem;
};

export const removeProductFromWishlist = async (userId, wishlistId) => {
  await redisClient.hdel(getWishlistKey(userId), wishlistId);
};
