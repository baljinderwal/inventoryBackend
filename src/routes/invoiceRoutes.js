import { Router } from 'express';
import {
  getAllInvoices,
  getInvoice,
  createInvoice,
  createMultipleInvoices,
  updateInvoice,
  deleteInvoice,
} from '../controllers/invoiceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Invoice:
 *       type: object
 *       required:
 *         - salesOrderId
 *         - customerId
 *         - customerName
 *         - items
 *         - total
 *       properties:
 *         id:
 *           type: string
 *           description: The UUID of the invoice
 *         salesOrderId:
 *           type: string
 *           description: The ID of the sales order (UUID)
 *         customerId:
 *           type: string
 *           description: The ID of the customer (UUID)
 *         customerName:
 *           type: string
 *           description: The name of the customer
 *         invoiceDate:
 *           type: string
 *           format: date-time
 *           description: The date the invoice was created
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: The date the invoice is due
 *         status:
 *           type: string
 *           description: The status of the invoice
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               productName:
 *                 type: string
 *               quantity:
 *                 type: number
 *               price:
 *                 type: number
 *         total:
 *           type: number
 *           description: The total amount of the invoice
 *       example:
 *         id: "d290f1ee-6c54-4b01-90e6-d701748f0851"
 *         salesOrderId: "c290f1ee-6c54-4b01-90e6-d701748f0852"
 *         customerId: "b290f1ee-6c54-4b01-90e6-d701748f0853"
 *         customerName: "John Smith"
 *         invoiceDate: "2025-08-15T10:00:00Z"
 *         dueDate: "2025-09-14T10:00:00Z"
 *         status: "Paid"
 *         items:
 *           - productId: "a290f1ee-6c54-4b01-90e6-d701748f0854"
 *             productName: "Wireless Mouse"
 *             quantity: 1
 *             price: 25.99
 *           - productId: "9d9e8050-0d7f-4e01-8c62-bce8bd67d4f8"
 *             productName: "Mechanical Keyboard"
 *             quantity: 1
 *             price: 120
 *         total: 145.99
 */

/**
 * @swagger
 * tags:
 *   name: Invoices
 *   description: The invoices managing API
 */

/**
 * @swagger
 * /invoices:
 *   get:
 *     summary: Returns the list of all the invoices for the current user
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The list of the invoices
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Invoice'
 */
router.get('/', protect, getAllInvoices);

/**
 * @swagger
 * /invoices/{id}:
 *   get:
 *     summary: Get an invoice by ID
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The invoice ID (UUID)
 *     responses:
 *       200:
 *         description: The invoice description by ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Invoice'
 *       404:
 *         description: The invoice was not found
 */
router.get('/:id', protect, getInvoice);

/**
 * @swagger
 * /invoices:
 *   post:
 *     summary: Create a new invoice
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Invoice'
 *     responses:
 *       201:
 *         description: The invoice was successfully created
 *       500:
 *         description: Some server error
 */
router.post('/', protect, createInvoice);

/**
 * @swagger
 * /invoices/bulk:
 *   post:
 *     summary: Create multiple new invoices
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/Invoice'
 *     responses:
 *       201:
 *         description: The invoices were successfully created
 *       500:
 *         description: Some server error
 */
router.post('/bulk', protect, createMultipleInvoices);

/**
 * @swagger
 * /invoices/{id}:
 *   put:
 *     summary: Update an invoice by ID
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The invoice ID (UUID)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Invoice'
 *     responses:
 *       200:
 *         description: The invoice was updated
 *       404:
 *         description: The invoice was not found
 *       500:
 *         description: Some server error
 */
router.put('/:id', protect, updateInvoice);

/**
 * @swagger
 * /invoices/{id}:
 *   delete:
 *     summary: Delete an invoice by ID
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The invoice ID (UUID)
 *     responses:
 *       200:
 *         description: The invoice was deleted
 *       404:
 *         description: The invoice was not found
 */
router.delete('/:id', protect, deleteInvoice);

export default router;
