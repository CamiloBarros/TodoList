import bcrypt from 'bcryptjs';
import { query, transaction } from '../config/database';
import { 
  User, 
  UserCreation, 
  UserLogin, 
  PublicUser,
  ApiResponse 
} from '../types';
import { generateToken } from '../middleware/auth';
import appConfig from '../config/env';

/**
 * Authentication Service
 * Handles registration, login and user-related operations
 */

/**
 * Registers a new user in the system
 */
export const registerUser = async (
  userData: UserCreation
): Promise<ApiResponse<{ user: PublicUser; token: string }>> => {
  try {
    // Check if email already exists
    const emailExists = await query(
      'SELECT id FROM usuarios WHERE email = $1',
      [userData.email]
    );

    if (emailExists.rows.length > 0) {
      return {
        success: false,
        error: 'Email is already registered',
      };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(
      userData.password,
      appConfig.security.bcryptRounds
    );

    // Create user in a transaction
    const result = await transaction(async (client) => {
      const newUser = await client.query(
        `INSERT INTO usuarios (email, nombre, password_hash, activo) 
         VALUES ($1, $2, $3, true) 
         RETURNING id, email, nombre, creado_en, actualizado_en`,
        [userData.email, userData.name, passwordHash]
      );

      return newUser.rows[0];
    });

    const publicUser: PublicUser = {
      id: result.id,
      email: result.email,
      name: result.nombre,
      created_at: result.creado_en,
      updated_at: result.actualizado_en,
    };

    // Generate JWT token
    const token = generateToken(publicUser);

    return {
      success: true,
      data: {
        user: publicUser,
        token,
      },
      message: 'User registered successfully',
    };
  } catch (error) {
    console.error('Error in user registration:', error);
    return {
      success: false,
      error: 'Internal server error',
    };
  }
};

/**
 * Authenticates an existing user
 */
export const loginUser = async (
  credentials: UserLogin
): Promise<ApiResponse<{ user: PublicUser; token: string }>> => {
  try {
    // Find user by email
    const result = await query(
      'SELECT id, email, nombre, password_hash, creado_en, actualizado_en, activo FROM usuarios WHERE email = $1',
      [credentials.email]
    );

    if (result.rows.length === 0) {
      return {
        success: false,
        error: 'Invalid credentials',
      };
    }

    const user = result.rows[0];

    // Check if user is active
    if (!user.activo) {
      return {
        success: false,
        error: 'Account deactivated',
      };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      credentials.password,
      user.password_hash
    );

    if (!isPasswordValid) {
      return {
        success: false,
        error: 'Invalid credentials',
      };
    }

    // Update last login date
    await query(
      'UPDATE usuarios SET actualizado_en = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    const publicUser: PublicUser = {
      id: user.id,
      email: user.email,
      name: user.nombre,
      created_at: user.creado_en,
      updated_at: user.actualizado_en,
    };

    // Generate JWT token
    const token = generateToken(publicUser);

    return {
      success: true,
      data: {
        user: publicUser,
        token,
      },
      message: 'Login successful',
    };
  } catch (error) {
    console.error('Error in user login:', error);
    return {
      success: false,
      error: 'Internal server error',
    };
  }
};

/**
 * Gets the authenticated user's profile
 */
export const getProfile = async (
  userId: number
): Promise<ApiResponse<PublicUser>> => {
  try {
    const result = await query(
      'SELECT id, email, nombre, creado_en, actualizado_en FROM usuarios WHERE id = $1 AND activo = true',
      [userId]
    );

    if (result.rows.length === 0) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    const user: PublicUser = {
      id: result.rows[0].id,
      email: result.rows[0].email,
      name: result.rows[0].nombre,
      created_at: result.rows[0].creado_en,
      updated_at: result.rows[0].actualizado_en,
    };

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error('Error getting profile:', error);
    return {
      success: false,
      error: 'Internal server error',
    };
  }
};

/**
 * Updates user profile
 */
export const updateProfile = async (
  userId: number,
  data: { name?: string; email?: string }
): Promise<ApiResponse<PublicUser>> => {
  try {
    // Check if new email already exists (if changing)
    if (data.email) {
      const emailExists = await query(
        'SELECT id FROM usuarios WHERE email = $1 AND id != $2',
        [data.email, userId]
      );

      if (emailExists.rows.length > 0) {
        return {
          success: false,
          error: 'Email is already in use',
        };
      }
    }

    // Build update query dynamically
    const fieldsToUpdate: string[] = [];
    const values: any[] = [];
    let counter = 1;

    if (data.name) {
      fieldsToUpdate.push(`nombre = $${counter}`);
      values.push(data.name);
      counter++;
    }

    if (data.email) {
      fieldsToUpdate.push(`email = $${counter}`);
      values.push(data.email);
      counter++;
    }

    if (fieldsToUpdate.length === 0) {
      return {
        success: false,
        error: 'No data to update',
      };
    }

    // Add updated_at and user ID
    fieldsToUpdate.push(`actualizado_en = CURRENT_TIMESTAMP`);
    values.push(userId);

    const queryText = `
      UPDATE usuarios 
      SET ${fieldsToUpdate.join(', ')} 
      WHERE id = $${values.length} AND activo = true
      RETURNING id, email, nombre, creado_en, actualizado_en
    `;

    const result = await query(queryText, values);

    if (result.rows.length === 0) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    const updatedUser: PublicUser = {
      id: result.rows[0].id,
      email: result.rows[0].email,
      name: result.rows[0].nombre,
      created_at: result.rows[0].creado_en,
      updated_at: result.rows[0].actualizado_en,
    };

    return {
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully',
    };
  } catch (error) {
    console.error('Error updating profile:', error);
    return {
      success: false,
      error: 'Internal server error',
    };
  }
};

/**
 * Changes user password
 */
export const changePassword = async (
  userId: number,
  currentPassword: string,
  newPassword: string
): Promise<ApiResponse<void>> => {
  try {
    // Get current password hash
    const result = await query(
      'SELECT password_hash FROM usuarios WHERE id = $1 AND activo = true',
      [userId]
    );

    if (result.rows.length === 0) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      result.rows[0].password_hash
    );

    if (!isPasswordValid) {
      return {
        success: false,
        error: 'Current password is incorrect',
      };
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(
      newPassword,
      appConfig.security.bcryptRounds
    );

    // Update password
    await query(
      'UPDATE usuarios SET password_hash = $1, actualizado_en = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, userId]
    );

    return {
      success: true,
      message: 'Password updated successfully',
    };
  } catch (error) {
    console.error('Error changing password:', error);
    return {
      success: false,
      error: 'Internal server error',
    };
  }
};

/**
 * Deactivates user account
 */
export const deactivateAccount = async (
  userId: number
): Promise<ApiResponse<void>> => {
  try {
    const result = await query(
      'UPDATE usuarios SET activo = false, actualizado_en = CURRENT_TIMESTAMP WHERE id = $1 AND activo = true',
      [userId]
    );

    if (result.rowCount === 0) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    return {
      success: true,
      message: 'Account deactivated successfully',
    };
  } catch (error) {
    console.error('Error deactivating account:', error);
    return {
      success: false,
      error: 'Internal server error',
    };
  }
};
