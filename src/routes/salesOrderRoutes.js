import { Router } from 'express';
import {
  getAllSalesOrders,
  getSalesOrder,
  createSalesOrder,
  createMultipleSalesOrders,
  updateSalesOrder,
  deleteSalesOrder,
} from '../controllers/salesOrderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     SalesOrder:
 *       type: object
 *       required:
 *         - customerId
 *         - customerName
 *         - items
 *         - total
 *       properties:
 *         id:
 *           type: string
 *           description: The UUID of the sales order
 *         customerId:
 *           type: number
 *           description: The ID of the customer
 *         customerName:
 *           type: string
 *           description: The name of the customer
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time the order was created
 *         status:
 *           type: string
 *           description: The status of the order
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               productId:
 *                 type: number
 *               productName:
 *                 type: string
 *               quantity:
 *                 type: number
 *               price:
 *                 type: number
 *         total:
 *           type: number
 *           description: The total amount of the order
 *       example:
 *         id: "d290f1ee-6c54-4b01-90e6-d701748f0851"
 *         customerId: 1
 *         customerName: "John Smith"
 *         createdAt: "2025-08-14T10:00:00Z"
 *         status: "Completed"
 *         items:
 *           - productId: 1
 *             productName: "Wireless Mouse"
 *             quantity: 1
 *             price: 25.99
 *           - productId: 2
 *             productName: "Mechanical Keyboard"
 *             quantity: 1
 *             price: 120.00
 *         total: 145.99
 */

/**
 * @swagger
 * tags:
 *   name: SalesOrders
 *   description: The sales orders managing API
 */

/**
 * @swagger
 * /salesOrders:
 *   get:
 *     summary: Returns the list of all the sales orders for the current user
 *     tags: [SalesOrders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The list of the sales orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SalesOrder'
 */
router.get('/', protect, getAllSalesOrders);

/**
 * @swagger
 * /salesOrders/{id}:
 *   get:
 *     summary: Get a sales order by ID
 *     tags: [SalesOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The sales order ID (UUID)
 *     responses:
 *       200:
 *         description: The sales order description by ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SalesOrder'
 *       404:
 *         description: The sales order was not found
 */
router.get('/:id', protect, getSalesOrder);

/**
 * @swagger
 * /salesOrders:
 *   post:
 *     summary: Create a new sales order
 *     tags: [SalesOrders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SalesOrder'
 *     responses:
 *       201:
 *         description: The sales order was successfully created
 *       500:
 *         description: Some server error
 */
router.post('/', protect, createSalesOrder);

/**
 * @swagger
 * /salesOrders/bulk:
 *   post:
 *     summary: Create multiple new sales orders
 *     tags: [SalesOrders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/SalesOrder'
 *     responses:
 *       201:
 *         description: The sales orders were successfully created
 *       500:
 *         description: Some server error
 */
router.post('/bulk', protect, createMultipleSalesOrders);

/**
 * @swagger
 * /salesOrders/{id}:
 *   put:
 *     summary: Update a sales order by ID
 *     tags: [SalesOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The sales order ID (UUID)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SalesOrder'
 *     responses:
 *       200:
 *         description: The sales order was updated
 *       404:
 *         description: The sales order was not found
 *       500:
 *         description: Some server error
 */
router.put('/:id', protect, updateSalesOrder);

/**
 * @swagger
 * /salesOrders/{id}:
 *   delete:
 *     summary: Delete a sales order by ID
 *     tags: [SalesOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The sales order ID (UUID)
 *     responses:
 *       200:
 *         description: The sales order was deleted
 *       404:
 *         description: The sales order was not found
 */
router.delete('/:id', protect, deleteSalesOrder);

export default router;
