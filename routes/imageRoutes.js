import express from 'express';
import { uploadImage, upload, getAllImages, getImageId, deleteImage, resizeImage, rotateImage, flipImage, changeFormatImage } from '../controllers/imageController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Images
 *   description: Image processing routes, 
 */

/**
 * @swagger
 * /api/images/upload:
 *   post:
 *     summary: Upload an image
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Image uploaded successfully
 *       400:
 *         description: Invalid image format
 */
router.post('/upload', protect, upload.single('image'), uploadImage);

/**
 * @swagger
 * /api/images:
 *   get:
 *     summary: Get all images
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of images
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Image'
 *       500:
 *         description: Error retrieving images
 */
router.get('/', protect, getAllImages);

/**
 * @swagger
 * /api/images/{id}:
 *   get:
 *     summary: Get an image by ID
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The image ID
 *     responses:
 *       200:
 *         description: The image data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Image'
 *       404:
 *         description: Image not found
 */
router.get('/:id', protect, getImageId);

/**
 * @swagger
 * /api/images/{id}:
 *   delete:
 *     summary: Delete an image by ID
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The image ID
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *       404:
 *         description: Image not found
 */
router.delete('/:id', protect, deleteImage);

/**
 * @swagger
 * /api/images/resize/{id}:
 *   get:
 *     summary: Resize an image
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The image ID
 *       - in: query
 *         name: width
 *         required: true
 *         schema:
 *           type: integer
 *         description: The new width of the image
 *       - in: query
 *         name: height
 *         required: true
 *         schema:
 *           type: integer
 *         description: The new height of the image
 *     responses:
 *       200:
 *         description: Image resized successfully
 *       404:
 *         description: Image not found
 */
router.get('/resize/:id', protect, resizeImage);

/**
 * @swagger
 * /api/images/rotate/{id}:
 *   get:
 *     summary: Rotate an image
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The image ID
 *       - in: query
 *         name: angle
 *         required: true
 *         schema:
 *           type: integer
 *         description: The angle to rotate the image
 *     responses:
 *       200:
 *         description: Image rotated successfully
 *       404:
 *         description: Image not found
 */
router.get('/rotate/:id', protect, rotateImage);

/**
 * @swagger
 * /api/images/flip/{id}:
 *   get:
 *     summary: Flip an image
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The image ID
 *       - in: query
 *         name: flip
 *         required: true
 *         schema:
 *           type: string
 *         description: The direction to flip the image (horizontal or vertical)
 *     responses:
 *       200:
 *         description: Image flipped successfully
 *       404:
 *         description: Image not found
 */
router.get('/flip/:id', protect, flipImage);

/**
 * @swagger
 * /api/images/change/{id}:
 *   get:
 *     summary: Change the format of an image
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The image ID
 *       - in: query
 *         name: format
 *         required: true
 *         schema:
 *           type: string
 *         description: The new format of the image
 *     responses:
 *       200:
 *         description: Image format changed successfully
 *       404:
 *         description: Image not found
 */
router.get('/change/:id', protect, changeFormatImage);

export default router;