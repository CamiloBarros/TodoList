import { query, transaction } from '../config/database';
import { 
  Categoria, 
  CategoriaCreacion,
  ApiResponse 
} from '../types';

/**
 * Servicio de Categorías
 * Maneja todas las operaciones CRUD para las categorías de usuario
 */

/**
 * Obtiene todas las categorías del usuario
 */
export const obtenerCategorias = async (
  usuarioId: number
): Promise<ApiResponse<Categoria[]>> => {
  try {
    const resultado = await query(
      `SELECT id, usuario_id, nombre, descripcion, color, creado_en, actualizado_en 
       FROM categorias 
       WHERE usuario_id = $1 
       ORDER BY nombre ASC`,
      [usuarioId]
    );

    const categorias: Categoria[] = resultado.rows.map(row => ({
      id: row.id,
      usuario_id: row.usuario_id,
      nombre: row.nombre,
      descripcion: row.descripcion,
      color: row.color,
      creado_en: row.creado_en,
      actualizado_en: row.actualizado_en,
    }));

    return {
      success: true,
      data: categorias,
    };
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    return {
      success: false,
      error: 'Error interno del servidor',
    };
  }
};

/**
 * Obtiene una categoría específica por ID
 */
export const obtenerCategoriaPorId = async (
  categoriaId: number,
  usuarioId: number
): Promise<ApiResponse<Categoria>> => {
  try {
    const resultado = await query(
      `SELECT id, usuario_id, nombre, descripcion, color, creado_en, actualizado_en 
       FROM categorias 
       WHERE id = $1 AND usuario_id = $2`,
      [categoriaId, usuarioId]
    );

    if (resultado.rows.length === 0) {
      return {
        success: false,
        error: 'Categoría no encontrada',
      };
    }

    const categoria: Categoria = resultado.rows[0];

    return {
      success: true,
      data: categoria,
    };
  } catch (error) {
    console.error('Error obteniendo categoría por ID:', error);
    return {
      success: false,
      error: 'Error interno del servidor',
    };
  }
};

/**
 * Crea una nueva categoría
 */
export const crearCategoria = async (
  usuarioId: number,
  datosCategoria: CategoriaCreacion
): Promise<ApiResponse<Categoria>> => {
  try {
    // Verificar si ya existe una categoría con el mismo nombre para este usuario
    const categoriaExiste = await query(
      'SELECT id FROM categorias WHERE nombre = $1 AND usuario_id = $2',
      [datosCategoria.nombre, usuarioId]
    );

    if (categoriaExiste.rows.length > 0) {
      return {
        success: false,
        error: 'Ya existe una categoría con ese nombre',
      };
    }

    // Generar color aleatorio si no se proporciona
    const color = datosCategoria.color || generateRandomColor();

    const resultado = await query(
      `INSERT INTO categorias (usuario_id, nombre, descripcion, color) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, usuario_id, nombre, descripcion, color, creado_en, actualizado_en`,
      [
        usuarioId,
        datosCategoria.nombre,
        datosCategoria.descripcion || null,
        color
      ]
    );

    const nuevaCategoria: Categoria = resultado.rows[0];

    return {
      success: true,
      data: nuevaCategoria,
      message: 'Categoría creada exitosamente',
    };
  } catch (error) {
    console.error('Error creando categoría:', error);
    return {
      success: false,
      error: 'Error interno del servidor',
    };
  }
};

/**
 * Actualiza una categoría existente
 */
export const actualizarCategoria = async (
  categoriaId: number,
  usuarioId: number,
  datosActualizacion: Partial<CategoriaCreacion>
): Promise<ApiResponse<Categoria>> => {
  try {
    // Verificar que la categoría existe y pertenece al usuario
    const categoriaExiste = await query(
      'SELECT id FROM categorias WHERE id = $1 AND usuario_id = $2',
      [categoriaId, usuarioId]
    );

    if (categoriaExiste.rows.length === 0) {
      return {
        success: false,
        error: 'Categoría no encontrada',
      };
    }

    // Verificar si el nuevo nombre ya existe (si se está cambiando)
    if (datosActualizacion.nombre) {
      const nombreExiste = await query(
        'SELECT id FROM categorias WHERE nombre = $1 AND usuario_id = $2 AND id != $3',
        [datosActualizacion.nombre, usuarioId, categoriaId]
      );

      if (nombreExiste.rows.length > 0) {
        return {
          success: false,
          error: 'Ya existe una categoría con ese nombre',
        };
      }
    }

    // Construir query de actualización dinámicamente
    const camposActualizar: string[] = [];
    const valores: any[] = [];
    let contador = 1;

    if (datosActualizacion.nombre !== undefined) {
      camposActualizar.push(`nombre = $${contador}`);
      valores.push(datosActualizacion.nombre);
      contador++;
    }

    if (datosActualizacion.descripcion !== undefined) {
      camposActualizar.push(`descripcion = $${contador}`);
      valores.push(datosActualizacion.descripcion);
      contador++;
    }

    if (datosActualizacion.color !== undefined) {
      camposActualizar.push(`color = $${contador}`);
      valores.push(datosActualizacion.color);
      contador++;
    }

    if (camposActualizar.length === 0) {
      return {
        success: false,
        error: 'No hay datos para actualizar',
      };
    }

    // Agregar actualizado_en y IDs
    camposActualizar.push(`actualizado_en = CURRENT_TIMESTAMP`);
    valores.push(categoriaId, usuarioId);

    const queryText = `
      UPDATE categorias 
      SET ${camposActualizar.join(', ')} 
      WHERE id = $${valores.length - 1} AND usuario_id = $${valores.length}
      RETURNING id, usuario_id, nombre, descripcion, color, creado_en, actualizado_en
    `;

    const resultado = await query(queryText, valores);

    const categoriaActualizada: Categoria = resultado.rows[0];

    return {
      success: true,
      data: categoriaActualizada,
      message: 'Categoría actualizada exitosamente',
    };
  } catch (error) {
    console.error('Error actualizando categoría:', error);
    return {
      success: false,
      error: 'Error interno del servidor',
    };
  }
};

