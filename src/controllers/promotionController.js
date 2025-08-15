import * as promotionService from '../services/promotionService.js';

export const createPromotion = async (req, res) => {
  try {
    const promotion = await promotionService.createPromotion(req.body);
    res.status(201).json(promotion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllPromotions = async (req, res) => {
  try {
    const promotions = await promotionService.getAllPromotions();
    res.status(200).json(promotions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPromotion = async (req, res) => {
  try {
    const promotion = await promotionService.getPromotion(req.params.id);
    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }
    res.status(200).json(promotion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePromotion = async (req, res) => {
  try {
    await promotionService.deletePromotion(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
