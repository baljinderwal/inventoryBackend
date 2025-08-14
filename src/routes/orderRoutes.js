import { Router } from 'express';
import {
  getAllOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrdersBySupplier,
  getOrdersByStatus,
} from '../controllers/orderController.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       required:
 *         - customerName
 *         - items
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the order
 *         customerName:
 *           type: string
 *           description: The name of the customer
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 description: The ID of the product
 *               quantity:
 *                 type: number
 *                 description: The quantity of the product
 *           description: The items in the order
 *         total:
 *           type: number
 *           description: The total amount of the order
 *         status:
 *           type: string
 *           description: The status of the order
 *           enum: [pending, completed, cancelled]
 *           default: pending
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time the order was created
 *       example:
 *         id: "d290f1ee-6c54-4b01-90e6-d701748f0851"
 *         customerName: "John Doe"
 *         items:
 *           - productId: "GL-XYZ-001"
 *             quantity: 1
 *         total: 1200
 *         status: "pending"
 *         createdAt: "2023-01-01T12:00:00.000Z"
 */

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: The orders managing API
 */

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Returns the list of all the orders
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort by field (e.g., createdAt)
 *       - in: query
 *         name: _order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: The list of the orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */
router.get('/', getAllOrders);

/**
 * @swagger
 * /orders/supplier/{supplierId}:
 *   get:
 *     summary: Get all orders from a specific supplier
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: supplierId
 *         schema:
 *           type: string
 *         required: true
 *         description: The supplier ID
 *     responses:
 *       200:
 *         description: A list of orders from the specified supplier
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       404:
 *         description: No orders found for this supplier
 */
router.get('/supplier/:supplierId', getOrdersBySupplier);

/**
 * @swagger
 * /orders/status/{status}:
 *   get:
 *     summary: Get all orders with a specific status
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: status
 *         schema:
 *           type: string
 *         required: true
 *         description: The order status
 *     responses:
 *       200:
 *         description: A list of orders with the specified status
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       404:
 *         description: No orders found with this status
 */
router.get('/status/:status', getOrdersByStatus);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get an order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The order ID
 *     responses:
 *       200:
 *         description: The order description by ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: The order was not found
 */
router.get('/:id', getOrder);

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       201:
 *         description: The order was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       500:
 *         description: Some server error
 */
router.post('/', createOrder);

/**
 * @swagger
 * /orders/{id}:
 *   put:
 *     summary: Update an order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       200:
 *         description: The order was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: The order was not found
 *       500:
 *         description: Some server error
 */
router.put('/:id', updateOrder);

/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     summary: Delete an order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The order ID
 *     responses:
 *       200:
 *         description: The order was deleted
 *       404:
 *         description: The order was not found
 */
router.delete('/:id', deleteOrder);

export default router;
