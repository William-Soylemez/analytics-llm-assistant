// ABOUTME: Main server entry point for the GA Insights Platform backend
// ABOUTME: Sets up Express app, middleware, and starts the HTTP server

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import logger from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.middleware';
import db from './config/database';
import redis from './config/redis';
import authRoutes from './routes/auth.routes';
import oauthRoutes from './routes/oauth.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    await redis.ping();

    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      redis: 'connected',
    });
  } catch (error) {
    logger.error('Health check failed', error);
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Service unavailable',
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/auth', oauthRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

let server: ReturnType<typeof app.listen>;

const startServer = async () => {
  try {
    await db.query('SELECT 1');
    logger.info('Database connected successfully');

    await redis.ping();
    logger.info('Redis connected successfully');

    server = app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received, shutting down gracefully...`);

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');

      try {
        await db.end();
        logger.info('Database connection closed');

        await redis.quit();
        logger.info('Redis connection closed');

        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown:', error);
        process.exit(1);
      }
    });

    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

if (require.main === module) {
  startServer();
}

export default app;