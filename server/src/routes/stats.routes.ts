import { Router } from 'express';
import { getStatsOverview } from '../controllers/stats.controller';
import { optionalAuth } from '../middleware/auth';

const router = Router();

/**
 * @openapi
 * /stats/overview:
 *   get:
 *     summary: Get high-level pipeline metrics, conversion rates, and recent activity
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: Pipeline and platform statistics
 */
router.get('/overview', optionalAuth, getStatsOverview);

export default router;

