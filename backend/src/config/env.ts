import dotenv from 'dotenv';
import { AppConfig } from '../types';

dotenv.config();

/**
 * Environment Configuration Module
 * Centralizes all environment variables with validation and defaults
 */

const requiredEnvVars = [
  'DB_HOST',
  'DB_PORT', 
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'JWT_SECRET'
];

/**
 * Validate required environment variables
 */
const validateEnv = (): void => {
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    process.exit(1);
  }
  
  // Validate JWT secret length
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.error('❌ JWT_SECRET must be at least 32 characters long');
    process.exit(1);
  }
  
  console.log('✅ Environment variables validated');
};

/**
 * Application Configuration
 */
const config: AppConfig = {
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000'),
  API_VERSION: process.env.API_VERSION || 'v1',
  
  // Database
  database: {
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT!),
    database: process.env.DB_NAME!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
    idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000'),
  },
  
  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    database: parseInt(process.env.REDIS_DB || '0'),
    defaultTTL: parseInt(process.env.REDIS_TTL_DEFAULT || '300'),
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    issuer: process.env.JWT_ISSUER || 'todolist-app',
    algorithm: process.env.JWT_ALGORITHM || 'HS256',
  },
  
  // Security
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    rateLimitMessage: process.env.RATE_LIMIT_MESSAGE || 'Too many requests from this IP, please try again later',
  },
  
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: process.env.CORS_METHODS || 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: process.env.CORS_ALLOWED_HEADERS || 'Content-Type,Authorization',
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
    errorFile: process.env.LOG_FILE_ERROR || 'logs/error.log',
    combinedFile: process.env.LOG_FILE_COMBINED || 'logs/combined.log',
    maxSize: process.env.LOG_MAX_SIZE || '5m',
    maxFiles: process.env.LOG_MAX_FILES || '5',
  },
  
  // File Upload
  upload: {
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || (5 * 1024 * 1024).toString()), // 5MB
    allowedTypes: process.env.UPLOAD_ALLOWED_TYPES?.split(',') || ['image/jpeg', 'image/png', 'image/gif'],
    destination: process.env.UPLOAD_DESTINATION || 'uploads/',
  },
  
  // Email (for future notifications)
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || 'TodoList App <noreply@todolist.com>',
  },
  
  // Cache TTL settings
  cache: {
    defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || '300'),      // 5 minutes
    searchTTL: parseInt(process.env.CACHE_SEARCH_TTL || '120'),       // 2 minutes
    statsTTL: parseInt(process.env.CACHE_STATS_TTL || '900'),         // 15 minutes
  },
  
  // Pagination
  pagination: {
    defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE || '20'),
    maxPageSize: parseInt(process.env.MAX_PAGE_SIZE || '100'),
  },
  
  // Feature Flags
  features: {
    emailNotifications: process.env.FEATURE_EMAIL_NOTIFICATIONS === 'true',
    fileUpload: process.env.FEATURE_FILE_UPLOAD === 'true',
    bulkOperations: process.env.FEATURE_BULK_OPERATIONS === 'true',
  },
  
  // Helmet Security Headers
  helmet: {
    contentSecurityPolicy: process.env.HELMET_CONTENT_SECURITY_POLICY === 'true',
    hstsMaxAge: parseInt(process.env.HELMET_HSTS_MAX_AGE || '31536000'), // 1 year
  }
};

/**
 * Get configuration for specific environment
 */
const getConfig = (): AppConfig => {
  validateEnv();
  
  // Development specific overrides
  if (config.NODE_ENV === 'development') {
    config.security.bcryptRounds = 10; // Faster for development
    config.logging.level = 'debug';
  }
  
  // Production specific overrides
  if (config.NODE_ENV === 'production') {
    config.security.rateLimitMaxRequests = 50; // Stricter in production
    config.logging.level = 'warn';
  }
  
  return config;
};

/**
 * Print configuration summary (without sensitive data)
 */
const printConfigSummary = (): void => {
  const summary = {
    environment: config.NODE_ENV,
    port: config.PORT,
    database: {
      host: config.database.host,
      port: config.database.port,
      database: config.database.database,
    },
    redis: {
      host: config.redis.host,
      port: config.redis.port,
    },
    cors: {
      origin: config.cors.origin,
    },
    features: config.features,
  };
  
  console.log('⚙️ Configuration Summary:', JSON.stringify(summary, null, 2));
};

export {
  getConfig,
  validateEnv,
  printConfigSummary,
};

export default getConfig();
