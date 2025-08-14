import { Router } from 'express';
import {
  getAllSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getProductsBySupplier,
} from '../controllers/supplierController.js';

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
router.get('/', getAllSuppliers);

/**
 * @swagger
 * /suppliers/{id}:
 *   get:
 *     summary: Get a supplier by ID
 *     tags: [Suppliers]
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
router.get('/:id', getSupplier);

/**
 * @swagger
 * /suppliers/{id}/products:
 *   get:
 *     summary: Get all products for a specific supplier
 *     tags: [Suppliers]
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
router.get('/:id/products', getProductsBySupplier);

/**
 * @swagger
 * /suppliers:
 *   post:
 *     summary: Create a new supplier
 *     tags: [Suppliers]
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
router.post('/', createSupplier);

/**
 * @swagger
 * /suppliers/{id}:
 *   put:
 *     summary: Update a supplier by ID
 *     tags: [Suppliers]
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
router.put('/:id', updateSupplier);

/**
 * @swagger
 * /suppliers/{id}:
 *   delete:
 *     summary: Delete a supplier by ID
 *     tags: [Suppliers]
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
router.delete('/:id', deleteSupplier);

export default router;
