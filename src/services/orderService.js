import redisClient from '../config/redisClient.js';
import { v4 as uuidv4 } from 'uuid';
import { getProductByNumericId } from './productService.js';
import { getStockByProductId } from './stockService.js';
import * as promotionService from './promotionService.js';

const ORDER_KEY_PREFIX = 'order:';
const STOCK_KEY_PREFIX = 'stock:'; // Assuming stock service uses this, good to have it here

export const getAllOrders = async (sortBy, order) => {
  const keys = await redisClient.keys(`${ORDER_KEY_PREFIX}*`);
  if (keys.length === 0) {
    return [];
  }

  const orders = await redisClient.mget(keys);
  let parsedOrders = orders.map(o => JSON.parse(o));

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
  const stockKeys = orderData.items.map(item => `${STOCK_KEY_PREFIX}${item.productId}`);

  // Use a dedicated client for transactions to avoid issues with shared state
  const transactionClient = redisClient.duplicate();

  try {
    await transactionClient.watch(stockKeys);

    const stockLevels = await Promise.all(
        orderData.items.map(item => getStockByProductId(item.productId))
    );

    // Validate stock and product existence
    for (let i = 0; i < orderData.items.length; i++) {
        const item = orderData.items[i];
        const stock = stockLevels[i];
        const product = await getProductByNumericId(item.productId); // Assuming this is fast

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
    const newOrder = { ...order, id: orderId, status, createdAt: new Date().toISOString(), originalTotal };

    const multi = transactionClient.multi();

    // 1. Create the order
    multi.set(`${ORDER_KEY_PREFIX}${orderId}`, JSON.stringify(newOrder));
    multi.sadd(`orders:status:${status}`, orderId);
    if (newOrder.supplier && newOrder.supplier.id) {
        multi.sadd(`orders:supplier:${newOrder.supplier.id}`, orderId);
    }

    // 2. Decrement stock for each item
    for (let i = 0; i < orderData.items.length; i++) {
        const item = orderData.items[i];
        const stock = stockLevels[i];
        const newQuantity = stock.quantity - item.quantity;
        const updatedStock = { ...stock, quantity: newQuantity };
        multi.set(`${STOCK_KEY_PREFIX}${item.productId}`, JSON.stringify(updatedStock));
    }

    // Execute the transaction
    const results = await multi.exec();

    // Check if the transaction was successful
    if (results === null) {
        // The transaction failed because a watched key was modified.
        throw new Error('Order creation failed due to a stock conflict. Please try again.');
    }

    return newOrder;
  } catch (error) {
    // Rethrow the error to be caught by the controller
    throw error;
  } finally {
    // Always unwatch and quit the dedicated client
    await transactionClient.unwatch();
    transactionClient.quit();
  }
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

const applyPromotions = async (orderData) => {
    let total = 0;
    for (const item of orderData.items) {
        const product = await getProductByNumericId(item.productId);
        total += product.price * item.quantity;
    }

    const originalTotal = total;
    let discount = 0;
    const appliedPromotions = [];

    const allPromotions = await promotionService.getAllPromotions();

    for (const promo of allPromotions) {
        // Simple promotion logic: category-wide discount
        if (promo.type === 'percentage' && promo.category) {
            for (const item of orderData.items) {
                const product = await getProductByNumericId(item.productId);
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

export const getOrdersByStatus = async (status) => {
  const orderIds = await redisClient.smembers(`orders:status:${status}`);
  if (orderIds.length === 0) {
    return [];
  }
  const keys = orderIds.map(id => `${ORDER_KEY_PREFIX}${id}`);
  const ordersJSON = await redisClient.mget(keys);
  return ordersJSON.map(order => JSON.parse(order)).filter(Boolean);
};
