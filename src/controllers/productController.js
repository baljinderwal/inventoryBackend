import * as productService from '../services/productService.js';

export const getAllProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving products', error: error.message });
  }
};

export const getProduct = async (req, res) => {
  try {
    const { id: sku } = req.params;
    const product = await productService.getProductById(sku);

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
    const { name, sku, category, price, costPrice, stock } = req.body;

    if (!sku) {
      return res.status(400).json({ message: 'Product SKU is required' });
    }

    const newProduct = { name, sku, category, price, costPrice, stock };
    await productService.createProduct(newProduct);
    res.status(201).json({ message: 'Product created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id: sku } = req.params;
    const updates = req.body;

    const updatedProduct = await productService.updateProduct(sku, updates);

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id: sku } = req.params;
    const result = await productService.deleteProduct(sku);

    if (result === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};
