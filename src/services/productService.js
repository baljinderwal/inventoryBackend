import redisClient from '../config/redisClient.js';

const PRODUCT_KEY_PREFIX = 'product:';

export const getProductById = async (sku) => {
  const product = await redisClient.get(`${PRODUCT_KEY_PREFIX}${sku}`);
  return product ? JSON.parse(product) : null;
};

export const createProduct = async (productData) => {
  const newId = await redisClient.incr('product:id_counter');
  const newProduct = { ...productData, id: newId };

  const pipeline = redisClient.pipeline();
  pipeline.set(`${PRODUCT_KEY_PREFIX}${newProduct.sku}`, JSON.stringify(newProduct));
  pipeline.set(`product:id:${newProduct.id}`, newProduct.sku);

  await pipeline.exec();
  return newProduct;
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
  const key = `${PRODUCT_KEY_PREFIX}${sku}`;
  const productJSON = await redisClient.get(key);
  if (!productJSON) {
    return 0;
  }
  const product = JSON.parse(productJSON);

  const pipeline = redisClient.pipeline();
  pipeline.del(key);
  if (product.id) {
    pipeline.del(`product:id:${product.id}`);
  }

  const results = await pipeline.exec();
  return results[0][1]; // Result of the first del command
};

export const getAllProducts = async () => {
  const keys = await redisClient.keys(`${PRODUCT_KEY_PREFIX}*`);
  if (!keys.length) {
    return [];
  }
  const products = await redisClient.mget(keys);
  return products.map(product => JSON.parse(product));
};

export const getProductByNumericId = async (id) => {
  const sku = await redisClient.get(`product:id:${id}`);
  if (!sku) {
    return null;
  }
  return await getProductById(sku);
};
