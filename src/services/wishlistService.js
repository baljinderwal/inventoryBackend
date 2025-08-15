import redisClient from '../config/redisClient.js';

const WISHLIST_KEY_PREFIX = 'wishlist:';

export const getWishlistByUserId = async (userId) => {
  const productIds = await redisClient.smembers(`${WISHLIST_KEY_PREFIX}${userId}`);
  return productIds;
};

export const addProductToWishlist = async (userId, productId) => {
  await redisClient.sadd(`${WISHLIST_KEY_PREFIX}${userId}`, productId);
};

export const removeProductFromWishlist = async (userId, productId) => {
  await redisClient.srem(`${WISHLIST_KEY_PREFIX}${userId}`, productId);
};
