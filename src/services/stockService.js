import redisClient from '../config/redisClient.js';

const STOCK_KEY_PREFIX = 'stock:';

export const getAllStock = async () => {
  const keys = await redisClient.keys(`${STOCK_KEY_PREFIX}*`);
  if (!keys.length) {
    return [];
  }
  const stocks = await redisClient.mget(keys);
  return stocks.map(stock => JSON.parse(stock));
};

export const getStockByProductId = async (productId) => {
  const stock = await redisClient.get(`${STOCK_KEY_PREFIX}${productId}`);
  return stock ? JSON.parse(stock) : null;
};

export const createStock = async (stock) => {
  await redisClient.set(`${STOCK_KEY_PREFIX}${stock.productId}`, JSON.stringify(stock));
};

export const updateStock = async (productId, updates) => {
  const key = `${STOCK_KEY_PREFIX}${productId}`;
  const existingStock = await redisClient.get(key);

  if (!existingStock) {
    return null;
  }

  const stock = JSON.parse(existingStock);
  const updatedStock = { ...stock, ...updates };

  await redisClient.set(key, JSON.stringify(updatedStock));
  return updatedStock;
};

export const deleteStock = async (productId) => {
  const result = await redisClient.del(`${STOCK_KEY_PREFIX}${productId}`);
  return result;
};
