import { Router } from 'express';
import {
  getAllSuppliers,
  getSupplier,
  createSupplier,
  createMultipleSuppliers,
  updateSupplier,
  deleteSupplier,
  getProductsBySupplier,
} from '../controllers/supplierController.js';
import { protect } from '../middleware/authMiddleware.js';
import authorize from '../middleware/authorize.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Supplier:
 *       type: object
 *       required:
 *         - id
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: The unique identifier for the supplier
 *         name:
 *           type: string
 *           description: The name of the supplier
 *         contact:
 *           type: string
 *           description: The contact person for the supplier
 *         email:
 *           type: string
 *           description: The email address of the supplier
 *         products:
 *           type: array
 *           items:
 *             type: integer
 *           description: A list of product IDs supplied by the supplier
 *       example:
 *         id: 1
 *         name: "ElectroSupply"
 *         contact: "John Doe"
 *         email: "john.doe@electrosupply.com"
 *         products: [1, 2, 8]
 */

/**
 * @swagger
 * tags:
 *   name: Suppliers
 *   description: The suppliers managing API
 */

/**
 * @swagger
 * /suppliers:
 *   get:
 *     summary: Returns the list of all the suppliers
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The list of the suppliers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Supplier'
 */
router.get('/', protect, getAllSuppliers);

/**
 * @swagger
 * /suppliers/{id}:
 *   get:
 *     summary: Get a supplier by ID
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The supplier ID
 *     responses:
 *       200:
 *         description: The supplier description by ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Supplier'
 *       404:
 *         description: The supplier was not found
 */
router.get('/:id', protect, getSupplier);

/**
 * @swagger
 * /suppliers/{id}/products:
 *   get:
 *     summary: Get all products for a specific supplier
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The supplier ID
 *     responses:
 *       200:
 *         description: A list of products for the specified supplier
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       404:
 *         description: The supplier was not found
 */
router.get('/:id/products', protect, getProductsBySupplier);

/**
 * @swagger
 * /suppliers:
 *   post:
 *     summary: Create a new supplier
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Supplier'
 *     responses:
 *       201:
 *         description: The supplier was successfully created
 *       500:
 *         description: Some server error
 */
router.post('/', protect, createSupplier);

/**
 * @swagger
 * /suppliers/bulk:
 *   post:
 *     summary: Create multiple new suppliers
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/Supplier'
 *     responses:
 *       201:
 *         description: The suppliers were successfully created
 *       500:
 *         description: Some server error
 */
router.post('/bulk', protect, createMultipleSuppliers);

/**
 * @swagger
 * /suppliers/{id}:
 *   put:
 *     summary: Update a supplier by ID
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The supplier ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Supplier'
 *     responses:
 *       200:
 *         description: The supplier was updated
 *       404:
 *         description: The supplier was not found
 *       500:
 *         description: Some server error
 */
router.put('/:id', protect, updateSupplier);

/**
 * @swagger
 * /suppliers/{id}:
 *   delete:
 *     summary: Delete a supplier by ID
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The supplier ID
 *     responses:
 *       200:
 *         description: The supplier was deleted
 *       404:
 *         description: The supplier was not found
 */
router.delete('/:id', protect, authorize('admin'), deleteSupplier);

export default router;
