import * as promotionService from '../services/promotionService.js';

export const createPromotion = async (req, res) => {
  try {
    // Admin creates promotion for a user
    const { userId, ...promotionData } = req.body;
    if (!userId) {
        return res.status(400).json({ message: 'userId is required' });
    }
    const promotion = await promotionService.createPromotion(userId, promotionData);
    res.status(201).json(promotion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllPromotions = async (req, res) => {
  try {
    let promotions;
    // Admins can see all promotions, other users see their own
    if (req.user.role === 'Admin') {
        promotions = await promotionService.getAllPromotions();
    } else {
        promotions = await promotionService.getAllPromotionsForUser(req.user.id);
    }
    res.status(200).json(promotions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPromotion = async (req, res) => {
  try {
    const { id: promotionId } = req.params;
    const promotion = await promotionService.getPromotion(promotionId);
    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }
    // Optional: Add authorization check if users should only see their own promotions
    res.status(200).json(promotion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePromotion = async (req, res) => {
  try {
    const { id: promotionId } = req.params;
    await promotionService.deletePromotion(promotionId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
