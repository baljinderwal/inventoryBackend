import { Router } from 'express';
import {
  getAllStock,
  getStock,
  createStock,
  createMultipleStocks,
  updateStock,
  deleteStock,
} from '../controllers/stockController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Batch:
 *       type: object
 *       properties:
 *         batchNumber:
 *           type: string
 *         expiryDate:
 *           type: string
 *           format: date-time
 *         quantity:
 *           type: number
 *     Stock:
 *       type: object
 *       required:
 *         - productId
 *         - quantity
 *         - warehouse
 *       properties:
 *         productId:
 *           type: string
 *           description: The ID of the product (UUID)
 *         quantity:
 *           type: number
 *           description: The total quantity of the product in stock
 *         warehouse:
 *           type: string
 *           description: The warehouse where the product is stored
 *         batches:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Batch'
 *       example:
 *         productId: "d290f1ee-6c54-4b01-90e6-d701748f0851"
 *         quantity: 150
 *         warehouse: "A"
 *         batches:
 *           - batchNumber: "B001"
 *             expiryDate: "2026-11-10T10:00:00Z"
 *             quantity: 150
 */

/**
 * @swagger
 * tags:
 *   name: Stock
 *   description: The stock managing API
 */

/**
 * @swagger
 * /stock:
 *   get:
 *     summary: Returns the list of all the stock entries for the current user
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The list of the stock entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Stock'
 */
router.get('/', protect, getAllStock);

/**
 * @swagger
 * /stock/{productId}:
 *   get:
 *     summary: Get stock information by product ID
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *         description: The product ID (UUID)
 *     responses:
 *       200:
 *         description: The stock information by product ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Stock'
 *       404:
 *         description: The stock information was not found
 */
router.get('/:productId', protect, getStock);

/**
 * @swagger
 * /stock:
 *   post:
 *     summary: Create a new stock entry
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Stock'
 *     responses:
 *       201:
 *         description: The stock entry was successfully created
 *       500:
 *         description: Some server error
 */
router.post('/', protect, createStock);

/**
 * @swagger
 * /stock/bulk:
 *   post:
 *     summary: Create multiple new stock entries
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/Stock'
 *     responses:
 *       201:
 *         description: The stock entries were successfully created
 *       500:
 *         description: Some server error
 */
router.post('/bulk', protect, createMultipleStocks);

/**
 * @swagger
 * /stock/{productId}:
 *   put:
 *     summary: Update a stock entry by product ID
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *         description: The product ID (UUID)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Stock'
 *     responses:
 *       200:
 *         description: The stock entry was updated
 *       404:
 *         description: The stock entry was not found
 *       500:
 *         description: Some server error
 */
router.put('/:productId', protect, updateStock);

/**
 * @swagger
 * /stock/{productId}:
 *   delete:
 *     summary: Delete a stock entry by product ID
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *         description: The product ID (UUID)
 *     responses:
 *       200:
 *         description: The stock entry was deleted
 *       404:
 *         description: The stock entry was not found
 */
router.delete('/:productId', protect, deleteStock);

export default router;
