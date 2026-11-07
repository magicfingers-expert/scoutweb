import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app';
import { prisma } from './config/prisma';

const PORT = process.env.BACKEND_PORT ? parseInt(process.env.BACKEND_PORT, 10) : 5000;

async function bootstrap() {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log('✓ Database connected successfully (SQLite / Prisma)');

    const app = createApp();

    const server = app.listen(PORT, () => {
      console.log('====================================================');
      console.log(`🚀 ScoutWeb Enterprise Backend Server running!`);
      console.log(`📡 API Base URL:       http://localhost:${PORT}/api/v1`);
      console.log(`📚 Swagger Docs:       http://localhost:${PORT}/api/docs`);
      console.log(`❤️ Health Check:       http://localhost:${PORT}/api/v1/health`);
      console.log(`🔒 Mode:               ${process.env.NODE_ENV || 'development'}`);
      console.log('====================================================');
    });

    const shutdown = async () => {
      console.log('\nShutting down backend server gracefully...');
      server.close(async () => {
        await prisma.$disconnect();
        console.log('✓ Database disconnected. Process terminated.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('Fatal backend startup error:', error);
    process.exit(1);
  }
}

bootstrap();

