import redisClient from '../config/redisClient.js';
import { v4 as uuidv4 } from 'uuid';

const PROMOTION_PREFIX = 'promotion:';
const PROMOTIONS_SET = 'promotions';

export const createPromotion = async (promotionData) => {
  const promotionId = uuidv4();
  const promotion = { id: promotionId, ...promotionData };
  await redisClient.set(`${PROMOTION_PREFIX}${promotionId}`, JSON.stringify(promotion));
  await redisClient.sadd(PROMOTIONS_SET, promotionId);
  return promotion;
};

export const getAllPromotions = async () => {
  const promotionIds = await redisClient.smembers(PROMOTIONS_SET);
  if (promotionIds.length === 0) {
    return [];
  }
  const promotions = await redisClient.mget(promotionIds.map(id => `${PROMOTION_PREFIX}${id}`));
  return promotions.map(p => JSON.parse(p));
};

export const getPromotion = async (promotionId) => {
  const promotion = await redisClient.get(`${PROMOTION_PREFIX}${promotionId}`);
  return promotion ? JSON.parse(promotion) : null;
};

export const deletePromotion = async (promotionId) => {
  await redisClient.del(`${PROMOTION_PREFIX}${promotionId}`);
  await redisClient.srem(PROMOTIONS_SET, promotionId);
};

export const getActivePromotionsForProduct = async (productId) => {
    // This is a simplified implementation. A real-world scenario would involve
    // more complex logic to check for active promotions for a given product.
    // For now, we'll just get all promotions.
    return await getAllPromotions();
};
