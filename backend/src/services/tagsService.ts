import { pool } from '../config/database';
import { 
  Tag, 
  CreateTagDTO, 
  UpdateTagDTO,
  EstadisticasEtiqueta,
  ErrorCode,
  DatabaseError 
} from '../types';

/**
 * Genera un color aleatorio para la Tag si no se proporciona
 */
const generarColorAleatorio = (): string => {
  const colores = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
    '#F8B500', '#5D4E75', '#8395A7', '#00CED1', '#FF7675',
    '#74B9FF', '#81ECEC', '#00B894', '#E17055', '#FDCB6E'
  ];
  return colores[Math.floor(Math.random() * colores.length)] as string;
};

/**
 * Obtener todas las etiquetas del User
 */
export const obtenerEtiquetas = async (usuarioId: number): Promise<Tag[]> => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      SELECT 
        e.id,
        e.nombre,
        e.color,
        e.creado_en,
        e.actualizado_en,
        COUNT(DISTINCT te.tarea_id) as uso_count
      FROM etiquetas e
      LEFT JOIN tarea_etiquetas te ON e.id = te.etiqueta_id
      WHERE e.usuario_id = $1
      GROUP BY e.id, e.nombre, e.color, e.creado_en, e.actualizado_en
      ORDER BY e.nombre ASC
    `, [usuarioId]);

    return result.rows.map(row => ({
      id: row.id,
      nombre: row.nombre,
      color: row.color,
      usuario_id: usuarioId,
      creado_en: row.creado_en,
      actualizado_en: row.actualizado_en,
      uso_count: parseInt(row.uso_count) || 0
    }));
  } catch (error: any) {
    throw new DatabaseError(
      'Error al obtener etiquetas',
      ErrorCode.DATABASE_ERROR,
      error.message
    );
  } finally {
    client.release();
  }
};

/**
 * Obtener una Tag específica por ID
 */
export const obtenerEtiquetaPorId = async (
  etiquetaId: number, 
  usuarioId: number
): Promise<Tag | null> => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      SELECT 
        e.id,
        e.nombre,
        e.color,
        e.creado_en,
        e.actualizado_en,
        COUNT(DISTINCT te.tarea_id) as uso_count
      FROM etiquetas e
      LEFT JOIN tarea_etiquetas te ON e.id = te.etiqueta_id
      WHERE e.id = $1 AND e.usuario_id = $2
      GROUP BY e.id, e.nombre, e.color, e.creado_en, e.actualizado_en
    `, [etiquetaId, usuarioId]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      nombre: row.nombre,
      color: row.color,
      usuario_id: usuarioId,
      creado_en: row.creado_en,
      actualizado_en: row.actualizado_en,
      uso_count: parseInt(row.uso_count) || 0
    };
  } catch (error: any) {
    throw new DatabaseError(
      'Error al obtener Tag',
      ErrorCode.DATABASE_ERROR,
      error.message
    );
  } finally {
    client.release();
  }
};

/**
 * Verificar si una Tag con el mismo nombre ya existe para el User
 */
export const existeEtiquetaConNombre = async (
  nombre: string, 
  usuarioId: number, 
  excluirId?: number
): Promise<boolean> => {
  const client = await pool.connect();
  
  try {
    let query = `
      SELECT id FROM etiquetas 
      WHERE LOWER(nombre) = LOWER($1) AND usuario_id = $2
    `;
    const params: any[] = [nombre.trim(), usuarioId];

    if (excluirId) {
      query += ' AND id != $3';
      params.push(excluirId);
    }

    const result = await client.query(query, params);
    return result.rows.length > 0;
  } catch (error: any) {
    throw new DatabaseError(
      'Error al verificar existencia de Tag',
      ErrorCode.DATABASE_ERROR,
      error.message
    );
  } finally {
    client.release();
  }
};

/**
 * Crear una nueva Tag
 */
