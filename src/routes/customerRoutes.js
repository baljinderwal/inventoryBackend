import { Router } from 'express';
import {
  getAllCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Customer:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         id:
 *           type: number
 *           description: The numeric ID of the customer
 *         name:
 *           type: string
 *           description: The name of the customer
 *         email:
 *           type: string
 *           description: The email of the customer
 *         phone:
 *           type: string
 *           description: The phone number of the customer
 *         address:
 *           type: string
 *           description: The address of the customer
 *       example:
 *         id: 1
 *         name: "John Smith"
 *         email: "john.smith@example.com"
 *         phone: "555-1234"
 *         address: "123 Main St, Anytown, USA"
 */

/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: The customers managing API
 */

/**
 * @swagger
 * /customers:
 *   get:
 *     summary: Returns the list of all the customers
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The list of the customers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Customer'
 */
router.get('/', protect, getAllCustomers);

/**
 * @swagger
 * /customers/{id}:
 *   get:
 *     summary: Get a customer by ID
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The customer ID
 *     responses:
 *       200:
 *         description: The customer description by ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       404:
 *         description: The customer was not found
 */
router.get('/:id', protect, getCustomer);

/**
 * @swagger
 * /customers:
 *   post:
 *     summary: Create a new customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Customer'
 *     responses:
 *       201:
 *         description: The customer was successfully created
 *       500:
 *         description: Some server error
 */
router.post('/', protect, createCustomer);

/**
 * @swagger
 * /customers/{id}:
 *   put:
 *     summary: Update a customer by ID
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The customer ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Customer'
 *     responses:
 *       200:
 *         description: The customer was updated
 *       404:
 *         description: The customer was not found
 *       500:
 *         description: Some server error
 */
router.put('/:id', protect, updateCustomer);

/**
 * @swagger
 * /customers/{id}:
 *   delete:
 *     summary: Delete a customer by ID
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The customer ID
 *     responses:
 *       200:
 *         description: The customer was deleted
 *       404:
 *         description: The customer was not found
 */
router.delete('/:id', protect, deleteCustomer);

export default router;
