import * as productService from '../services/productService.js';
import { logAction } from '../services/auditService.js';

export const getAllProducts = async (req, res) => {
  try {
    const { sortBy, sortOrder, page, limit } = req.query;
    const options = {
        sortBy,
        sortOrder,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
    };
    const products = await productService.getAllProducts(req.user.id, options);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving products', error: error.message });
  }
};

export const getProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await productService.getProductById(req.user.id, productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving product', error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const newProduct = await productService.createProduct(req.user.id, req.body);
    await logAction(req.user.id, 'CREATE_PRODUCT', { productId: newProduct.id, details: newProduct });
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
};

export const createMultipleProducts = async (req, res) => {
  try {
    const productsData = req.body;
    const newProducts = await productService.createMultipleProducts(req.user.id, productsData);
    for (const newProduct of newProducts) {
      await logAction(req.user.id, 'CREATE_PRODUCT', { productId: newProduct.id, details: newProduct });
    }
    res.status(201).json(newProducts);
  } catch (error) {
    res.status(500).json({ message: 'Error creating products', error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const updates = req.body;

    const updatedProduct = await productService.updateProduct(req.user.id, productId, updates);

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await logAction(req.user.id, 'UPDATE_PRODUCT', { productId, changes: updates });
    res.status(200).json({ message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const result = await productService.deleteProduct(req.user.id, productId);

    if (result === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await logAction(req.user.id, 'DELETE_PRODUCT', { productId });
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};
