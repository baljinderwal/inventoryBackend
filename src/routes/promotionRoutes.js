import express from 'express';
import * as promotionController from '../controllers/promotionController.js';
import { protect } from '../middleware/authMiddleware.js';
import authorize from '../middleware/authorize.js';

const router = express.Router();

router.post('/', protect, authorize(['admin']), promotionController.createPromotion);
router.get('/', protect, promotionController.getAllPromotions);
router.get('/:id', protect, promotionController.getPromotion);
router.delete('/:id', protect, authorize(['admin']), promotionController.deletePromotion);

export default router;
