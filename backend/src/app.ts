import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { Server } from 'http';

// Import configuration and database
import appConfig, { printConfigSummary } from './config/env';
import { initializeDatabases, closeDatabases } from './config/database';
import { setupSwagger } from './config/swagger';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { HealthStatus } from './types';

// Import routes (will be created in next phase)
import authRoutes from './routes/auth';
import tasksRoutes from './routes/tasks';
import categoriesRoutes from './routes/categories';
import tagsRoutes from './routes/tags';

const config = appConfig;

/**
 * Create Express application
 */
const app: Application = express();

/**
 * Trust proxy settings for production deployment
 */
if (config.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

/**
 * Security Middleware
 */
app.use(
  helmet({
    contentSecurityPolicy: config.helmet.contentSecurityPolicy,
    hsts: {
      maxAge: config.helmet.hstsMaxAge,
      includeSubDomains: true,
      preload: true,
    },
  })
);

/**
 * CORS Configuration
 */
app.use(
  cors({
    origin: config.cors.origin,
    methods: config.cors.methods,
    allowedHeaders: config.cors.allowedHeaders,
    credentials: config.cors.credentials,
  })
);

/**
 * Rate Limiting
 */
const limiter = rateLimit({
  windowMs: config.security.rateLimitWindowMs,
  max: config.security.rateLimitMaxRequests,
  message: {
    error: config.security.rateLimitMessage,
    retryAfter:
      Math.ceil(config.security.rateLimitWindowMs / 1000 / 60) + ' minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

/**
 * Body parsing middleware
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Compression middleware
 */
app.use(compression());

/**
 * Logging middleware
 */
if (config.NODE_ENV !== 'test') {
  app.use(morgan(config.logging.format));
}

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health Check del servidor
 *     description: Endpoint para verificar el estado de salud del servidor y la API
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Servidor funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-12-11T15:30:00.000Z"
 *                 environment:
 *                   type: string
 *                   example: "development"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 uptime:
 *                   type: integer
 *                   description: Tiempo de actividad del servidor en segundos
 *                   example: 3600
 *                 memory:
 *                   type: object
 *                   properties:
 *                     used:
 *                       type: number
 *                       description: Memoria usada en MB
 *                       example: 45.67
 *                     total:
 *                       type: number
 *                       description: Memoria total disponible en MB
 *                       example: 128.45
 *             example:
 *               status: "OK"
 *               timestamp: "2024-12-11T15:30:00.000Z"
 *               environment: "development"
 *               version: "1.0.0"
 *               uptime: 3600
 *               memory:
 *                 used: 45.67
 *                 total: 128.45
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 *
 * Health check endpoint
 */
app.get('/health', async (req: Request, res: Response): Promise<void> => {
  try {
    // Basic health check - can be expanded with database checks
    const healthStatus: HealthStatus = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: config.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      uptime: Math.floor(process.uptime()),
      memory: {
        used:
          Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) /
          100,
        total:
          Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) /
          100,
      },
    };

    res.status(200).json(healthStatus);
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      message: 'Service temporarily unavailable',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * API Routes
 */
app.get('/api', (req: Request, res: Response): void => {
  res.json({
    message: 'TodoList API Server',
    version: config.API_VERSION,
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      tasks: '/api/tasks',
      categories: '/api/categories',
      tags: '/api/tags',
    },
    documentation: '/api/docs',
  });
});

/**
 * Setup Swagger Documentation
 */
setupSwagger(app);

// API Routes will be added here in Phase 3
app.use('/api/auth', authRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/tags', tagsRoutes);

/**
 * 404 Handler
 */
app.use(notFoundHandler);

/**
 * Global Error Handler
 */
app.use(errorHandler);

/**
 * Graceful shutdown handler
 */
const gracefulShutdown = async (signal: string): Promise<void> => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

  try {
    // Close database connections
    await closeDatabases();

    console.log('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

/**
 * Unhandled rejection handler
 */
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

/**
 * Uncaught exception handler
 */
process.on('uncaughtException', (error: Error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

/**
 * Start server
 */
export const startServer = async (): Promise<Server> => {
  try {
    // Print configuration summary
    printConfigSummary();

    // Initialize database connections
    await initializeDatabases();

    // Start HTTP server
    const server = app.listen(config.PORT, () => {
      console.log(
        `🚀 Server running on port ${config.PORT} in ${config.NODE_ENV} mode`
      );
      console.log(`📊 Health check: http://localhost:${config.PORT}/health`);
      console.log(`🔗 API Base URL: http://localhost:${config.PORT}/api`);
    });

    // Handle server errors
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${config.PORT} is already in use`);
      } else {
        console.error('❌ Server error:', error);
      }
      process.exit(1);
    });

    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

export { app };
