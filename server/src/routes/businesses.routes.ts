import { Router } from 'express';
import { searchBusinessesHandler, crawlEmailHandler } from '../controllers/businesses.controller';
import { optionalAuth } from '../middleware/auth';

const router = Router();

/**
 * @openapi
 * /businesses/search:
 *   post:
 *     summary: Discover real businesses with website status, live metrics, and authentic email crawling
 *     tags: [Businesses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [industry, location]
 *             properties:
 *               industry:
 *                 type: string
 *                 example: 'barbers'
 *               location:
 *                 type: string
 *                 example: 'Miami, FL'
 *               cms:
 *                 type: string
 *                 example: 'Wix'
 *               onlyNoWebsite:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: List of authentic business leads
 */
router.post('/search', optionalAuth, searchBusinessesHandler);

/**
 * @openapi
 * /businesses/crawl-email:
 *   post:
 *     summary: Live-crawl authentic domain email from official business website
 *     tags: [Businesses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [website]
 *             properties:
 *               website:
 *                 type: string
 *                 example: 'https://prestigeautodetail.com'
 *     responses:
 *       200:
 *         description: Crawl result with authentic verified email or null
 */
router.post('/crawl-email', crawlEmailHandler);

export default router;