export const crearEtiqueta = async (
  etiquetaData: CreateTagDTO, 
  usuarioId: number
): Promise<Tag> => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Verificar que no exista una Tag con el mismo nombre
    const existeNombre = await existeEtiquetaConNombre(etiquetaData.nombre, usuarioId);
    if (existeNombre) {
      throw new DatabaseError(
        'Ya existe una Tag con ese nombre',
        ErrorCode.VALIDATION_ERROR,
        `La Tag "${etiquetaData.nombre}" ya existe`
      );
    }

    // Generar color si no se proporciona
    const color = etiquetaData.color || generarColorAleatorio();

    // Crear la Tag
    const result = await client.query(`
      INSERT INTO etiquetas (nombre, color, usuario_id)
      VALUES ($1, $2, $3)
      RETURNING id, nombre, color, creado_en, actualizado_en
    `, [etiquetaData.nombre.trim(), color, usuarioId]);

    await client.query('COMMIT');

    const nuevaEtiqueta = result.rows[0];
    return {
      id: nuevaEtiqueta.id,
      nombre: nuevaEtiqueta.nombre,
      color: nuevaEtiqueta.color,
      usuario_id: usuarioId,
      creado_en: nuevaEtiqueta.creado_en,
      actualizado_en: nuevaEtiqueta.actualizado_en,
      uso_count: 0
    };
  } catch (error: any) {
    await client.query('ROLLBACK');
    
    if (error instanceof DatabaseError) {
      throw error;
    }
    
    throw new DatabaseError(
      'Error al crear Tag',
      ErrorCode.DATABASE_ERROR,
      error.message
    );
  } finally {
    client.release();
  }
};

/**
 * Actualizar una Tag existente
 */
export const actualizarEtiqueta = async (
  etiquetaId: number,
  etiquetaData: UpdateTagDTO,
  usuarioId: number
): Promise<Tag | null> => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Verificar que la Tag existe y pertenece al User
    const etiquetaExistente = await obtenerEtiquetaPorId(etiquetaId, usuarioId);
    if (!etiquetaExistente) {
      return null;
    }

    // Verificar nombre único si se está actualizando
    if (etiquetaData.nombre) {
      const existeNombre = await existeEtiquetaConNombre(
        etiquetaData.nombre, 
        usuarioId, 
        etiquetaId
      );
      if (existeNombre) {
        throw new DatabaseError(
          'Ya existe una Tag con ese nombre',
          ErrorCode.VALIDATION_ERROR,
          `La Tag "${etiquetaData.nombre}" ya existe`
        );
      }
    }

    // Construir query de actualización dinámicamente
    const camposActualizar: string[] = [];
    const valores: any[] = [];
    let contadorParametros = 1;

    if (etiquetaData.nombre !== undefined) {
      camposActualizar.push(`nombre = $${contadorParametros}`);
      valores.push(etiquetaData.nombre.trim());
      contadorParametros++;
    }

    if (etiquetaData.color !== undefined) {
      camposActualizar.push(`color = $${contadorParametros}`);
      valores.push(etiquetaData.color);
      contadorParametros++;
    }

    if (camposActualizar.length === 0) {
      // No hay campos para actualizar, devolver la Tag existente
      await client.query('COMMIT');
      return etiquetaExistente;
    }

    camposActualizar.push(`actualizado_en = NOW()`);
    valores.push(etiquetaId, usuarioId);

    const query = `
      UPDATE etiquetas 
      SET ${camposActualizar.join(', ')}
      WHERE id = $${contadorParametros} AND usuario_id = $${contadorParametros + 1}
      RETURNING id, nombre, color, creado_en, actualizado_en
    `;

    const result = await client.query(query, valores);

    if (result.rows.length === 0) {
      return null;
    }

    await client.query('COMMIT');

    const etiquetaActualizada = result.rows[0];
    return {
      id: etiquetaActualizada.id,
      nombre: etiquetaActualizada.nombre,
      color: etiquetaActualizada.color,
      usuario_id: usuarioId,
      creado_en: etiquetaActualizada.creado_en,
      actualizado_en: etiquetaActualizada.actualizado_en,
      uso_count: etiquetaExistente.uso_count || 0
    };
  } catch (error: any) {
    await client.query('ROLLBACK');
    
    if (error instanceof DatabaseError) {
      throw error;
    }
    
    throw new DatabaseError(
      'Error al actualizar Tag',
      ErrorCode.DATABASE_ERROR,
      error.message
    );
  } finally {
    client.release();
  }
};

