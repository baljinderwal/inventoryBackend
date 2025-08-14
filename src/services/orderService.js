import redisClient from '../config/redisClient.js';
import { v4 as uuidv4 } from 'uuid';

const ORDER_KEY_PREFIX = 'order:';

export const getAllOrders = async (sortBy, order) => {
  const keys = await redisClient.keys(`${ORDER_KEY_PREFIX}*`);
  if (keys.length === 0) {
    return [];
  }

  const orders = await redisClient.mget(keys);
  let parsedOrders = orders.map(order => JSON.parse(order));

  if (sortBy) {
    parsedOrders.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (aValue < bValue) {
        return order === 'desc' ? 1 : -1;
      }
      if (aValue > bValue) {
        return order === 'desc' ? -1 : 1;
      }
      return 0;
    });
  }

  return parsedOrders;
};

export const getOrderById = async (id) => {
  const order = await redisClient.get(`${ORDER_KEY_PREFIX}${id}`);
  return order ? JSON.parse(order) : null;
};

export const createOrder = async (order) => {
  const orderId = uuidv4();
  const newOrder = { ...order, id: orderId, createdAt: new Date().toISOString() };
  await redisClient.set(`${ORDER_KEY_PREFIX}${orderId}`, JSON.stringify(newOrder));
  return newOrder;
};

export const updateOrder = async (id, updates) => {
  const key = `${ORDER_KEY_PREFIX}${id}`;
  const existingOrder = await redisClient.get(key);

  if (!existingOrder) {
    return null;
  }

  const order = JSON.parse(existingOrder);
  const updatedOrder = { ...order, ...updates };

  await redisClient.set(key, JSON.stringify(updatedOrder));
  return updatedOrder;
};

export const deleteOrder = async (id) => {
  const result = await redisClient.del(`${ORDER_KEY_PREFIX}${id}`);
  return result;
};

export const getOrdersBySupplier = async (supplierId) => {
  const keys = await redisClient.keys(`${ORDER_KEY_PREFIX}*`);
  if (keys.length === 0) {
    return [];
  }
  const orders = await redisClient.mget(keys);
  const parsedOrders = orders.map(order => JSON.parse(order));
  return parsedOrders.filter(order => order.supplier && order.supplier.id == supplierId);
};

export const getOrdersByStatus = async (status) => {
  const keys = await redisClient.keys(`${ORDER_KEY_PREFIX}*`);
  if (keys.length === 0) {
    return [];
  }
  const orders = await redisClient.mget(keys);
  const parsedOrders = orders.map(order => JSON.parse(order));
  return parsedOrders.filter(order => order.status === status);
};
