import { Request, Response, NextFunction } from 'express';
import { getConfig } from '../config/env';
import { ApiError, AuthenticatedRequest } from '../types';

const config = getConfig();

/**
 * Custom Error Classes
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public timestamp: string;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public field?: string;

  constructor(message: string, field?: string) {
    super(message, 400);
    this.field = field;
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429);
  }
}

interface DatabaseError extends Error {
  code?: string;
  column?: string;
}

interface JoiValidationError extends Error {
  details?: Array<{
    message: string;
    path: string[];
  }>;
}

/**
 * Format error response
 */
const formatErrorResponse = (error: AppError, req: Request): ApiError => {
  const isDevelopment = config.NODE_ENV === 'development';
  
  const errorResponse: ApiError = {
    success: false,
    error: {
      message: error.message,
      type: error.name,
      statusCode: error.statusCode,
      timestamp: error.timestamp || new Date().toISOString(),
    }
  };
  
  // Add field information for validation errors
  if (error instanceof ValidationError && error.field) {
    errorResponse.error.field = error.field;
  }
  
  // Add request information in development
  if (isDevelopment) {
    errorResponse.error.stack = error.stack;
    errorResponse.request = {
      method: req.method,
      url: req.url,
      ip: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || '',
    };
  }
  
  return errorResponse;
};

/**
 * Log error with appropriate level
 */
const logError = (error: AppError, req: Request | AuthenticatedRequest): void => {
  const logData = {
    message: error.message,
    name: error.name,
    statusCode: error.statusCode,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip || 'unknown',
    userAgent: req.get('User-Agent'),
    userId: (req as AuthenticatedRequest).user?.id,
    timestamp: new Date().toISOString(),
  };
  
  // Log level based on error type
  if (error.statusCode >= 500) {
    console.error('🚨 Server Error:', logData);
  } else if (error.statusCode >= 400) {
    console.warn('⚠️ Client Error:', logData);
  } else {
    console.info('ℹ️ Error Info:', logData);
  }
};

/**
 * Handle specific database errors
 */
const handleDatabaseError = (error: DatabaseError): AppError => {
  // PostgreSQL error codes
  switch (error.code) {
    case '23505': // unique_violation
      return new ConflictError('Resource already exists with these values');
    
    case '23503': // foreign_key_violation
      return new ValidationError('Referenced resource does not exist');
    
    case '23502': // not_null_violation
      return new ValidationError(`Required field '${error.column}' is missing`);
    
    case '23514': // check_violation
      return new ValidationError('Data validation failed');
    
    case '42P01': // undefined_table
      return new AppError('Database configuration error', 500);
    
    case '42703': // undefined_column
      return new AppError('Database schema error', 500);
    
    case '28P01': // invalid_password
      return new AppError('Database authentication failed', 500);
    
    case '3D000': // invalid_catalog_name
      return new AppError('Database does not exist', 500);
    
    default:
      return new AppError('Database operation failed', 500);
  }
};

/**
 * Handle JWT errors
 */
const handleJWTError = (error: Error): AppError => {
  switch (error.name) {
    case 'JsonWebTokenError':
      return new AuthenticationError('Invalid token');
    
    case 'TokenExpiredError':
      return new AuthenticationError('Token has expired');
    
    case 'NotBeforeError':
      return new AuthenticationError('Token not active');
    
    default:
      return new AuthenticationError('Token validation failed');
  }
};

/**
 * Handle Joi validation errors
 */
const handleJoiError = (error: JoiValidationError): ValidationError => {
  if (!error.details || error.details.length === 0) {
    return new ValidationError('Validation failed');
  }
  
  const firstDetail = error.details[0];
  if (!firstDetail) {
    return new ValidationError('Validation failed');
  }
  
  const message = firstDetail.message;
  const field = firstDetail.path.join('.');
  return new ValidationError(message, field);
};

/**
 * Main error handler middleware
 */
export const errorHandler = (
  error: any, 
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  let processedError: AppError = error;
  
  // Handle specific error types
  if (error.name === 'ValidationError' && error.details) {
    // Joi validation error
    processedError = handleJoiError(error as JoiValidationError);
  } else if (error.code && error.code.startsWith('23')) {
    // PostgreSQL error
    processedError = handleDatabaseError(error as DatabaseError);
  } else if (error.name && error.name.includes('JsonWebToken')) {
    // JWT error
    processedError = handleJWTError(error);
  } else if (!(error instanceof AppError)) {
    // Generic error - convert to AppError
    processedError = new AppError(
      config.NODE_ENV === 'development' ? error.message : 'Internal server error',
      500,
      false
    );
  }
  
  // Log the error
  logError(processedError, req);
  
  // Send error response
  const errorResponse = formatErrorResponse(processedError, req);
  res.status(processedError.statusCode || 500).json(errorResponse);
};

/**
 * Async error handler wrapper
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Create error with status code
 */
export const createError = (message: string, statusCode: number = 500): AppError => {
  return new AppError(message, statusCode);
};
