import { Router } from 'express';
import {
  createWebsiteHandler,
  getWebsitesHandler,
  getWebsiteBySlugHandler,
  updateWebsiteHandler,
  deleteWebsiteHandler,
} from '../controllers/websites.controller';
import { optionalAuth } from '../middleware/auth';

const router = Router();

/**
 * @openapi
 * /websites/generate:
 *   post:
 *     summary: Generate an AI website project for a lead
 *     tags: [Websites]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [businessName]
 *             properties:
 *               businessName:
 *                 type: string
 *               title:
 *                 type: string
 *               industry:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Website project created
 */
router.post('/generate', optionalAuth, createWebsiteHandler);

/**
 * @openapi
 * /websites:
 *   get:
 *     summary: List all website projects
 *     tags: [Websites]
 *     responses:
 *       200:
 *         description: Website projects list
 */
router.get('/', optionalAuth, getWebsitesHandler);

/**
 * @openapi
 * /websites/{slug}:
 *   get:
 *     summary: Get website configuration and content by slug
 *     tags: [Websites]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Website content
 */
router.get('/:slug', optionalAuth, getWebsiteBySlugHandler);

/**
 * @openapi
 * /websites/{id}:
 *   patch:
 *     summary: Update website project content, theme, or publication status
 *     tags: [Websites]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Updated project
 */
router.patch('/:id', optionalAuth, updateWebsiteHandler);

/**
 * @openapi
 * /websites/{id}:
 *   delete:
 *     summary: Delete website project
 *     tags: [Websites]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 */
router.delete('/:id', optionalAuth, deleteWebsiteHandler);

export default router;

