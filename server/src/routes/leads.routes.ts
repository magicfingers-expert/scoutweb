import { Router } from 'express';
import {
  getLeads,
  createLead,
  batchCreateLeads,
  getLeadById,
  updateLead,
  deleteLead,
  exportLeads,
} from '../controllers/leads.controller';
import { optionalAuth } from '../middleware/auth';

const router = Router();

/**
 * @openapi
 * /leads:
 *   get:
 *     summary: Retrieve saved CRM leads with filtering & pagination
 *     tags: [Leads]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: crm
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of leads
 */
router.get('/', optionalAuth, getLeads);

/**
 * @openapi
 * /leads:
 *   post:
 *     summary: Save a single lead into CRM pipeline
 *     tags: [Leads]
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
 *               category:
 *                 type: string
 *               crm:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               website:
 *                 type: string
 *     responses:
 *       201:
 *         description: Lead created
 */
router.post('/', optionalAuth, createLead);

/**
 * @openapi
 * /leads/batch:
 *   post:
 *     summary: Batch save multiple leads into CRM pipeline
 *     tags: [Leads]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [leads]
 *             properties:
 *               leads:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Batch leads created
 */
router.post('/batch', optionalAuth, batchCreateLeads);

/**
 * @openapi
 * /leads/export:
 *   get:
 *     summary: Export leads in CSV or JSON format
 *     tags: [Leads]
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *     responses:
 *       200:
 *         description: Exported data file
 */
router.get('/export', optionalAuth, exportLeads);

/**
 * @openapi
 * /leads/{id}:
 *   get:
 *     summary: Get lead by ID
 *     tags: [Leads]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lead details
 */
router.get('/:id', optionalAuth, getLeadById);

/**
 * @openapi
 * /leads/{id}:
 *   patch:
 *     summary: Update lead status, notes, contact info, or tags
 *     tags: [Leads]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               notes:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Lead updated
 */
router.patch('/:id', optionalAuth, updateLead);

/**
 * @openapi
 * /leads/{id}:
 *   delete:
 *     summary: Remove lead from CRM
 *     tags: [Leads]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lead deleted
 */
router.delete('/:id', optionalAuth, deleteLead);

export default router;

