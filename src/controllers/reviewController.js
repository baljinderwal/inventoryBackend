import * as reviewService from '../services/reviewService.js';

export const addReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const review = await reviewService.addReview(productId, req.user.id, req.body);
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReviewById = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await reviewService.getReview(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReviewsForUser = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const reviews = await reviewService.getReviewsByUser(userId);
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await reviewService.getReviewsByProduct(productId);
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
