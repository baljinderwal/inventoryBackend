import { v4 as uuidv4 } from 'uuid';
import redisClient from '../config/redisClient.js';
import { findProductByIdAcrossUsers } from './productService.js';

const getSupplierKey = (userId) => `s:user:${userId}:suppliers`;

export const getSupplierById = async (userId, supplierId) => {
  const supplier = await redisClient.hget(getSupplierKey(userId), supplierId);
  return supplier ? JSON.parse(supplier) : null;
};

export const createSupplier = async (userId, supplierData) => {
  const { id, ...supplier } = supplierData;
  const supplierId = uuidv4();
  const newSupplier = { ...supplier, id: supplierId };
  await redisClient.hset(
    getSupplierKey(userId),
    supplierId,
    JSON.stringify(newSupplier)
  );
  return newSupplier;
};

export const createMultipleSuppliers = async (userId, suppliersData) => {
  const pipeline = redisClient.pipeline();
  const newSuppliers = [];
  for (const supplierData of suppliersData) {
    const { id, ...supplier } = supplierData;
    const supplierId = uuidv4();
    const newSupplier = { ...supplier, id: supplierId };
    newSuppliers.push(newSupplier);
    pipeline.hset(
      getSupplierKey(userId),
      supplierId,
      JSON.stringify(newSupplier)
    );
  }
  await pipeline.exec();
  return newSuppliers;
};

export const updateSupplier = async (userId, supplierId, updates) => {
  const key = getSupplierKey(userId);
  const existingSupplierJSON = await redisClient.hget(key, supplierId);

  if (!existingSupplierJSON) {
    return null;
  }

  const existingSupplier = JSON.parse(existingSupplierJSON);
  const updatedSupplier = { ...existingSupplier, ...updates, id: supplierId };

  await redisClient.hset(key, supplierId, JSON.stringify(updatedSupplier));
  return updatedSupplier;
};

export const deleteSupplier = async (userId, supplierId) => {
  const key = getSupplierKey(userId);
  return await redisClient.hdel(key, supplierId);
};

export const getAllSuppliers = async (userId) => {
  const suppliers = await redisClient.hgetall(getSupplierKey(userId));
  if (!suppliers || Object.keys(suppliers).length === 0) {
    return [];
  }
  return Object.values(suppliers).map(supplier => JSON.parse(supplier));
};

export const getProductsBySupplier = async (userId, supplierId) => {
  const supplier = await getSupplierById(userId, supplierId);
  if (!supplier || !supplier.products) {
    return [];
  }

  const productPromises = supplier.products.map(productId => {
    // This function finds a product by its ID across all users.
    // This is not ideal for performance but is used here to maintain
    // the existing functionality of this specific endpoint.
    // A better approach would be to ensure products are fetched
    // within the scope of the user if the business logic requires it.
    return findProductByIdAcrossUsers(productId);
  });

  const products = await Promise.all(productPromises);
  return products.filter(p => p !== null);
};
