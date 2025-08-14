import * as stockService from '../services/stockService.js';

export const getAllStock = async (req, res) => {
  try {
    const stocks = await stockService.getAllStock();
    res.status(200).json(stocks);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving stock', error: error.message });
  }
};

export const getStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const stock = await stockService.getStockByProductId(productId);

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
    const { productId, quantity, warehouse, batches } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const newStock = { productId, quantity, warehouse, batches };
    await stockService.createStock(newStock);
    res.status(201).json({ message: 'Stock created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating stock', error: error.message });
  }
};

export const updateStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const updates = req.body;

    const updatedStock = await stockService.updateStock(productId, updates);

    if (!updatedStock) {
      return res.status(404).json({ message: 'Stock not found for this product' });
    }

    res.status(200).json({ message: 'Stock updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating stock', error: error.message });
  }
};

export const deleteStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const result = await stockService.deleteStock(productId);

    if (result === 0) {
      return res.status(404).json({ message: 'Stock not found for this product' });
    }

    res.status(200).json({ message: 'Stock deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting stock', error: error.message });
  }
};
