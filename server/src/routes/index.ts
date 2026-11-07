import { Router } from 'express';
import authRoutes from './auth.routes';
import businessesRoutes from './businesses.routes';
import leadsRoutes from './leads.routes';
import auditRoutes from './audit.routes';
import websitesRoutes from './websites.routes';
import statsRoutes from './stats.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/businesses', businessesRoutes);
router.use('/leads', leadsRoutes);
router.use('/audit', auditRoutes);
router.use('/websites', websitesRoutes);
router.use('/stats', statsRoutes);

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'scoutweb-backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

export default router;

