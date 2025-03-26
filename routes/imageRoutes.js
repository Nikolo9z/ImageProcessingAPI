import express from 'express'
import {
  uploadImage,
  upload,
  getAllMyImages,
  getImageById,
  deleteImage,
  toggleLike,
  addComment,
  deleteComment
} from '../controllers/imageController.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

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
router.post('/upload', protect, upload.single('image'), uploadImage)

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
router.get('/', protect, getAllMyImages)

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
router.get('/:id', protect, getImageById)

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
router.delete('/:id', protect, deleteImage)

router.post('/:id/like', protect, toggleLike)
router.post('/:id/comments', protect, addComment)
router.get('/:id/:commentId/comments', protect, deleteComment)
export default router
