import { v4 as uuidv4 } from 'uuid';
import redisClient from '../config/redisClient.js';

const getStockKey = (userId) => `s:user:${userId}:stock`;

export const getAllStock = async (userId) => {
    const stocks = await redisClient.hgetall(getStockKey(userId));
    if (!stocks || Object.keys(stocks).length === 0) {
        return [];
    }
    return Object.values(stocks).map(stock => JSON.parse(stock));
};

export const getStockByProductId = async (userId, productId) => {
    const stock = await redisClient.hget(getStockKey(userId), productId);
    return stock ? JSON.parse(stock) : null;
};

export const createStock = async (userId, stockData) => {
    // The productId is the key in the hash, so it's required.
    // The stock data will not have its own id.
    const { productId, ...stock } = stockData;
    if (!productId) {
        throw new Error('productId is required to create stock.');
    }
    const newStock = { productId, ...stock };

    await redisClient.hset(
        getStockKey(userId),
        productId,
        JSON.stringify(newStock)
    );

    return newStock;
};

export const createMultipleStocks = async (userId, stocksData) => {
    const pipeline = redisClient.pipeline();
    const newStocks = [];

    for (const stockData of stocksData) {
        const { productId, ...stock } = stockData;
        if (!productId) {
            throw new Error('productId is required for all stock entries.');
        }
        const newStock = { productId, ...stock };
        newStocks.push(newStock);

        pipeline.hset(
            getStockKey(userId),
            productId,
            JSON.stringify(newStock)
        );
    }

    await pipeline.exec();
    return newStocks;
};

export const updateStock = async (userId, productId, updates) => {
    const key = getStockKey(userId);
    const existingStockJSON = await redisClient.hget(key, productId);

    if (!existingStockJSON) {
        return null;
    }

    const existingStock = JSON.parse(existingStockJSON);
    const updatedStock = { ...existingStock, ...updates, productId: productId };

    await redisClient.hset(key, productId, JSON.stringify(updatedStock));
    return updatedStock;
};

export const deleteStock = async (userId, productId) => {
    const key = getStockKey(userId);
    return await redisClient.hdel(key, productId);
};
