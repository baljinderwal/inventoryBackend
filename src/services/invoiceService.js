import { v4 as uuidv4 } from 'uuid';
import redisClient from '../config/redisClient.js';

const getInvoiceKey = (userId) => `s:user:${userId}:invoices`;

export const getAllInvoices = async (userId) => {
    const invoices = await redisClient.hgetall(getInvoiceKey(userId));
    if (!invoices || Object.keys(invoices).length === 0) {
        return [];
    }
    return Object.values(invoices).map(invoice => JSON.parse(invoice));
};

export const getInvoiceById = async (userId, invoiceId) => {
    const invoice = await redisClient.hget(getInvoiceKey(userId), invoiceId);
    return invoice ? JSON.parse(invoice) : null;
};

export const createInvoice = async (userId, invoiceData) => {
    const { id, ...invoice } = invoiceData;
    const invoiceId = uuidv4();
    const newInvoice = { ...invoice, id: invoiceId };

    await redisClient.hset(
        getInvoiceKey(userId),
        invoiceId,
        JSON.stringify(newInvoice)
    );

    return newInvoice;
};

export const createMultipleInvoices = async (userId, invoicesData) => {
    const pipeline = redisClient.pipeline();
    const newInvoices = [];

    for (const invoiceData of invoicesData) {
        const { id, ...invoice } = invoiceData;
        const invoiceId = uuidv4();
        const newInvoice = { ...invoice, id: invoiceId };
        newInvoices.push(newInvoice);

        pipeline.hset(
            getInvoiceKey(userId),
            invoiceId,
            JSON.stringify(newInvoice)
        );
    }

    await pipeline.exec();
    return newInvoices;
};

export const updateInvoice = async (userId, invoiceId, updates) => {
    const key = getInvoiceKey(userId);
    const existingInvoiceJSON = await redisClient.hget(key, invoiceId);

    if (!existingInvoiceJSON) {
        return null;
    }

    const existingInvoice = JSON.parse(existingInvoiceJSON);
    const updatedInvoice = { ...existingInvoice, ...updates, id: invoiceId };

    await redisClient.hset(key, invoiceId, JSON.stringify(updatedInvoice));
    return updatedInvoice;
};

export const deleteInvoice = async (userId, invoiceId) => {
    const key = getInvoiceKey(userId);
    return await redisClient.hdel(key, invoiceId);
};
