// Type declarations for modules without TypeScript definitions

declare module 'express-rate-limit' {
  import { Request, Response, NextFunction } from 'express';

  interface RateLimitConfig {
    windowMs?: number;
    max?: number;
    message?: string | object;
    standardHeaders?: boolean;
    legacyHeaders?: boolean;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
    keyGenerator?: (req: Request) => string;
    handler?: (req: Request, res: Response, next: NextFunction) => void;
    onLimitReached?: (req: Request, res: Response, options: any) => void;
  }

  function rateLimit(
    config: RateLimitConfig
  ): (req: Request, res: Response, next: NextFunction) => void;
  export = rateLimit;
}

declare module 'compression' {
  import { Request, Response, NextFunction } from 'express';

  interface CompressionOptions {
    chunkSize?: number;
    filter?: (req: Request, res: Response) => boolean;
    level?: number;
    memLevel?: number;
    strategy?: number;
    threshold?: number;
    windowBits?: number;
  }

  function compression(
    options?: CompressionOptions
  ): (req: Request, res: Response, next: NextFunction) => void;
  export = compression;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT?: string;
      API_VERSION?: string;

      // Database
      DB_HOST: string;
      DB_PORT: string;
      DB_NAME: string;
      DB_USER: string;
      DB_PASSWORD: string;
      DB_MAX_CONNECTIONS?: string;
      DB_IDLE_TIMEOUT?: string;
      DB_CONNECTION_TIMEOUT?: string;

      // Redis
      REDIS_HOST?: string;
      REDIS_PORT?: string;
      REDIS_PASSWORD?: string;
      REDIS_DB?: string;
      REDIS_TTL_DEFAULT?: string;

      // JWT
      JWT_SECRET: string;
      JWT_EXPIRES_IN?: string;
      JWT_ISSUER?: string;
      JWT_ALGORITHM?: string;

      // Security
      BCRYPT_ROUNDS?: string;
      RATE_LIMIT_WINDOW_MS?: string;
      RATE_LIMIT_MAX_REQUESTS?: string;
      RATE_LIMIT_MESSAGE?: string;

      // CORS
      CORS_ORIGIN?: string;
      CORS_METHODS?: string;
      CORS_ALLOWED_HEADERS?: string;
      CORS_CREDENTIALS?: string;

      // Logging
      LOG_LEVEL?: string;
      LOG_FORMAT?: string;
      LOG_FILE_ERROR?: string;
      LOG_FILE_COMBINED?: string;
      LOG_MAX_SIZE?: string;
      LOG_MAX_FILES?: string;

      // File Upload
      UPLOAD_MAX_SIZE?: string;
      UPLOAD_ALLOWED_TYPES?: string;
      UPLOAD_DESTINATION?: string;

      // Email
      EMAIL_SERVICE?: string;
      EMAIL_USER?: string;
      EMAIL_PASSWORD?: string;
      EMAIL_FROM?: string;

      // Cache
      CACHE_DEFAULT_TTL?: string;
      CACHE_SEARCH_TTL?: string;
      CACHE_STATS_TTL?: string;

      // Pagination
      DEFAULT_PAGE_SIZE?: string;
      MAX_PAGE_SIZE?: string;

      // Features
      FEATURE_EMAIL_NOTIFICATIONS?: string;
      FEATURE_FILE_UPLOAD?: string;
      FEATURE_BULK_OPERATIONS?: string;

      // Helmet
      HELMET_CONTENT_SECURITY_POLICY?: string;
      HELMET_HSTS_MAX_AGE?: string;

      // NPM
      npm_package_version?: string;
    }
  }
}
