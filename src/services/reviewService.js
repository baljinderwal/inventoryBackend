import redisClient from '../config/redisClient.js';
import { v4 as uuidv4 } from 'uuid';
import { getProductByNumericId, updateProductById } from './productService.js';

const REVIEW_PREFIX = 'review:';
const PRODUCT_REVIEWS_PREFIX = 'product-reviews:';

export const addReview = async (productId, userId, reviewData) => {
  const reviewId = uuidv4();
  const review = { id: reviewId, productId, userId, ...reviewData, createdAt: new Date().toISOString() };

  await redisClient.set(`${REVIEW_PREFIX}${reviewId}`, JSON.stringify(review));
  await redisClient.sadd(`${PRODUCT_REVIEWS_PREFIX}${productId}`, reviewId);

  // Update product's average rating
  await updateProductRating(productId);

  return review;
};

export const getReviewsByProduct = async (productId) => {
  const reviewIds = await redisClient.smembers(`${PRODUCT_REVIEWS_PREFIX}${productId}`);
  if (reviewIds.length === 0) {
    return [];
  }
  const reviews = await redisClient.mget(reviewIds.map(id => `${REVIEW_PREFIX}${id}`));
  return reviews.map(r => JSON.parse(r));
};

const updateProductRating = async (productId) => {
  const reviews = await getReviewsByProduct(productId);
  if (reviews.length === 0) {
    return;
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  const product = await getProductByNumericId(productId);
  if (product) {
    product.averageRating = averageRating;
    product.reviewCount = reviews.length;
    await updateProductById(productId, product);
  }
};
