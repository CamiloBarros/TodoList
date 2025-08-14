import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../config/database';
import { JWTPayload, AuthenticatedRequest, PublicUser } from '../types';
import appConfig from '../config/env';

/**
 * JWT authentication middleware
 * Verifies JWT token and attaches user information to the request
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Access token required',
          type: 'AUTHENTICATION_ERROR',
          statusCode: 401,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, appConfig.jwt.secret) as JWTPayload;

    // Verify that user exists and is active
    const result = await query(
      'SELECT id, email, name, created_at, updated_at FROM users WHERE id = $1 AND active = true',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      res.status(401).json({
        success: false,
        error: {
          message: 'User not found or inactive',
          type: 'AUTHENTICATION_ERROR',
          statusCode: 401,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    // Attach user information to the request
    const user: PublicUser = {
      id: result.rows[0].id,
      email: result.rows[0].email,
      name: result.rows[0].name,
      created_at: result.rows[0].created_at,
      updated_at: result.rows[0].updated_at,
    };

    (req as AuthenticatedRequest).user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Token expired',
          type: 'TOKEN_EXPIRED',
          statusCode: 401,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Invalid token',
          type: 'INVALID_TOKEN',
          statusCode: 401,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    console.error('Error in authentication:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        type: 'INTERNAL_SERVER_ERROR',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Optional authentication middleware
 * Does not require token, but validates it if present
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      next();
      return;
    }

    // If there's a token, validate it
    const decoded = jwt.verify(token, appConfig.jwt.secret) as JWTPayload;

    const result = await query(
      'SELECT id, email, name, created_at, updated_at FROM users WHERE id = $1 AND active = true',
      [decoded.id]
    );

    if (result.rows.length > 0) {
      const user: PublicUser = {
        id: result.rows[0].id,
        email: result.rows[0].email,
        name: result.rows[0].name,
        created_at: result.rows[0].created_at,
        updated_at: result.rows[0].updated_at,
      };

      (req as AuthenticatedRequest).user = user;
    }

    next();
  } catch (error) {
    // In optional authentication, errors don't stop the request
    next();
  }
};

/**
 * Generates a JWT token for a user
 */
export const generateToken = (user: PublicUser): string => {
  const payload: JWTPayload = {
    id: user.id,
    email: user.email,
    iss: appConfig.jwt.issuer,
  };

  return jwt.sign(payload, appConfig.jwt.secret, {
    expiresIn: appConfig.jwt.expiresIn,
  } as jwt.SignOptions);
};

/**
 * Verifies if a token is valid without making a database query
 */
export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, appConfig.jwt.secret) as JWTPayload;
  } catch (error) {
    return null;
  }
};
