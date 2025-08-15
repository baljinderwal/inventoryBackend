import * as salesOrderService from '../services/salesOrderService.js';

export const getAllSalesOrders = async (req, res) => {
    try {
        const salesOrders = await salesOrderService.getAllSalesOrders();
        res.status(200).json(salesOrders);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving sales orders', error: error.message });
    }
};

export const getSalesOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const salesOrder = await salesOrderService.getSalesOrderById(id);

        if (!salesOrder) {
            return res.status(404).json({ message: 'Sales order not found' });
        }

        res.status(200).json(salesOrder);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving sales order', error: error.message });
    }
};

export const createSalesOrder = async (req, res) => {
    try {
        const newSalesOrder = await salesOrderService.createSalesOrder(req.body);
        res.status(201).json(newSalesOrder);
    } catch (error) {
        res.status(500).json({ message: 'Error creating sales order', error: error.message });
    }
};

export const updateSalesOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedSalesOrder = await salesOrderService.updateSalesOrder(id, updates);

        if (!updatedSalesOrder) {
            return res.status(404).json({ message: 'Sales order not found' });
        }

        res.status(200).json({ message: 'Sales order updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating sales order', error: error.message });
    }
};

export const deleteSalesOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await salesOrderService.deleteSalesOrder(id);

        if (result === 0) {
            return res.status(404).json({ message: 'Sales order not found' });
        }

        res.status(200).json({ message: 'Sales order deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting sales order', error: error.message });
    }
};
