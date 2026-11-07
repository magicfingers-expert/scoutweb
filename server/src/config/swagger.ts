import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ScoutWeb Enterprise API',
      version: '1.0.0',
      description:
        'Robust, high-throughput REST API for ScoutWeb — Lead Discovery, Opportunity Scoring, Authentic Domain Verification, AI Website Auditing, and Outreach Automation.',
      contact: {
        name: 'ScoutWeb Engineering Team',
        email: 'api@scoutweb.io',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token obtained from /api/v1/auth/login or /api/v1/auth/register',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clx...123' },
            name: { type: 'string', example: 'Alex Morgan' },
            email: { type: 'string', example: 'demo@scoutweb.io' },
            role: { type: 'string', example: 'admin' },
            plan: { type: 'string', example: 'agency' },
            searchesLimit: { type: 'integer', example: 1000 },
            searchesUsed: { type: 'integer', example: 12 },
          },
        },
        Lead: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            businessName: { type: 'string', example: 'Prestige Auto Detail' },
            category: { type: 'string', example: 'Auto Detailing' },
            crm: { type: 'string', example: 'Wix' },
            address: { type: 'string', example: '123 Main St, Miami, FL' },
            city: { type: 'string', example: 'Miami, FL' },
            phone: { type: 'string', example: '+1 (305) 555-0199' },
            email: { type: 'string', example: 'contact@prestigeautodetail.com' },
            website: { type: 'string', example: 'https://prestigeautodetail.com' },
            websiteStatus: { type: 'string', example: 'active' },
            rating: { type: 'number', example: 4.8 },
            reviewCount: { type: 'integer', example: 87 },
            googleMapsUrl: { type: 'string' },
            opportunityScore: { type: 'integer', example: 85 },
            opportunityTier: { type: 'string', example: 'High' },
            status: { type: 'string', example: 'New' },
            notes: { type: 'string' },
          },
        },
        Audit: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            url: { type: 'string', example: 'https://example.com' },
            businessName: { type: 'string', example: 'Example Corp' },
            overallScore: { type: 'integer', example: 62 },
            summary: { type: 'string' },
            scores: { type: 'object' },
            metrics: { type: 'object' },
            issues: { type: 'array', items: { type: 'string' } },
            actionPlan: { type: 'array', items: { type: 'string' } },
            outreachMessages: { type: 'object' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./server/src/routes/*.ts', './server/src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

