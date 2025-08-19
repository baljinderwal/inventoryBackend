import redisClient from '../config/redisClient.js';
import { findProductByIdAcrossUsers } from './productService.js';

const SUPPLIER_KEY_PREFIX = 'supplier:';

export const getSupplierById = async (id) => {
  const supplier = await redisClient.get(`${SUPPLIER_KEY_PREFIX}${id}`);
  return supplier ? JSON.parse(supplier) : null;
};

export const createSupplier = async (supplier) => {
  await redisClient.set(`${SUPPLIER_KEY_PREFIX}${supplier.id}`, JSON.stringify(supplier));
};

export const createMultipleSuppliers = async (suppliers) => {
  const pipeline = redisClient.pipeline();
  suppliers.forEach(supplier => {
    pipeline.set(`${SUPPLIER_KEY_PREFIX}${supplier.id}`, JSON.stringify(supplier));
  });
  await pipeline.exec();
};

export const updateSupplier = async (id, updates) => {
  const key = `${SUPPLIER_KEY_PREFIX}${id}`;
  const existingSupplier = await redisClient.get(key);

  if (!existingSupplier) {
    return null;
  }

  const supplier = JSON.parse(existingSupplier);
  const updatedSupplier = { ...supplier, ...updates };

  await redisClient.set(key, JSON.stringify(updatedSupplier));
  return updatedSupplier;
};

export const deleteSupplier = async (id) => {
  const result = await redisClient.del(`${SUPPLIER_KEY_PREFIX}${id}`);
  return result;
};

export const getAllSuppliers = async () => {
  const keys = await redisClient.keys(`${SUPPLIER_KEY_PREFIX}*`);
  if (!keys.length) {
    return [];
  }
  const suppliers = await redisClient.mget(keys);
  return suppliers.map(supplier => JSON.parse(supplier));
};

export const getProductsBySupplier = async (supplierId) => {
  const supplier = await getSupplierById(supplierId);
  if (!supplier || !supplier.products) {
    return [];
  }

  const productPromises = supplier.products.map(productId => {
    return findProductByIdAcrossUsers(productId);
  });

  const products = await Promise.all(productPromises);
  return products.filter(p => p !== null);
};
