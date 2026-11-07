import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { requestLogger } from './middleware/logger';
import { errorHandler } from './middleware/errorHandler';
import apiRoutes from './routes';

export function createApp(): Application {
  const app = express();

  // CORS configuration
  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.NEXT_PUBLIC_APP_URL || '',
  ].filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
          return callback(null, true);
        }
        return callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Logging middleware
  app.use(requestLogger);

  // Swagger Documentation UI
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: `
        .swagger-ui .topbar { background-color: #0f172a; border-bottom: 2px solid #06b6d4; }
        .swagger-ui { background-color: #f8fafc; font-family: Inter, sans-serif; }
      `,
      customSiteTitle: 'ScoutWeb API Documentation',
    })
  );

  app.get('/api/docs.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // Root welcome & status
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      name: 'ScoutWeb Enterprise API',
      status: 'active',
      version: '1.0.0',
      docs: '/api/docs',
      apiPrefix: '/api/v1',
    });
  });

  // Mount API v1 router
  app.use('/api/v1', apiRoutes);

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: `Endpoint not found: ${req.method} ${req.originalUrl}`,
      docs: '/api/docs',
    });
  });

  // Central error handling middleware
  app.use(errorHandler);

  return app;
}

export default createApp;

