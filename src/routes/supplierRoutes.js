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
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           description: The unique identifier for the supplier (UUID)
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
 *             type: string
 *           description: A list of product IDs (UUIDs) supplied by the supplier
 *       example:
 *         id: "d290f1ee-6c54-4b01-90e6-d701748f0851"
 *         name: "ElectroSupply"
 *         contact: "John Doe"
 *         email: "john.doe@electrosupply.com"
 *         products: ["f805a02b-15ef-4fd8-968b-6ae8373f6d24", "9d9e8050-0d7f-4e01-8c62-bce8bd67d4f8"]
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
 *     summary: Returns the list of all the suppliers for the current user
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
 *           type: string
 *         required: true
 *         description: The supplier ID (UUID)
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
 *           type: string
 *         required: true
 *         description: The supplier ID (UUID)
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
 *           type: string
 *         required: true
 *         description: The supplier ID (UUID)
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
 *           type: string
 *         required: true
 *         description: The supplier ID (UUID)
 *     responses:
 *       200:
 *         description: The supplier was deleted
 *       404:
 *         description: The supplier was not found
 */
router.delete('/:id', protect, authorize('Admin'), deleteSupplier);

export default router;
