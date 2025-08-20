import redisClient from '../config/redisClient.js';
import { v4 as uuidv4 } from 'uuid';

const getPromotionUserKey = (userId) => `s:user:${userId}:promotions`;
const getPromotionKey = (promotionId) => `promotion:${promotionId}`;
const ALL_PROMOTIONS_SET = 'promotions';

export const createPromotion = async (userId, promotionData) => {
  const promotionId = uuidv4();
  const promotion = { id: promotionId, userId, ...promotionData };
  const promotionJSON = JSON.stringify(promotion);

  await redisClient.hset(getPromotionUserKey(userId), promotionId, promotionJSON);
  await redisClient.set(getPromotionKey(promotionId), promotionJSON);
  await redisClient.sadd(ALL_PROMOTIONS_SET, promotionId);

  return promotion;
};

// Gets all promotions for a specific user
export const getAllPromotionsForUser = async (userId) => {
  const promotions = await redisClient.hgetall(getPromotionUserKey(userId));
  if (!promotions) {
    return [];
  }
  return Object.values(promotions).map(p => JSON.parse(p));
};

// Gets all promotions (for admins)
export const getAllPromotions = async () => {
    const promotionIds = await redisClient.smembers(ALL_PROMOTIONS_SET);
    if (promotionIds.length === 0) {
        return [];
    }
    const promotions = await redisClient.mget(promotionIds.map(id => getPromotionKey(id)));
    return promotions.map(p => JSON.parse(p)).filter(p => p);
}

export const getPromotion = async (promotionId) => {
  const promotion = await redisClient.get(getPromotionKey(promotionId));
  return promotion ? JSON.parse(promotion) : null;
};

export const deletePromotion = async (promotionId) => {
  const promotion = await getPromotion(promotionId);
  if (promotion) {
    await redisClient.hdel(getPromotionUserKey(promotion.userId), promotionId);
    await redisClient.del(getPromotionKey(promotionId));
    await redisClient.srem(ALL_PROMOTIONS_SET, promotionId);
  }
};

export const getActivePromotionsForProduct = async (userId, productId) => {
    // This is a simplified implementation. A real-world scenario would involve
    // more complex logic to check for active promotions for a given product.
    // For now, we'll just get all promotions for the user.
    return await getAllPromotionsForUser(userId);
};
