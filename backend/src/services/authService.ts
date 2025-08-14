import bcrypt from 'bcryptjs';
import { query, transaction } from '../config/database';
import { 
  Usuario, 
  UsuarioCreacion, 
  UsuarioLogin, 
  UsuarioPublico,
  ApiResponse 
} from '../types';
import { generateToken } from '../middleware/auth';
import appConfig from '../config/env';

/**
 * Servicio de autenticación
 * Maneja registro, login y operaciones relacionadas con usuarios
 */

/**
 * Registra un nuevo usuario en el sistema
 */
export const registrarUsuario = async (
  datosUsuario: UsuarioCreacion
): Promise<ApiResponse<{ usuario: UsuarioPublico; token: string }>> => {
  try {
    // Verificar si el email ya existe
    const emailExiste = await query(
      'SELECT id FROM usuarios WHERE email = $1',
      [datosUsuario.email]
    );

    if (emailExiste.rows.length > 0) {
      return {
        success: false,
        error: 'El email ya está registrado',
      };
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(
      datosUsuario.password,
      appConfig.security.bcryptRounds
    );

    // Crear usuario en una transacción
    const resultado = await transaction(async (client) => {
      const nuevoUsuario = await client.query(
        `INSERT INTO usuarios (email, nombre, password_hash, activo) 
         VALUES ($1, $2, $3, true) 
         RETURNING id, email, nombre, creado_en, actualizado_en`,
        [datosUsuario.email, datosUsuario.nombre, passwordHash]
      );

      return nuevoUsuario.rows[0];
    });

    const usuarioPublico: UsuarioPublico = {
      id: resultado.id,
      email: resultado.email,
      nombre: resultado.nombre,
      creado_en: resultado.creado_en,
      actualizado_en: resultado.actualizado_en,
    };

    // Generar token JWT
    const token = generateToken(usuarioPublico);

    return {
      success: true,
      data: {
        usuario: usuarioPublico,
        token,
      },
      message: 'Usuario registrado exitosamente',
    };
  } catch (error) {
    console.error('Error en registro de usuario:', error);
    return {
      success: false,
      error: 'Error interno del servidor',
    };
  }
};

/**
 * Autentica un usuario existente
 */
export const loginUsuario = async (
  credenciales: UsuarioLogin
): Promise<ApiResponse<{ usuario: UsuarioPublico; token: string }>> => {
  try {
    // Buscar usuario por email
    const resultado = await query(
      'SELECT id, email, nombre, password_hash, creado_en, actualizado_en, activo FROM usuarios WHERE email = $1',
      [credenciales.email]
    );

    if (resultado.rows.length === 0) {
      return {
        success: false,
        error: 'Credenciales inválidas',
      };
    }

    const usuario = resultado.rows[0];

    // Verificar si el usuario está activo
    if (!usuario.activo) {
      return {
        success: false,
        error: 'Cuenta desactivada',
      };
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(
      credenciales.password,
      usuario.password_hash
    );

    if (!passwordValida) {
      return {
        success: false,
        error: 'Credenciales inválidas',
      };
    }

    // Actualizar última fecha de login
    await query(
      'UPDATE usuarios SET actualizado_en = CURRENT_TIMESTAMP WHERE id = $1',
      [usuario.id]
    );

    const usuarioPublico: UsuarioPublico = {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      creado_en: usuario.creado_en,
      actualizado_en: usuario.actualizado_en,
    };

    // Generar token JWT
    const token = generateToken(usuarioPublico);

    return {
      success: true,
      data: {
        usuario: usuarioPublico,
        token,
      },
      message: 'Login exitoso',
    };
  } catch (error) {
    console.error('Error en login de usuario:', error);
    return {
      success: false,
      error: 'Error interno del servidor',
    };
  }
};

/**
 * Obtiene el perfil del usuario autenticado
 */
export const obtenerPerfil = async (
  usuarioId: number
): Promise<ApiResponse<UsuarioPublico>> => {
  try {
    const resultado = await query(
      'SELECT id, email, nombre, creado_en, actualizado_en FROM usuarios WHERE id = $1 AND activo = true',
      [usuarioId]
    );

    if (resultado.rows.length === 0) {
      return {
        success: false,
        error: 'Usuario no encontrado',
      };
    }

    const usuario: UsuarioPublico = resultado.rows[0];

    return {
      success: true,
      data: usuario,
    };
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    return {
      success: false,
      error: 'Error interno del servidor',
    };
  }
};

/**
 * Actualiza el perfil del usuario
 */
export const actualizarPerfil = async (
  usuarioId: number,
  datos: { nombre?: string; email?: string }
): Promise<ApiResponse<UsuarioPublico>> => {
  try {
    // Verificar si el nuevo email ya existe (si se está cambiando)
    if (datos.email) {
      const emailExiste = await query(
        'SELECT id FROM usuarios WHERE email = $1 AND id != $2',
        [datos.email, usuarioId]
      );

      if (emailExiste.rows.length > 0) {
        return {
          success: false,
          error: 'El email ya está en uso',
        };
      }
    }

    // Construir query de actualización dinámicamente
    const camposActualizar: string[] = [];
    const valores: any[] = [];
    let contador = 1;

    if (datos.nombre) {
      camposActualizar.push(`nombre = $${contador}`);
      valores.push(datos.nombre);
      contador++;
    }

    if (datos.email) {
      camposActualizar.push(`email = $${contador}`);
      valores.push(datos.email);
      contador++;
    }

    if (camposActualizar.length === 0) {
      return {
        success: false,
        error: 'No hay datos para actualizar',
      };
    }

    // Agregar actualizado_en y usuario ID
    camposActualizar.push(`actualizado_en = CURRENT_TIMESTAMP`);
    valores.push(usuarioId);

    const queryText = `
      UPDATE usuarios 
      SET ${camposActualizar.join(', ')} 
      WHERE id = $${valores.length} AND activo = true
      RETURNING id, email, nombre, creado_en, actualizado_en
    `;

    const resultado = await query(queryText, valores);

    if (resultado.rows.length === 0) {
      return {
        success: false,
        error: 'Usuario no encontrado',
      };
    }

    const usuarioActualizado: UsuarioPublico = resultado.rows[0];

    return {
      success: true,
      data: usuarioActualizado,
      message: 'Perfil actualizado exitosamente',
    };
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    return {
      success: false,
      error: 'Error interno del servidor',
    };
  }
};

/**
 * Cambia la contraseña del usuario
 */
export const cambiarPassword = async (
  usuarioId: number,
  passwordActual: string,
  passwordNueva: string
): Promise<ApiResponse<void>> => {
  try {
    // Obtener hash actual de la contraseña
    const resultado = await query(
      'SELECT password_hash FROM usuarios WHERE id = $1 AND activo = true',
      [usuarioId]
    );

    if (resultado.rows.length === 0) {
      return {
        success: false,
        error: 'Usuario no encontrado',
      };
    }

    // Verificar contraseña actual
    const passwordValida = await bcrypt.compare(
      passwordActual,
      resultado.rows[0].password_hash
    );

    if (!passwordValida) {
      return {
        success: false,
        error: 'Contraseña actual incorrecta',
      };
    }

    // Hash de la nueva contraseña
    const nuevoPasswordHash = await bcrypt.hash(
      passwordNueva,
      appConfig.security.bcryptRounds
    );

    // Actualizar contraseña
    await query(
      'UPDATE usuarios SET password_hash = $1, actualizado_en = CURRENT_TIMESTAMP WHERE id = $2',
      [nuevoPasswordHash, usuarioId]
    );

    return {
      success: true,
      message: 'Contraseña actualizada exitosamente',
    };
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    return {
      success: false,
      error: 'Error interno del servidor',
    };
  }
};

/**
 * Desactiva la cuenta del usuario
 */
export const desactivarCuenta = async (
  usuarioId: number
): Promise<ApiResponse<void>> => {
  try {
    const resultado = await query(
      'UPDATE usuarios SET activo = false, actualizado_en = CURRENT_TIMESTAMP WHERE id = $1 AND activo = true',
      [usuarioId]
    );

    if (resultado.rowCount === 0) {
      return {
        success: false,
        error: 'Usuario no encontrado',
      };
    }

    return {
      success: true,
      message: 'Cuenta desactivada exitosamente',
    };
  } catch (error) {
    console.error('Error al desactivar cuenta:', error);
    return {
      success: false,
      error: 'Error interno del servidor',
    };
  }
};
