import * as stockService from '../services/stockService.js';
import { logAction } from '../services/auditService.js';

export const getAllStock = async (req, res) => {
  try {
    const stocks = await stockService.getAllStock(req.user.id);
    res.status(200).json(stocks);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving stock', error: error.message });
  }
};

export const getStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const stock = await stockService.getStockByProductId(req.user.id, productId);

    if (!stock) {
      return res.status(404).json({ message: 'Stock not found for this product' });
    }

    res.status(200).json(stock);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving stock', error: error.message });
  }
};

export const createStock = async (req, res) => {
  try {
    const newStock = await stockService.createStock(req.user.id, req.body);
    await logAction(req.user.id, 'CREATE_STOCK', { productId: newStock.productId, details: newStock });
    res.status(201).json(newStock);
  } catch (error) {
    res.status(500).json({ message: 'Error creating stock', error: error.message });
  }
};

export const createMultipleStocks = async (req, res) => {
  try {
    const newStocks = await stockService.createMultipleStocks(req.user.id, req.body);
    for (const stock of newStocks) {
      await logAction(req.user.id, 'CREATE_STOCK', { productId: stock.productId, details: stock });
    }
    res.status(201).json(newStocks);
  } catch (error) {
    res.status(500).json({ message: 'Error creating stocks', error: error.message });
  }
};

export const updateStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const updates = req.body;

    const updatedStock = await stockService.updateStock(req.user.id, productId, updates);

    if (!updatedStock) {
      return res.status(404).json({ message: 'Stock not found for this product' });
    }

    await logAction(req.user.id, 'UPDATE_STOCK', { productId, changes: updates });
    res.status(200).json(updatedStock);
  } catch (error) {
    res.status(500).json({ message: 'Error updating stock', error: error.message });
  }
};

export const deleteStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const result = await stockService.deleteStock(req.user.id, productId);

    if (result === 0) {
      return res.status(404).json({ message: 'Stock not found for this product' });
    }

    await logAction(req.user.id, 'DELETE_STOCK', { productId });
    res.status(200).json({ message: 'Stock deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting stock', error: error.message });
  }
};
