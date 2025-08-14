import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
import * as authService from '../services/authService';

/**
 * Authentication controller
 * Handles all routes related to authentication and user management
 */

/**
 * POST /api/auth/register
 * Register a new user
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, password } = req.body;

    const result = await authService.registerUser({
      email,
      name,
      password,
    });

    if (result.success) {
      res.status(201).json({
        success: true,
        data: result.data,
        message: result.message,
      });
    } else {
      const statusCode =
        result.error === 'Email is already registered' ? 409 : 400;
      res.status(statusCode).json({
        success: false,
        error: {
          message: result.error,
          type: 'REGISTRATION_ERROR',
          statusCode,
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error('Error in register controller:', error);
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
 * POST /api/auth/login
 * Authenticate an existing user
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const result = await authService.loginUser({
      email,
      password,
    });

    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.data,
        message: result.message,
      });
    } else {
      const statusCode = result.error === 'Account deactivated' ? 403 : 401;

      res.status(statusCode).json({
        success: false,
        error: {
          message: result.error,
          type: 'AUTHENTICATION_ERROR',
          statusCode,
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error('Error in login controller:', error);
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
 * GET /api/auth/profile
 * Get authenticated user profile
 */
export const profile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const result = await authService.getProfile(req.user.id);

    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.data,
      });
    } else {
      res.status(404).json({
        success: false,
        error: {
          message: result.error,
          type: 'USER_NOT_FOUND',
          statusCode: 404,
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error('Error in profile controller:', error);
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
 * PUT /api/auth/profile
 * Update authenticated user profile
 */
export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, email } = req.body;

    const result = await authService.updateProfile(req.user.id, {
      name,
      email,
    });

    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.data,
        message: result.message,
      });
    } else {
      const statusCode =
        result.error === 'Email is already in use'
          ? 409
          : result.error === 'User not found'
            ? 404
            : 400;

      res.status(statusCode).json({
        success: false,
        error: {
          message: result.error,
          type: 'PROFILE_UPDATE_ERROR',
          statusCode,
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error('Error in update profile controller:', error);
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
 * POST /api/auth/change-password
 * Change authenticated user password
 */
export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    const result = await authService.changePassword(
      req.user.id,
      currentPassword,
      newPassword
    );

    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } else {
      const statusCode =
        result.error === 'Current password is incorrect'
          ? 400
          : result.error === 'User not found'
            ? 404
            : 400;

      res.status(statusCode).json({
        success: false,
        error: {
          message: result.error,
          type: 'PASSWORD_CHANGE_ERROR',
          statusCode,
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error('Error in change password controller:', error);
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
 * DELETE /api/auth/account
 * Deactivate authenticated user account
 */
export const deactivateAccount = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const result = await authService.deactivateAccount(req.user.id);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } else {
      res.status(404).json({
        success: false,
        error: {
          message: result.error,
          type: 'USER_NOT_FOUND',
          statusCode: 404,
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error('Error in deactivate account controller:', error);
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
 * POST /api/auth/verify-token
 * Verify if a JWT token is valid
 */
export const verifyToken = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // If we get here, the token is valid (passed through authentication middleware)
    res.status(200).json({
      success: true,
      data: {
        valid: true,
        user: req.user,
      },
      message: 'Valid token',
    });
  } catch (error) {
    console.error('Error in verify token controller:', error);
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
 * POST /api/auth/logout
 * Log out user (mainly for frontend)
 */
export const logout = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // In JWT, logout is handled on the client by removing the token
    // Here we could add the token to a blacklist in Redis if necessary
    res.status(200).json({
      success: true,
      message: 'Successful logout',
    });
  } catch (error) {
    console.error('Error in logout controller:', error);
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