/**
 * Verificar si una Tag tiene tareas asociadas
 */
export const tieneEtiquetaTareasAsociadas = async (
  etiquetaId: number, 
  usuarioId: number
): Promise<boolean> => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      SELECT COUNT(*) as count
      FROM tarea_etiquetas te
      INNER JOIN tareas t ON te.tarea_id = t.id
      WHERE te.etiqueta_id = $1 AND t.usuario_id = $2
    `, [etiquetaId, usuarioId]);

    return parseInt(result.rows[0].count) > 0;
  } catch (error: any) {
    throw new DatabaseError(
      'Error al verificar asociaciones de Tag',
      ErrorCode.DATABASE_ERROR,
      error.message
    );
  } finally {
    client.release();
  }
};

/**
 * Eliminar una Tag (solo si no tiene tareas asociadas)
 */
export const eliminarEtiqueta = async (
  etiquetaId: number, 
  usuarioId: number
): Promise<{ eliminada: boolean; mensaje: string }> => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Verificar que la Tag existe y pertenece al User
    const etiquetaExistente = await obtenerEtiquetaPorId(etiquetaId, usuarioId);
    if (!etiquetaExistente) {
      return {
        eliminada: false,
        mensaje: 'Tag no encontrada'
      };
    }

    // Verificar si tiene tareas asociadas
    const tieneAsociaciones = await tieneEtiquetaTareasAsociadas(etiquetaId, usuarioId);
    if (tieneAsociaciones) {
      return {
        eliminada: false,
        mensaje: 'No se puede eliminar la Tag porque tiene tareas asociadas. Use la eliminación forzada si desea continuar.'
      };
    }

    // Eliminar la Tag
    await client.query(`
      DELETE FROM etiquetas 
      WHERE id = $1 AND usuario_id = $2
    `, [etiquetaId, usuarioId]);

    await client.query('COMMIT');

    return {
      eliminada: true,
      mensaje: 'Tag eliminada exitosamente'
    };
  } catch (error: any) {
    await client.query('ROLLBACK');
    
    throw new DatabaseError(
      'Error al eliminar Tag',
      ErrorCode.DATABASE_ERROR,
      error.message
    );
  } finally {
    client.release();
  }
};

/**
 * Eliminar una Tag forzadamente (eliminando también sus asociaciones)
 */
export const eliminarEtiquetaForzar = async (
  etiquetaId: number, 
  usuarioId: number
): Promise<{ eliminada: boolean; mensaje: string; tareasAfectadas?: number }> => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Verificar que la Tag existe y pertenece al User
    const etiquetaExistente = await obtenerEtiquetaPorId(etiquetaId, usuarioId);
    if (!etiquetaExistente) {
      return {
        eliminada: false,
        mensaje: 'Tag no encontrada'
      };
    }

    // Contar tareas afectadas antes de eliminar
    const conteoResult = await client.query(`
      SELECT COUNT(DISTINCT te.tarea_id) as count
      FROM tarea_etiquetas te
      INNER JOIN tareas t ON te.tarea_id = t.id
      WHERE te.etiqueta_id = $1 AND t.usuario_id = $2
    `, [etiquetaId, usuarioId]);

    const tareasAfectadas = parseInt(conteoResult.rows[0].count);

    // Eliminar asociaciones con tareas
    await client.query(`
      DELETE FROM tarea_etiquetas 
      WHERE etiqueta_id = $1 AND tarea_id IN (
        SELECT id FROM tareas WHERE usuario_id = $2
      )
    `, [etiquetaId, usuarioId]);

    // Eliminar la Tag
    await client.query(`
      DELETE FROM etiquetas 
      WHERE id = $1 AND usuario_id = $2
    `, [etiquetaId, usuarioId]);

    await client.query('COMMIT');

    return {
      eliminada: true,
      mensaje: `Tag eliminada exitosamente. Se removió de ${tareasAfectadas} Task(s).`,
      tareasAfectadas
    };
  } catch (error: any) {
    await client.query('ROLLBACK');
    
    throw new DatabaseError(
      'Error al eliminar Tag forzadamente',
      ErrorCode.DATABASE_ERROR,
      error.message
    );
  } finally {
    client.release();
  }
};

/**
 * Obtener estadísticas de una Tag
 */
export const obtenerEstadisticasEtiqueta = async (
  etiquetaId: number, 
  usuarioId: number
): Promise<EstadisticasEtiqueta | null> => {
  const client = await pool.connect();
  
  try {
    // Verificar que la Tag existe y pertenece al User
    const etiquetaExistente = await obtenerEtiquetaPorId(etiquetaId, usuarioId);
    if (!etiquetaExistente) {
      return null;
    }

    // Obtener estadísticas detalladas
    const result = await client.query(`
      SELECT 
        COUNT(DISTINCT te.tarea_id) as total_tareas,
        COUNT(DISTINCT CASE WHEN t.completada = true THEN te.tarea_id END) as tareas_completadas,
        COUNT(DISTINCT CASE WHEN t.completada = false THEN te.tarea_id END) as tareas_pendientes,
        COUNT(DISTINCT CASE WHEN t.prioridad = 'alta' THEN te.tarea_id END) as prioridad_alta,
        COUNT(DISTINCT CASE WHEN t.prioridad = 'media' THEN te.tarea_id END) as prioridad_media,
        COUNT(DISTINCT CASE WHEN t.prioridad = 'baja' THEN te.tarea_id END) as prioridad_baja,
        COUNT(DISTINCT CASE WHEN t.fecha_vencimiento IS NOT NULL AND t.fecha_vencimiento < NOW() AND t.completada = false THEN te.tarea_id END) as tareas_vencidas
      FROM tarea_etiquetas te
      INNER JOIN tareas t ON te.tarea_id = t.id
      WHERE te.etiqueta_id = $1 AND t.usuario_id = $2
    `, [etiquetaId, usuarioId]);

    const stats = result.rows[0];

    return {
      etiqueta_id: etiquetaId,
      nombre: etiquetaExistente.nombre,
      color: etiquetaExistente.color,
      total_tareas: parseInt(stats.total_tareas) || 0,
      tareas_completadas: parseInt(stats.tareas_completadas) || 0,
      tareas_pendientes: parseInt(stats.tareas_pendientes) || 0,
      tareas_vencidas: parseInt(stats.tareas_vencidas) || 0,
      distribucion_prioridad: {
        alta: parseInt(stats.prioridad_alta) || 0,
        media: parseInt(stats.prioridad_media) || 0,
        baja: parseInt(stats.prioridad_baja) || 0,
      },
      porcentaje_completado: parseInt(stats.total_tareas) > 0 
        ? Math.round((parseInt(stats.tareas_completadas) / parseInt(stats.total_tareas)) * 100)
        : 0
    };
  } catch (error: any) {
    throw new DatabaseError(
      'Error al obtener estadísticas de Tag',
      ErrorCode.DATABASE_ERROR,
      error.message
    );
  } finally {
    client.release();
  }
};

/**
 * Obtener etiquetas más usadas del User
 */
export const obtenerEtiquetasMasUsadas = async (
  usuarioId: number, 
  limite: number = 10
): Promise<Tag[]> => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      SELECT 
        e.id,
        e.nombre,
        e.color,
        e.creado_en,
        e.actualizado_en,
        COUNT(DISTINCT te.tarea_id) as uso_count
      FROM etiquetas e
      LEFT JOIN tarea_etiquetas te ON e.id = te.etiqueta_id
      LEFT JOIN tareas t ON te.tarea_id = t.id
      WHERE e.usuario_id = $1
      GROUP BY e.id, e.nombre, e.color, e.creado_en, e.actualizado_en
      HAVING COUNT(DISTINCT te.tarea_id) > 0
      ORDER BY uso_count DESC, e.nombre ASC
      LIMIT $2
    `, [usuarioId, limite]);

    return result.rows.map(row => ({
      id: row.id,
      nombre: row.nombre,
      color: row.color,
      usuario_id: usuarioId,
      creado_en: row.creado_en,
      actualizado_en: row.actualizado_en,
      uso_count: parseInt(row.uso_count) || 0
    }));
  } catch (error: any) {
    throw new DatabaseError(
      'Error al obtener etiquetas más usadas',
      ErrorCode.DATABASE_ERROR,
      error.message
    );
  } finally {
    client.release();
  }
};
