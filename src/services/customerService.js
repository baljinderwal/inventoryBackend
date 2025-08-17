import redisClient from '../config/redisClient.js';

const CUSTOMER_KEY_PREFIX = 'customer:';
const ALL_CUSTOMERS_KEY = 'customers:all';

export const getAllCustomers = async () => {
    const customerIds = await redisClient.smembers(ALL_CUSTOMERS_KEY);
    if (!customerIds || customerIds.length === 0) {
        return [];
    }
    const customerKeys = customerIds.map(id => `${CUSTOMER_KEY_PREFIX}${id}`);
    const customers = await redisClient.mget(customerKeys);
    return customers.map(customer => JSON.parse(customer));
};

export const getCustomerById = async (id) => {
    const customer = await redisClient.get(`${CUSTOMER_KEY_PREFIX}${id}`);
    return customer ? JSON.parse(customer) : null;
};

export const createCustomer = async (customerData) => {
    const newId = await redisClient.incr('customer:id_counter');
    const newCustomer = { ...customerData, id: newId };

    const pipeline = redisClient.pipeline();
    pipeline.set(`${CUSTOMER_KEY_PREFIX}${newCustomer.id}`, JSON.stringify(newCustomer));
    pipeline.sadd(ALL_CUSTOMERS_KEY, newCustomer.id);
    await pipeline.exec();

    return newCustomer;
};

export const createMultipleCustomers = async (customersData) => {
    const pipeline = redisClient.pipeline();
    const newCustomers = [];

    for (const customerData of customersData) {
        const newId = await redisClient.incr('customer:id_counter');
        const newCustomer = { ...customerData, id: newId };
        newCustomers.push(newCustomer);

        pipeline.set(`${CUSTOMER_KEY_PREFIX}${newCustomer.id}`, JSON.stringify(newCustomer));
        pipeline.sadd(ALL_CUSTOMERS_KEY, newCustomer.id);
    }

    await pipeline.exec();
    return newCustomers;
};

export const updateCustomer = async (id, updates) => {
    const key = `${CUSTOMER_KEY_PREFIX}${id}`;
    const existingCustomerJSON = await redisClient.get(key);

    if (!existingCustomerJSON) {
        return null;
    }

    const existingCustomer = JSON.parse(existingCustomerJSON);
    const updatedCustomer = { ...existingCustomer, ...updates };

    await redisClient.set(key, JSON.stringify(updatedCustomer));
    return updatedCustomer;
};

export const deleteCustomer = async (id) => {
    const key = `${CUSTOMER_KEY_PREFIX}${id}`;
    const pipeline = redisClient.pipeline();
    pipeline.del(key);
    pipeline.srem(ALL_CUSTOMERS_KEY, id);
    const results = await pipeline.exec();
    return results[0][1]; // Result of the first del command
};
