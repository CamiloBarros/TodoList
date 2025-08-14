import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../config/database';
import { JWTPayload, AuthenticatedRequest, PublicUser } from '../types';
import appConfig from '../config/env';

/**
 * Middleware de autenticación JWT
 * Verifica el token JWT y adjunta la información del User a la request
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Token de acceso requerido',
          type: 'AUTHENTICATION_ERROR',
          statusCode: 401,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    // Verificar el token JWT
    const decoded = jwt.verify(token, appConfig.jwt.secret) as JWTPayload;

    // Verificar que el User existe y está activo
    const result = await query(
      'SELECT id, email, nombre, creado_en, actualizado_en FROM usuarios WHERE id = $1 AND activo = true',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      res.status(401).json({
        success: false,
        error: {
          message: 'User no encontrado o inactivo',
          type: 'AUTHENTICATION_ERROR',
          statusCode: 401,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    // Adjuntar información del User a la request
    const User: PublicUser = {
      id: result.rows[0].id,
      email: result.rows[0].email,
      nombre: result.rows[0].nombre,
      creado_en: result.rows[0].creado_en,
      actualizado_en: result.rows[0].actualizado_en,
    };

    (req as AuthenticatedRequest).user = User;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Token expirado',
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
          message: 'Token inválido',
          type: 'INVALID_TOKEN',
          statusCode: 401,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    console.error('Error en autenticación:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor',
        type: 'INTERNAL_SERVER_ERROR',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Middleware opcional de autenticación
 * No requiere token, pero si está presente lo valida
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

    // Si hay token, validarlo
    const decoded = jwt.verify(token, appConfig.jwt.secret) as JWTPayload;

    const result = await query(
      'SELECT id, email, nombre, creado_en, actualizado_en FROM usuarios WHERE id = $1 AND activo = true',
      [decoded.id]
    );

    if (result.rows.length > 0) {
      const User: PublicUser = {
        id: result.rows[0].id,
        email: result.rows[0].email,
        nombre: result.rows[0].nombre,
        creado_en: result.rows[0].creado_en,
        actualizado_en: result.rows[0].actualizado_en,
      };

      (req as AuthenticatedRequest).user = User;
    }

    next();
  } catch (error) {
    // En autenticación opcional, los errores no detienen la request
    next();
  }
};

/**
 * Genera un token JWT para un User
 */
export const generateToken = (User: PublicUser): string => {
  const payload: JWTPayload = {
    id: User.id,
    email: User.email,
    iss: appConfig.jwt.issuer,
  };

  return jwt.sign(payload, appConfig.jwt.secret, {
    expiresIn: appConfig.jwt.expiresIn,
  } as jwt.SignOptions);
};

/**
 * Verifica si un token es válido sin hacer consulta a la base de datos
 */
export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, appConfig.jwt.secret) as JWTPayload;
  } catch (error) {
    return null;
  }
};
