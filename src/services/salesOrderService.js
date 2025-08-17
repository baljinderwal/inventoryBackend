import redisClient from '../config/redisClient.js';

const SALES_ORDER_KEY_PREFIX = 'sales_order:';
const ALL_SALES_ORDERS_KEY = 'sales_orders:all';

export const getAllSalesOrders = async () => {
    const salesOrderIds = await redisClient.smembers(ALL_SALES_ORDERS_KEY);
    if (!salesOrderIds || salesOrderIds.length === 0) {
        return [];
    }
    const salesOrderKeys = salesOrderIds.map(id => `${SALES_ORDER_KEY_PREFIX}${id}`);
    const salesOrders = await redisClient.mget(salesOrderKeys);
    return salesOrders.map(order => JSON.parse(order));
};

export const getSalesOrderById = async (id) => {
    const salesOrder = await redisClient.get(`${SALES_ORDER_KEY_PREFIX}${id}`);
    return salesOrder ? JSON.parse(salesOrder) : null;
};

export const createSalesOrder = async (orderData) => {
    const newId = await redisClient.incr('sales_order:id_counter');
    const newOrder = { ...orderData, id: newId };

    const pipeline = redisClient.pipeline();
    pipeline.set(`${SALES_ORDER_KEY_PREFIX}${newOrder.id}`, JSON.stringify(newOrder));
    pipeline.sadd(ALL_SALES_ORDERS_KEY, newOrder.id);
    await pipeline.exec();

    return newOrder;
};

export const createMultipleSalesOrders = async (ordersData) => {
    const pipeline = redisClient.pipeline();
    const newOrders = [];

    for (const orderData of ordersData) {
        const newId = await redisClient.incr('sales_order:id_counter');
        const newOrder = { ...orderData, id: newId };
        newOrders.push(newOrder);

        pipeline.set(`${SALES_ORDER_KEY_PREFIX}${newOrder.id}`, JSON.stringify(newOrder));
        pipeline.sadd(ALL_SALES_ORDERS_KEY, newOrder.id);
    }

    await pipeline.exec();
    return newOrders;
};

export const updateSalesOrder = async (id, updates) => {
    const key = `${SALES_ORDER_KEY_PREFIX}${id}`;
    const existingOrderJSON = await redisClient.get(key);

    if (!existingOrderJSON) {
        return null;
    }

    const existingOrder = JSON.parse(existingOrderJSON);
    const updatedOrder = { ...existingOrder, ...updates };

    await redisClient.set(key, JSON.stringify(updatedOrder));
    return updatedOrder;
};

export const deleteSalesOrder = async (id) => {
    const key = `${SALES_ORDER_KEY_PREFIX}${id}`;
    const pipeline = redisClient.pipeline();
    pipeline.del(key);
    pipeline.srem(ALL_SALES_ORDERS_KEY, id);
    const results = await pipeline.exec();
    return results[0][1]; // Result of the first del command
};
