import { v4 as uuidv4 } from 'uuid';
import redisClient from '../config/redisClient.js';
import { findProductByIdAcrossUsers } from './productService.js';
import { getStockByProductId, updateStock } from './stockService.js';
import * as promotionService from './promotionService.js';
import { sendNotificationToUser } from './notificationService.js';

const getOrderKey = (userId) => `s:user:${userId}:orders`;
const getOrderStatusKey = (userId, status) => `s:user:${userId}:orders:status:${status}`;
const getOrderSupplierKey = (userId, supplierId) => `s:user:${userId}:orders:supplier:${supplierId}`;

export const getAllOrders = async (userId, sortBy, order) => {
  const orders = await redisClient.hgetall(getOrderKey(userId));
  if (!orders || Object.keys(orders).length === 0) {
      return [];
  }
  let parsedOrders = Object.values(orders).map(o => JSON.parse(o));

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

export const getOrderById = async (userId, orderId) => {
  const order = await redisClient.hget(getOrderKey(userId), orderId);
  return order ? JSON.parse(order) : null;
};

export const createOrder = async (userId, orderData) => {
  // Validate stock and product existence
  for (let i = 0; i < orderData.products.length; i++) {
      const item = orderData.products[i];
      const stock = await getStockByProductId(userId, item.productId);
      const product = await findProductByIdAcrossUsers(item.productId); 

      if (!product) {
          throw new Error(`Product with ID ${item.productId} not found.`);
      }
      if (!stock || stock.quantity < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.name}. Available: ${stock ? stock.quantity : 0}, Required: ${item.quantity}`);
      }
  }

  // Apply promotions
  const { order, originalTotal } = await applyPromotions(orderData);

  // All checks passed, prepare the transaction
  const orderId = uuidv4();
  const status = order.status || 'pending';
  const newOrder = { ...order, id: orderId, status, createdAt: new Date().toISOString(), originalTotal, completedAt: order.completedAt, userId };

  const multi = redisClient.multi();

  // 1. Create the order
  multi.hset(getOrderKey(userId), orderId, JSON.stringify(newOrder));
  multi.sadd(getOrderStatusKey(userId, status), orderId);
  if (newOrder.supplier && newOrder.supplier.id) {
      multi.sadd(getOrderSupplierKey(userId, newOrder.supplier.id), orderId);
  }

  // 2. Decrement stock for each item
  for (let i = 0; i < orderData.products.length; i++) {
      const item = orderData.products[i];
      const stock = await getStockByProductId(userId, item.productId);
      const newQuantity = stock.quantity - item.quantity;
      // This is not ideal as it's not transactional with the order creation.
      // A better approach would be to use a Lua script to handle this atomically.
      // For now, we will update the stock directly.
      await updateStock(userId, item.productId, { quantity: newQuantity });
  }

  // Execute the transaction
  await multi.exec();

  return newOrder;
};

export const createMultipleOrders = async (userId, ordersData) => {
  const createdOrders = [];
  for (const orderData of ordersData) {
    const newOrder = await createOrder(userId, orderData);
    createdOrders.push(newOrder);
  }
  return createdOrders;
};


export const updateOrder = async (userId, orderId, updates) => {
  const key = getOrderKey(userId);
  const existingOrderJSON = await redisClient.hget(key, orderId);

  if (!existingOrderJSON) {
    return null;
  }

  const existingOrder = JSON.parse(existingOrderJSON);
  const updatedOrder = { ...existingOrder, ...updates, id: orderId };

  const pipeline = redisClient.pipeline();
  pipeline.hset(key, orderId, JSON.stringify(updatedOrder));

  // Handle status update
  if (updates.status && updates.status !== existingOrder.status) {
    pipeline.srem(getOrderStatusKey(userId, existingOrder.status), orderId);
    pipeline.sadd(getOrderStatusKey(userId, updates.status), orderId);
    if (updatedOrder.userId) {
      sendNotificationToUser(updatedOrder.userId, {
        type: 'ORDER_STATUS_UPDATE',
        orderId: orderId,
        status: updates.status,
        message: `Your order ${orderId} has been updated to ${updates.status}.`
      });
    }
  }

  // Handle supplier update
  const oldSupplierId = existingOrder.supplier ? existingOrder.supplier.id : null;
  const newSupplierId = updates.supplier ? updates.supplier.id : (updates.supplier === null ? null : oldSupplierId);


  if (newSupplierId !== oldSupplierId) {
    if (oldSupplierId) {
      pipeline.srem(getOrderSupplierKey(userId, oldSupplierId), orderId);
    }
    if (newSupplierId) {
      pipeline.sadd(getOrderSupplierKey(userId, newSupplierId), orderId);
    }
  }

  await pipeline.exec();
  return updatedOrder;
};

export const deleteOrder = async (userId, orderId) => {
    const key = getOrderKey(userId);
    const orderJSON = await redisClient.hget(key, orderId);

    if (!orderJSON) {
        return 0; // Not found
    }

    const order = JSON.parse(orderJSON);
    const pipeline = redisClient.pipeline();

    // Remove from status index
    if (order.status) {
        pipeline.srem(getOrderStatusKey(userId, order.status), orderId);
    }

    // Remove from supplier index
    if (order.supplier && order.supplier.id) {
        pipeline.srem(getOrderSupplierKey(userId, order.supplier.id), orderId);
    }

    // Delete the order itself
    pipeline.hdel(key, orderId);

    const results = await pipeline.exec();
    const delResult = results[results.length - 1][1];
    return delResult;
};

export const getOrdersBySupplier = async (userId, supplierId) => {
  const orderIds = await redisClient.smembers(getOrderSupplierKey(userId, supplierId));
  if (orderIds.length === 0) {
    return [];
  }
  const orders = await redisClient.hmget(getOrderKey(userId), ...orderIds);
  return orders.map(order => JSON.parse(order)).filter(Boolean);
};

const applyPromotions = async (orderData) => {
    let total = 0;
    for (const item of orderData.products) {
        const product = await findProductByIdAcrossUsers(item.productId);
        total += product.price * item.quantity;
    }

    const originalTotal = total;
    let discount = 0;
    const appliedPromotions = [];

    const allPromotions = await promotionService.getAllPromotions();

    for (const promo of allPromotions) {
        if (promo.type === 'percentage' && promo.category) {
            for (const item of orderData.products) {
                const product = await findProductByIdAcrossUsers(item.productId);
                if (product.category === promo.category) {
                    const itemTotal = product.price * item.quantity;
                    discount += itemTotal * (promo.discount / 100);
                    if (!appliedPromotions.find(p => p.id === promo.id)) {
                        appliedPromotions.push(promo);
                    }
                }
            }
        }
    }

    const discountedTotal = total - discount;
    const finalOrder = {
        ...orderData,
        total: discountedTotal,
        discount,
        appliedPromotions,
    };

    return { order: finalOrder, originalTotal };
};

export const getOrdersByStatus = async (userId, status) => {
  const orderIds = await redisClient.smembers(getOrderStatusKey(userId, status));
  if (orderIds.length === 0) {
    return [];
  }
  const orders = await redisClient.hmget(getOrderKey(userId), ...orderIds);
  return orders.map(order => JSON.parse(order)).filter(Boolean);
};
