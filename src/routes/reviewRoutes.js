import express from 'express';
import * as reviewController from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router({ mergeParams: true });

router.post('/', protect, reviewController.addReview);
router.get('/', reviewController.getReviewsByProduct);

export default router;