/**
 * Elimina una categoría
 */
export const eliminarCategoria = async (
  categoriaId: number,
  usuarioId: number
): Promise<ApiResponse<void>> => {
  try {
    // Verificar si hay tareas asociadas a esta categoría
    const tareasAsociadas = await query(
      'SELECT COUNT(*) as count FROM tareas WHERE categoria_id = $1 AND usuario_id = $2',
      [categoriaId, usuarioId]
    );

    const cantidadTareas = parseInt(tareasAsociadas.rows[0].count);

    if (cantidadTareas > 0) {
      return {
        success: false,
        error: `No se puede eliminar la categoría porque tiene ${cantidadTareas} tarea(s) asociada(s)`,
      };
    }

    const resultado = await query(
      'DELETE FROM categorias WHERE id = $1 AND usuario_id = $2',
      [categoriaId, usuarioId]
    );

    if (resultado.rowCount === 0) {
      return {
        success: false,
        error: 'Categoría no encontrada',
      };
    }

    return {
      success: true,
      message: 'Categoría eliminada exitosamente',
    };
  } catch (error) {
    console.error('Error eliminando categoría:', error);
    return {
      success: false,
      error: 'Error interno del servidor',
    };
  }
};

/**
 * Elimina una categoría y mueve las tareas asociadas a "sin categoría"
 */
export const eliminarCategoriaConTareas = async (
  categoriaId: number,
  usuarioId: number
): Promise<ApiResponse<void>> => {
  try {
    const resultado = await transaction(async (client) => {
      // Verificar que la categoría existe
      const categoriaExiste = await client.query(
        'SELECT id FROM categorias WHERE id = $1 AND usuario_id = $2',
        [categoriaId, usuarioId]
      );

      if (categoriaExiste.rows.length === 0) {
        throw new Error('Categoría no encontrada');
      }

      // Mover todas las tareas de esta categoría a "sin categoría" (categoria_id = null)
      await client.query(
        'UPDATE tareas SET categoria_id = NULL, actualizado_en = CURRENT_TIMESTAMP WHERE categoria_id = $1 AND usuario_id = $2',
        [categoriaId, usuarioId]
      );

      // Eliminar la categoría
      const deleteResult = await client.query(
        'DELETE FROM categorias WHERE id = $1 AND usuario_id = $2',
        [categoriaId, usuarioId]
      );

      return deleteResult.rowCount;
    });

    if (resultado === 0) {
      return {
        success: false,
        error: 'Categoría no encontrada',
      };
    }

    return {
      success: true,
      message: 'Categoría eliminada y tareas asociadas movidas a "sin categoría"',
    };
  } catch (error) {
    console.error('Error eliminando categoría con tareas:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor',
    };
  }
};

/**
 * Obtiene estadísticas de una categoría (número de tareas)
 */
export const obtenerEstadisticasCategoria = async (
  categoriaId: number,
  usuarioId: number
): Promise<ApiResponse<{ totalTareas: number; tareasCompletadas: number; tareasPendientes: number }>> => {
  try {
    const resultado = await query(
      `SELECT 
         COUNT(*) as total_tareas,
         COUNT(CASE WHEN completada = true THEN 1 END) as tareas_completadas,
         COUNT(CASE WHEN completada = false THEN 1 END) as tareas_pendientes
       FROM tareas 
       WHERE categoria_id = $1 AND usuario_id = $2`,
      [categoriaId, usuarioId]
    );

    const stats = resultado.rows[0];

    return {
      success: true,
      data: {
        totalTareas: parseInt(stats.total_tareas),
        tareasCompletadas: parseInt(stats.tareas_completadas),
        tareasPendientes: parseInt(stats.tareas_pendientes),
      },
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas de categoría:', error);
    return {
      success: false,
      error: 'Error interno del servidor',
    };
  }
};

/**
 * Genera un color hexadecimal aleatorio
 */
const generateRandomColor = (): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
    '#10AC84', '#EE5A24', '#0984E3', '#6C5CE7', '#A29BFE',
    '#FD79A8', '#E17055', '#00B894', '#00CEC9', '#6C5CE7'
  ];
  
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex] || '#4ECDC4'; // Fallback color
};
