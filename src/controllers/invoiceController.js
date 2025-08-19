import * as invoiceService from '../services/invoiceService.js';

export const getAllInvoices = async (req, res) => {
    try {
        const invoices = await invoiceService.getAllInvoices(req.user.id);
        res.status(200).json(invoices);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving invoices', error: error.message });
    }
};

export const getInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await invoiceService.getInvoiceById(req.user.id, id);

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        res.status(200).json(invoice);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving invoice', error: error.message });
    }
};

export const createInvoice = async (req, res) => {
    try {
        const newInvoice = await invoiceService.createInvoice(req.user.id, req.body);
        res.status(201).json(newInvoice);
    } catch (error) {
        res.status(500).json({ message: 'Error creating invoice', error: error.message });
    }
};

export const createMultipleInvoices = async (req, res) => {
    try {
        const newInvoices = await invoiceService.createMultipleInvoices(req.user.id, req.body);
        res.status(201).json(newInvoices);
    } catch (error) {
        res.status(500).json({ message: 'Error creating invoices', error: error.message });
    }
};

export const updateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedInvoice = await invoiceService.updateInvoice(req.user.id, id, updates);

        if (!updatedInvoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        res.status(200).json(updatedInvoice);
    } catch (error) {
        res.status(500).json({ message: 'Error updating invoice', error: error.message });
    }
};

export const deleteInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await invoiceService.deleteInvoice(req.user.id, id);

        if (result === 0) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        res.status(200).json({ message: 'Invoice deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting invoice', error: error.message });
    }
};
