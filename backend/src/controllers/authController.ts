import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
import * as authService from '../services/authService';

/**
 * Controller de autenticación
 * Maneja todas las rutas relacionadas con autenticación y gestión de usuarios
 */

/**
 * POST /api/auth/registro
 * Registra un nuevo usuario
 */
export const registro = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, password } = req.body;

    const resultado = await authService.registerUser({
      email,
      name,
      password,
    });

    if (resultado.success) {
      res.status(201).json({
        success: true,
        data: resultado.data,
        message: resultado.message,
      });
    } else {
      const statusCode = resultado.error === 'El email ya está registrado' ? 409 : 400;
      res.status(statusCode).json({
        success: false,
        error: {
          message: resultado.error,
          type: 'REGISTRATION_ERROR',
          statusCode,
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error('Error en registro controller:', error);
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
 * POST /api/auth/login
 * Autentica un usuario existente
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const resultado = await authService.loginUser({
      email,
      password,
    });

    if (resultado.success) {
      res.status(200).json({
        success: true,
        data: resultado.data,
        message: resultado.message,
      });
    } else {
      const statusCode = 
        resultado.error === 'Cuenta desactivada' ? 403 : 401;
      
      res.status(statusCode).json({
        success: false,
        error: {
          message: resultado.error,
          type: 'AUTHENTICATION_ERROR',
          statusCode,
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error('Error en login controller:', error);
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
 * GET /api/auth/perfil
 * Obtiene el perfil del usuario autenticado
 */
export const perfil = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const resultado = await authService.getProfile(req.user.id);

    if (resultado.success) {
      res.status(200).json({
        success: true,
        data: resultado.data,
      });
    } else {
      res.status(404).json({
        success: false,
        error: {
          message: resultado.error,
          type: 'USER_NOT_FOUND',
          statusCode: 404,
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error('Error en perfil controller:', error);
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
 * PUT /api/auth/perfil
 * Actualiza el perfil del usuario autenticado
 */
export const actualizarPerfil = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, email } = req.body;

    const resultado = await authService.updateProfile(req.user.id, {
      name,
      email,
    });

    if (resultado.success) {
      res.status(200).json({
        success: true,
        data: resultado.data,
        message: resultado.message,
      });
    } else {
      const statusCode = 
        resultado.error === 'El email ya está en uso' ? 409 : 
        resultado.error === 'Usuario no encontrado' ? 404 : 400;
      
      res.status(statusCode).json({
        success: false,
        error: {
          message: resultado.error,
          type: 'PROFILE_UPDATE_ERROR',
          statusCode,
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error('Error en actualizar perfil controller:', error);
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
 * POST /api/auth/cambiar-password
 * Cambia la contraseña del usuario autenticado
 */
export const cambiarPassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { passwordActual, passwordNueva } = req.body;

    const resultado = await authService.changePassword(
      req.user.id,
      passwordActual,
      passwordNueva
    );

    if (resultado.success) {
      res.status(200).json({
        success: true,
        message: resultado.message,
      });
    } else {
      const statusCode = 
        resultado.error === 'Contraseña actual incorrecta' ? 400 : 
        resultado.error === 'Usuario no encontrado' ? 404 : 400;
      
      res.status(statusCode).json({
        success: false,
        error: {
          message: resultado.error,
          type: 'PASSWORD_CHANGE_ERROR',
          statusCode,
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error('Error en cambiar password controller:', error);
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
 * DELETE /api/auth/cuenta
 * Desactiva la cuenta del usuario autenticado
 */
export const desactivarCuenta = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const resultado = await authService.deactivateAccount(req.user.id);

    if (resultado.success) {
      res.status(200).json({
        success: true,
        message: resultado.message,
      });
    } else {
      res.status(404).json({
        success: false,
        error: {
          message: resultado.error,
          type: 'USER_NOT_FOUND',
          statusCode: 404,
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error('Error en desactivar cuenta controller:', error);
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
 * POST /api/auth/verificar-token
 * Verifica si un token JWT es válido
 */
export const verificarToken = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Si llegamos aquí, el token es válido (pasó por el middleware de autenticación)
    res.status(200).json({
      success: true,
      data: {
        valido: true,
        usuario: req.user,
      },
      message: 'Token válido',
    });
  } catch (error) {
    console.error('Error en verificar token controller:', error);
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
 * POST /api/auth/logout
 * Cierra sesión del usuario (principalmente para el frontend)
 */
export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // En JWT, el logout se maneja en el cliente eliminando el token
    // Aquí podríamos agregar el token a una blacklist en Redis si fuera necesario
    res.status(200).json({
      success: true,
      message: 'Logout exitoso',
    });
  } catch (error) {
    console.error('Error en logout controller:', error);
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
