import * as orderService from '../services/orderService.js';
import { logAction } from '../services/auditService.js';

export const getAllOrders = async (req, res) => {
  try {
    const { sort, _order: order } = req.query;
    const orders = await orderService.getAllOrders(sort, order);
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving orders', error: error.message });
  }
};

export const getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving order', error: error.message });
  }
};

export const createOrder = async (req, res) => {
  try {
    const orderData = { ...req.body, userId: req.user.id };
    const newOrder = await orderService.createOrder(orderData);
    await logAction(req.user.id, 'CREATE_ORDER', { orderId: newOrder.id, details: newOrder });
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createMultipleOrders = async (req, res) => {
  try {
    const ordersData = req.body.map(order => ({ ...order, userId: req.user.id }));
    const newOrders = await orderService.createMultipleOrders(ordersData);
    for (const newOrder of newOrders) {
      await logAction(req.user.id, 'CREATE_ORDER', { orderId: newOrder.id, details: newOrder });
    }
    res.status(201).json(newOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedOrder = await orderService.updateOrder(id, updates);

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await logAction(req.user.id, 'UPDATE_ORDER', { orderId: id, changes: updates });
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await orderService.deleteOrder(id);

    if (result === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await logAction(req.user.id, 'DELETE_ORDER', { orderId: id });
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting order', error: error.message });
  }
};

export const getOrdersBySupplier = async (req, res) => {
  try {
    const { supplierId } = req.params;
    const orders = await orderService.getOrdersBySupplier(supplierId);
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving orders by supplier', error: error.message });
  }
};

export const getOrdersByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const orders = await orderService.getOrdersByStatus(status);
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving orders by status', error: error.message });
  }
};
