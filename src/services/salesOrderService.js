import { v4 as uuidv4 } from 'uuid';
import redisClient from '../config/redisClient.js';

const getSalesOrderKey = (userId) => `s:user:${userId}:salesorders`;

export const getAllSalesOrders = async (userId) => {
    const salesOrders = await redisClient.hgetall(getSalesOrderKey(userId));
    // hgetall returns an object. If the key doesn't exist, it's an empty object.
    if (!salesOrders || Object.keys(salesOrders).length === 0) {
        return [];
    }
    return Object.values(salesOrders).map(order => JSON.parse(order));
};

export const getSalesOrderById = async (userId, salesOrderId) => {
    const salesOrder = await redisClient.hget(getSalesOrderKey(userId), salesOrderId);
    return salesOrder ? JSON.parse(salesOrder) : null;
};

export const createSalesOrder = async (userId, orderData) => {
    // Ignore any incoming salesorderid, and always generate a new one.
    const { id, ...order } = orderData;
    const salesOrderId = uuidv4();
    const newOrder = { ...order, id: salesOrderId };

    await redisClient.hset(
        getSalesOrderKey(userId),
        salesOrderId,
        JSON.stringify(newOrder)
    );

    return newOrder;
};

export const createMultipleSalesOrders = async (userId, ordersData) => {
    const pipeline = redisClient.pipeline();
    const newOrders = [];

    for (const orderData of ordersData) {
        const { id, ...order } = orderData;
        const salesOrderId = uuidv4();
        const newOrder = { ...order, id: salesOrderId };
        newOrders.push(newOrder);

        pipeline.hset(
            getSalesOrderKey(userId),
            salesOrderId,
            JSON.stringify(newOrder)
        );
    }

    await pipeline.exec();
    return newOrders;
};

export const updateSalesOrder = async (userId, salesOrderId, updates) => {
    const key = getSalesOrderKey(userId);
    const existingOrderJSON = await redisClient.hget(key, salesOrderId);

    if (!existingOrderJSON) {
        return null;
    }

    const existingOrder = JSON.parse(existingOrderJSON);
    const updatedOrder = { ...existingOrder, ...updates, id: salesOrderId };

    await redisClient.hset(key, salesOrderId, JSON.stringify(updatedOrder));
    return updatedOrder;
};

export const deleteSalesOrder = async (userId, salesOrderId) => {
    const key = getSalesOrderKey(userId);
    return await redisClient.hdel(key, salesOrderId);
};
