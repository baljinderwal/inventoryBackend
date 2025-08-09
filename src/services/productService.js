import redisClient from '../config/redisClient.js';

const PRODUCT_KEY_PREFIX = 'product:';

export const getProductById = async (sku) => {
  const product = await redisClient.get(`${PRODUCT_KEY_PREFIX}${sku}`);
  return product ? JSON.parse(product) : null;
};

export const createProduct = async (product) => {
  await redisClient.set(`${PRODUCT_KEY_PREFIX}${product.sku}`, JSON.stringify(product));
};

export const updateProduct = async (sku, updates) => {
  const key = `${PRODUCT_KEY_PREFIX}${sku}`;
  const existingProduct = await redisClient.get(key);

  if (!existingProduct) {
    return null;
  }

  const product = JSON.parse(existingProduct);
  const updatedProduct = { ...product, ...updates };

  await redisClient.set(key, JSON.stringify(updatedProduct));
  return updatedProduct;
};

export const deleteProduct = async (sku) => {
  const result = await redisClient.del(`${PRODUCT_KEY_PREFIX}${sku}`);
  return result;
};
