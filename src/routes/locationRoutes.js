import { Router } from 'express';
import {
  getAllLocations,
  getLocation,
  createLocation,
  createMultipleLocations,
  updateLocation,
  deleteLocation,
} from '../controllers/locationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Location:
 *       type: object
 *       required:
 *         - name
 *         - address
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the location
 *         name:
 *           type: string
 *           description: The name of the location
 *         address:
 *           type: string
 *           description: The address of the location
 *       example:
 *         id: 1
 *         name: "Main Warehouse"
 *         address: "123 Main St, Anytown, USA"
 */

/**
 * @swagger
 * tags:
 *   name: Locations
 *   description: The locations managing API
 */

/**
 * @swagger
 * /locations:
 *   get:
 *     summary: Returns the list of all the locations
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The list of the locations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Location'
 */
router.get('/', protect, getAllLocations);

/**
 * @swagger
 * /locations/{id}:
 *   get:
 *     summary: Get a location by id
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The location id
 *     responses:
 *       200:
 *         description: The location description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Location'
 *       404:
 *         description: The location was not found
 */
router.get('/:id', protect, getLocation);

/**
 * @swagger
 * /locations:
 *   post:
 *     summary: Create a new location
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Location'
 *     responses:
 *       201:
 *         description: The location was successfully created
 *       500:
 *         description: Some server error
 */
router.post('/', protect, createLocation);

/**
 * @swagger
 * /locations/bulk:
 *   post:
 *     summary: Create multiple new locations
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/Location'
 *     responses:
 *       201:
 *         description: The locations were successfully created
 *       500:
 *         description: Some server error
 */
router.post('/bulk', protect, createMultipleLocations);

/**
 * @swagger
 * /locations/{id}:
 *   put:
 *     summary: Update a location by id
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The location id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Location'
 *     responses:
 *       200:
 *         description: The location was updated
 *       404:
 *         description: The location was not found
 *       500:
 *         description: Some server error
 */
router.put('/:id', protect, updateLocation);

/**
 * @swagger
 * /locations/{id}:
 *   delete:
 *     summary: Delete a location by id
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The location id
 *     responses:
 *       200:
 *         description: The location was deleted
 *       404:
 *         description: The location was not found
 */
router.delete('/:id', protect, deleteLocation);

export default router;
