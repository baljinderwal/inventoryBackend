import redisClient from '../config/redisClient.js';
import { v4 as uuidv4 } from 'uuid';
import { findProductByIdAcrossUsers } from './productService.js';

const getReviewUserKey = (userId) => `s:user:${userId}:reviews`;
const getReviewKey = (reviewId) => `review:${reviewId}`;
const getProductReviewsKey = (productId) => `product:${productId}:reviews`;


export const addReview = async (productId, userId, reviewData) => {
  const reviewId = uuidv4();
  const review = { id: reviewId, productId, userId, ...reviewData, createdAt: new Date().toISOString() };
  const reviewJSON = JSON.stringify(review);

  await redisClient.hset(getReviewUserKey(userId), reviewId, reviewJSON);
  // Storing review also by reviewId for easy lookup
  await redisClient.set(getReviewKey(reviewId), reviewJSON);
  await redisClient.sadd(getProductReviewsKey(productId), reviewId);


  // Update product's average rating
  await updateProductRating(productId);

  return review;
};

export const getReview = async (reviewId) => {
    const reviewJSON = await redisClient.get(getReviewKey(reviewId));
    return reviewJSON ? JSON.parse(reviewJSON) : null;
};

export const getReviewsByProduct = async (productId) => {
  const reviewIds = await redisClient.smembers(getProductReviewsKey(productId));
  if (reviewIds.length === 0) {
    return [];
  }
  const reviews = await redisClient.mget(reviewIds.map(id => getReviewKey(id)));
  return reviews.map(r => JSON.parse(r)).filter(r => r);
};

// New function to get reviews by user
export const getReviewsByUser = async (userId) => {
    const reviews = await redisClient.hgetall(getReviewUserKey(userId));
    if (!reviews) {
        return [];
    }
    return Object.values(reviews).map(r => JSON.parse(r));
}

const updateProductRating = async (productId) => {
  const reviews = await getReviewsByProduct(productId);
  if (reviews.length === 0) {
    return;
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  const product = await findProductByIdAcrossUsers(productId);
  if (product) {
    product.averageRating = averageRating;
    product.reviewCount = reviews.length;
    // await updateProductById(productId, product);
  }
};
