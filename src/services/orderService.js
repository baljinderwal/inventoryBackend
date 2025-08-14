import redisClient from '../config/redisClient.js';
import { v4 as uuidv4 } from 'uuid';
import { getProductByNumericId } from './productService.js';
import { getStockByProductId, updateStock } from './stockService.js';

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

export const createOrder = async (orderData) => {
  // 1. Validate order items
  for (const item of orderData.items) {
    const product = await getProductByNumericId(item.productId);
    if (!product) {
      throw new Error(`Product with ID ${item.productId} not found.`);
    }

    const stock = await getStockByProductId(item.productId);
    if (!stock || stock.quantity < item.quantity) {
      throw new Error(`Insufficient stock for product ${product.name}. Available: ${stock ? stock.quantity : 0}, Required: ${item.quantity}`);
    }
  }

  // 2. Create the order
  const orderId = uuidv4();
  const status = orderData.status || 'pending';
  const newOrder = { ...orderData, id: orderId, status, createdAt: new Date().toISOString() };

  const orderPipeline = redisClient.pipeline();
  orderPipeline.set(`${ORDER_KEY_PREFIX}${orderId}`, JSON.stringify(newOrder));
  orderPipeline.sadd(`orders:status:${status}`, orderId);

  if (newOrder.supplier && newOrder.supplier.id) {
    orderPipeline.sadd(`orders:supplier:${newOrder.supplier.id}`, orderId);
  }
  await orderPipeline.exec();

  // 3. Decrement stock for each item
  for (const item of orderData.items) {
    const stock = await getStockByProductId(item.productId);
    const newQuantity = stock.quantity - item.quantity;
    await updateStock(item.productId, { quantity: newQuantity });
  }

  return newOrder;
};

export const updateOrder = async (id, updates) => {
  const key = `${ORDER_KEY_PREFIX}${id}`;
  const existingOrderJSON = await redisClient.get(key);

  if (!existingOrderJSON) {
    return null;
  }

  const existingOrder = JSON.parse(existingOrderJSON);
  const updatedOrder = { ...existingOrder, ...updates };

  const pipeline = redisClient.pipeline();
  pipeline.set(key, JSON.stringify(updatedOrder));

  // Handle status update
  if (updates.status && updates.status !== existingOrder.status) {
    pipeline.srem(`orders:status:${existingOrder.status}`, id);
    pipeline.sadd(`orders:status:${updates.status}`, id);
  }

  // Handle supplier update
  const oldSupplierId = existingOrder.supplier ? existingOrder.supplier.id : null;
  const newSupplierId = updates.supplier ? updates.supplier.id : (updates.supplier === null ? null : oldSupplierId);


  if (newSupplierId !== oldSupplierId) {
    if (oldSupplierId) {
      pipeline.srem(`orders:supplier:${oldSupplierId}`, id);
    }
    if (newSupplierId) {
      pipeline.sadd(`orders:supplier:${newSupplierId}`, id);
    }
  }

  await pipeline.exec();
  return updatedOrder;
};

export const deleteOrder = async (id) => {
  const key = `${ORDER_KEY_PREFIX}${id}`;
  const orderJSON = await redisClient.get(key);

  if (!orderJSON) {
    return 0; // Not found, consistent with original behavior
  }

  const order = JSON.parse(orderJSON);
  const pipeline = redisClient.pipeline();

  // Remove from status index
  if (order.status) {
    pipeline.srem(`orders:status:${order.status}`, id);
  }

  // Remove from supplier index
  if (order.supplier && order.supplier.id) {
    pipeline.srem(`orders:supplier:${order.supplier.id}`, id);
  }

  // Delete the order itself
  pipeline.del(key);

  const results = await pipeline.exec();
  // The result of del is the last one in the pipeline, which is an array [error, data]
  const delResult = results[results.length - 1][1];
  return delResult;
};

export const getOrdersBySupplier = async (supplierId) => {
  const orderIds = await redisClient.smembers(`orders:supplier:${supplierId}`);
  if (orderIds.length === 0) {
    return [];
  }
  const keys = orderIds.map(id => `${ORDER_KEY_PREFIX}${id}`);
  const ordersJSON = await redisClient.mget(keys);
  return ordersJSON.map(order => JSON.parse(order)).filter(Boolean);
};

export const getOrdersByStatus = async (status) => {
  const orderIds = await redisClient.smembers(`orders:status:${status}`);
  if (orderIds.length === 0) {
    return [];
  }
  const keys = orderIds.map(id => `${ORDER_KEY_PREFIX}${id}`);
  const ordersJSON = await redisClient.mget(keys);
  return ordersJSON.map(order => JSON.parse(order)).filter(Boolean);
};
