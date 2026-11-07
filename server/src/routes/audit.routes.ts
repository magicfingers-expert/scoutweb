import { Router } from 'express';
import { runAuditHandler, getAuditsHandler, getAuditByIdHandler } from '../controllers/audit.controller';
import { optionalAuth } from '../middleware/auth';

const router = Router();

/**
 * @openapi
 * /audit/run:
 *   post:
 *     summary: Run real-time website audit with technical diagnostics, UX scoring, and personalized outreach generation
 *     tags: [Audit]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [url]
 *             properties:
 *               url:
 *                 type: string
 *                 example: 'https://pixelstreet.xyz'
 *               businessName:
 *                 type: string
 *                 example: 'Pixel Street'
 *               businessType:
 *                 type: string
 *                 example: 'Design Agency'
 *     responses:
 *       201:
 *         description: Full comprehensive audit report and generated outreach
 */
router.post('/run', optionalAuth, runAuditHandler);

/**
 * @openapi
 * /audit/history:
 *   get:
 *     summary: Fetch historical website audits
 *     tags: [Audit]
 *     responses:
 *       200:
 *         description: Audit records list
 */
router.get('/history', optionalAuth, getAuditsHandler);

/**
 * @openapi
 * /audit/{id}:
 *   get:
 *     summary: Get audit details by ID
 *     tags: [Audit]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Audit record
 */
router.get('/:id', optionalAuth, getAuditByIdHandler);

export default router;

