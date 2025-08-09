import { Router } from 'express';
import {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - sku
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the product
 *         sku:
 *           type: string
 *           description: The Stock Keeping Unit (SKU), unique identifier for the product
 *         category:
 *           type: string
 *           description: The category of the product
 *         price:
 *           type: number
 *           description: The selling price of the product
 *         costPrice:
 *           type: number
 *           description: The cost price of the product
 *         stock:
 *           type: number
 *           description: The number of items in stock
 *       example:
 *         name: "Gaming Laptop"
 *         sku: "GL-XYZ-001"
 *         category: "Electronics"
 *         price: 1200
 *         costPrice: 950
 *         stock: 50
 */

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: The products managing API
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Returns the list of all the products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: The list of the products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get('/', getAllProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a product by SKU
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The product SKU
 *     responses:
 *       200:
 *         description: The product description by SKU
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: The product was not found
 */
router.get('/:id', getProduct);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: The product was successfully created
 *       500:
 *         description: Some server error
 */
router.post('/', createProduct);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product by SKU
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The product SKU
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: The product was updated
 *       404:
 *         description: The product was not found
 *       500:
 *         description: Some server error
 */
router.put('/:id', updateProduct);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product by SKU
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The product SKU
 *     responses:
 *       200:
 *         description: The product was deleted
 *       404:
 *         description: The product was not found
 */
router.delete('/:id', deleteProduct);

export default router;
