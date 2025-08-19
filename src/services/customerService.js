import { v4 as uuidv4 } from 'uuid';
import redisClient from '../config/redisClient.js';

const USER_CUSTOMERS_KEY_PREFIX = 's:user:';

const getUserCustomersKey = (userId) => `${USER_CUSTOMERS_KEY_PREFIX}${userId}:customers`;

export const getAllCustomers = async (userId) => {
  const userCustomersKey = getUserCustomersKey(userId);
  const allCustomers = await redisClient.hgetall(userCustomersKey);

  if (!allCustomers) {
    return [];
  }

  return Object.values(allCustomers).map(c => JSON.parse(c));
};

export const getCustomerById = async (userId, customerId) => {
  const userCustomersKey = getUserCustomersKey(userId);
  const customerJSON = await redisClient.hget(userCustomersKey, customerId);
  return customerJSON ? JSON.parse(customerJSON) : null;
};

export const createCustomer = async (userId, customerData) => {
  const userCustomersKey = getUserCustomersKey(userId);
  const customerId = uuidv4();

  const newCustomer = {
    ...customerData,
    id: customerId,
  };

  await redisClient.hset(userCustomersKey, customerId, JSON.stringify(newCustomer));

  return newCustomer;
};

export const createMultipleCustomers = async (userId, customersData) => {
  const userCustomersKey = getUserCustomersKey(userId);
  const newCustomers = [];
  const pipeline = redisClient.pipeline();

  for (const customerData of customersData) {
    const customerId = uuidv4();
    const newCustomer = {
      ...customerData,
      id: customerId,
    };
    newCustomers.push(newCustomer);
    pipeline.hset(userCustomersKey, customerId, JSON.stringify(newCustomer));
  }

  await pipeline.exec();
  return newCustomers;
};

export const updateCustomer = async (userId, customerId, updates) => {
  const userCustomersKey = getUserCustomersKey(userId);
  const existingCustomerJSON = await redisClient.hget(userCustomersKey, customerId);

  if (!existingCustomerJSON) {
    return null;
  }

  const existingCustomer = JSON.parse(existingCustomerJSON);
  const updatedCustomer = { ...existingCustomer, ...updates, id: customerId };

  await redisClient.hset(userCustomersKey, customerId, JSON.stringify(updatedCustomer));

  return updatedCustomer;
};

export const deleteCustomer = async (userId, customerId) => {
  const userCustomersKey = getUserCustomersKey(userId);
  return await redisClient.hdel(userCustomersKey, customerId);
};
