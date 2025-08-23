import { Router } from 'express';
import {
  addShoe,
  getShoes,
  sellShoe,
} from '../controllers/timeseriesController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Timeseries
 *   description: The timeseries managing API for shoes
 */

/**
 * @swagger
 * /timeseries/shoes:
 *   post:
 *     summary: Add a new shoe to the timeseries data
 *     tags: [Timeseries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               size:
 *                 type: string
 *               color:
 *                 type: string
 *               quantity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: The shoe data was successfully added
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Some server error
 */
router.post('/shoes', protect, addShoe);

/**
 * @swagger
 * /timeseries/shoes:
 *   get:
 *     summary: Get shoe data from the timeseries
 *     tags: [Timeseries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: size
 *         schema:
 *           type: string
 *         description: The size of the shoe to filter by
 *       - in: query
 *         name: color
 *         schema:
 *           type: string
 *         description: The color of the shoe to filter by
 *     responses:
 *       200:
 *         description: A list of shoe data
 *       500:
 *         description: Some server error
 */
router.get('/shoes', protect, getShoes);

/**
 * @swagger
 * /timeseries/shoes/sell:
 *   post:
 *     summary: Mark a shoe as sold in the timeseries data
 *     tags: [Timeseries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               size:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       200:
 *         description: The shoe was successfully marked as sold
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Some server error
 */
router.post('/shoes/sell', protect, sellShoe);

export default router;
