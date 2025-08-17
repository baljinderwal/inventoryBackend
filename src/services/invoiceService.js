import redisClient from '../config/redisClient.js';

const INVOICE_KEY_PREFIX = 'invoice:';
const ALL_INVOICES_KEY = 'invoices:all';

export const getAllInvoices = async () => {
    const invoiceIds = await redisClient.smembers(ALL_INVOICES_KEY);
    if (!invoiceIds || invoiceIds.length === 0) {
        return [];
    }
    const invoiceKeys = invoiceIds.map(id => `${INVOICE_KEY_PREFIX}${id}`);
    const invoices = await redisClient.mget(invoiceKeys);
    return invoices.map(invoice => JSON.parse(invoice));
};

export const getInvoiceById = async (id) => {
    const invoice = await redisClient.get(`${INVOICE_KEY_PREFIX}${id}`);
    return invoice ? JSON.parse(invoice) : null;
};

export const createInvoice = async (invoiceData) => {
    const newId = await redisClient.incr('invoice:id_counter');
    const newInvoice = { ...invoiceData, id: newId };

    const pipeline = redisClient.pipeline();
    pipeline.set(`${INVOICE_KEY_PREFIX}${newInvoice.id}`, JSON.stringify(newInvoice));
    pipeline.sadd(ALL_INVOICES_KEY, newInvoice.id);
    await pipeline.exec();

    return newInvoice;
};

export const createMultipleInvoices = async (invoicesData) => {
    const pipeline = redisClient.pipeline();
    const newInvoices = [];

    for (const invoiceData of invoicesData) {
        const newId = await redisClient.incr('invoice:id_counter');
        const newInvoice = { ...invoiceData, id: newId };
        newInvoices.push(newInvoice);

        pipeline.set(`${INVOICE_KEY_PREFIX}${newInvoice.id}`, JSON.stringify(newInvoice));
        pipeline.sadd(ALL_INVOICES_KEY, newInvoice.id);
    }

    await pipeline.exec();
    return newInvoices;
};

export const updateInvoice = async (id, updates) => {
    const key = `${INVOICE_KEY_PREFIX}${id}`;
    const existingInvoiceJSON = await redisClient.get(key);

    if (!existingInvoiceJSON) {
        return null;
    }

    const existingInvoice = JSON.parse(existingInvoiceJSON);
    const updatedInvoice = { ...existingInvoice, ...updates };

    await redisClient.set(key, JSON.stringify(updatedInvoice));
    return updatedInvoice;
};

export const deleteInvoice = async (id) => {
    const key = `${INVOICE_KEY_PREFIX}${id}`;
    const pipeline = redisClient.pipeline();
    pipeline.del(key);
    pipeline.srem(ALL_INVOICES_KEY, id);
    const results = await pipeline.exec();
    return results[0][1]; // Result of the first del command
};
