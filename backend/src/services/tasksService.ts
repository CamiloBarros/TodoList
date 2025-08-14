import { query, transaction } from '../config/database';
import { 
  Task, 
  TaskCreation, 
  TaskUpdate,
  TaskFilters,
  ResultadoPaginado,
  ApiResponse,
  Prioridad 
} from '../types';
import appConfig from '../config/env';

/**
 * Servicio de Tareas
 * Maneja todas las operaciones CRUD y de consulta para las tareas
 */

/**
 * Obtiene todas las tareas del User con filtros y paginación
 */
export const obtenerTareas = async (
  usuarioId: number,
  filtros: TaskFilters = {}
): Promise<ApiResponse<ResultadoPaginado<Task>>> => {
  try {
    const {
      completada,
      Category,
      prioridad,
      fecha_vencimiento,
      busqueda,
      etiquetas,
      ordenar = 'creado_en',
      direccion = 'desc',
      page = 1,
      limit = appConfig.pagination.defaultPageSize
    } = filtros;

    // Validar límite de paginación
    const limiteFinal = Math.min(limit, appConfig.pagination.maxPageSize);
    const offset = (page - 1) * limiteFinal;

    // Construir query base con JOIN para categorías
    let queryText = `
      SELECT 
        t.id, t.usuario_id, t.categoria_id, t.titulo, t.descripcion,
        t.completada, t.prioridad, t.fecha_vencimiento, t.completada_en,
        t.creado_en, t.actualizado_en,
        c.nombre as categoria_nombre, c.color as categoria_color,
        COALESCE(
          JSON_AGG(
            CASE WHEN e.id IS NOT NULL THEN
              JSON_BUILD_OBJECT('id', e.id, 'nombre', e.nombre, 'color', e.color)
            END
          ) FILTER (WHERE e.id IS NOT NULL), '[]'
        ) as etiquetas
      FROM tareas t
      LEFT JOIN categorias c ON t.categoria_id = c.id
      LEFT JOIN tarea_etiquetas te ON t.id = te.tarea_id
      LEFT JOIN etiquetas e ON te.etiqueta_id = e.id
      WHERE t.usuario_id = $1
    `;

    const params: any[] = [usuarioId];
    let paramCounter = 2;

    // Aplicar filtros
    if (completada !== undefined) {
      queryText += ` AND t.completada = $${paramCounter}`;
      params.push(completada);
      paramCounter++;
    }

    if (Category) {
      queryText += ` AND t.categoria_id = $${paramCounter}`;
      params.push(Category);
      paramCounter++;
    }

    if (prioridad) {
      queryText += ` AND t.prioridad = $${paramCounter}`;
      params.push(prioridad);
      paramCounter++;
    }

    if (fecha_vencimiento) {
      queryText += ` AND DATE(t.fecha_vencimiento) = DATE($${paramCounter})`;
      params.push(fecha_vencimiento);
      paramCounter++;
    }

    if (busqueda) {
      queryText += ` AND (t.titulo ILIKE $${paramCounter} OR t.descripcion ILIKE $${paramCounter})`;
      params.push(`%${busqueda}%`);
      paramCounter++;
    }

    if (etiquetas) {
      const etiquetaIds = etiquetas.split(',').map(id => parseInt(id.trim()));
      queryText += ` AND t.id IN (
        SELECT DISTINCT te2.tarea_id 
        FROM tarea_etiquetas te2 
        WHERE te2.etiqueta_id = ANY($${paramCounter})
      )`;
      params.push(etiquetaIds);
      paramCounter++;
    }

    // Agrupar por Task
    queryText += ` GROUP BY t.id, c.nombre, c.color`;

    // Ordenamiento
    const validarOrden = ['creado_en', 'fecha_vencimiento', 'prioridad', 'titulo'];
    const ordenValido = validarOrden.includes(ordenar) ? ordenar : 'creado_en';
    const direccionValida = direccion === 'asc' ? 'ASC' : 'DESC';
    
    // Ordenamiento especial para prioridad
    if (ordenValido === 'prioridad') {
      queryText += ` ORDER BY 
        CASE t.prioridad 
          WHEN 'alta' THEN 3 
          WHEN 'media' THEN 2 
          WHEN 'baja' THEN 1 
        END ${direccionValida}`;
    } else {
      queryText += ` ORDER BY t.${ordenValido} ${direccionValida}`;
    }

    // Paginación
    queryText += ` LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`;
    params.push(limiteFinal, offset);

    // Ejecutar query principal
    const resultado = await query(queryText, params);

    // Query para contar total
    let countQuery = `
      SELECT COUNT(DISTINCT t.id) as total
      FROM tareas t
      LEFT JOIN categorias c ON t.categoria_id = c.id
      LEFT JOIN tarea_etiquetas te ON t.id = te.tarea_id
      LEFT JOIN etiquetas e ON te.etiqueta_id = e.id
      WHERE t.usuario_id = $1
    `;

    // Aplicar los mismos filtros para el conteo
    let countParams: any[] = [usuarioId];
    let countParamCounter = 2;

    if (completada !== undefined) {
      countQuery += ` AND t.completada = $${countParamCounter}`;
      countParams.push(completada);
      countParamCounter++;
    }

    if (Category) {
      countQuery += ` AND t.categoria_id = $${countParamCounter}`;
      countParams.push(Category);
      countParamCounter++;
    }

    if (prioridad) {
      countQuery += ` AND t.prioridad = $${countParamCounter}`;
      countParams.push(prioridad);
      countParamCounter++;
    }

    if (fecha_vencimiento) {
      countQuery += ` AND DATE(t.fecha_vencimiento) = DATE($${countParamCounter})`;
      countParams.push(fecha_vencimiento);
      countParamCounter++;
    }

    if (busqueda) {
      countQuery += ` AND (t.titulo ILIKE $${countParamCounter} OR t.descripcion ILIKE $${countParamCounter})`;
      countParams.push(`%${busqueda}%`);
      countParamCounter++;
    }

    if (etiquetas) {
      const etiquetaIds = etiquetas.split(',').map(id => parseInt(id.trim()));
      countQuery += ` AND t.id IN (
        SELECT DISTINCT te2.tarea_id 
        FROM tarea_etiquetas te2 
        WHERE te2.etiqueta_id = ANY($${countParamCounter})
      )`;
      countParams.push(etiquetaIds);
      countParamCounter++;
    }

    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    // Procesar resultados
    const tareas: Task[] = resultado.rows.map(row => ({
      id: row.id,
      usuario_id: row.usuario_id,
      categoria_id: row.categoria_id,
      titulo: row.titulo,
      descripcion: row.descripcion,
      completada: row.completada,
      prioridad: row.prioridad,
      fecha_vencimiento: row.fecha_vencimiento,
      completada_en: row.completada_en,
      creado_en: row.creado_en,
      actualizado_en: row.actualizado_en,
      Category: row.categoria_id ? {
        id: row.categoria_id,
        usuario_id: row.usuario_id,
        nombre: row.categoria_nombre,
        color: row.categoria_color,
        creado_en: row.creado_en,
        actualizado_en: row.actualizado_en,
      } : undefined,
      etiquetas: row.etiquetas || []
    }));

    const totalPages = Math.ceil(total / limiteFinal);

    return {
      success: true,
      data: {
        data: tareas,
        pagination: {
          page,
          limit: limiteFinal,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        }
      }
    };
  } catch (error) {
    console.error('Error obteniendo tareas:', error);
    return {
      success: false,
      error: 'Error interno del servidor',
    };
  }
};

/**
 * Obtiene una Task específica por ID
 */
export const obtenerTareaPorId = async (
  tareaId: number,
  usuarioId: number
): Promise<ApiResponse<Task>> => {
  try {
    const queryText = `
      SELECT 
        t.id, t.usuario_id, t.categoria_id, t.titulo, t.descripcion,
        t.completada, t.prioridad, t.fecha_vencimiento, t.completada_en,
        t.creado_en, t.actualizado_en,
        c.nombre as categoria_nombre, c.color as categoria_color,
        COALESCE(
          JSON_AGG(
            CASE WHEN e.id IS NOT NULL THEN
              JSON_BUILD_OBJECT('id', e.id, 'nombre', e.nombre, 'color', e.color)
            END
          ) FILTER (WHERE e.id IS NOT NULL), '[]'
        ) as etiquetas
      FROM tareas t
      LEFT JOIN categorias c ON t.categoria_id = c.id
      LEFT JOIN tarea_etiquetas te ON t.id = te.tarea_id
      LEFT JOIN etiquetas e ON te.etiqueta_id = e.id
      WHERE t.id = $1 AND t.usuario_id = $2
      GROUP BY t.id, c.nombre, c.color
    `;

    const resultado = await query(queryText, [tareaId, usuarioId]);

    if (resultado.rows.length === 0) {
      return {
        success: false,
        error: 'Task no encontrada',
      };
    }

    const row = resultado.rows[0];
    const Task: Task = {
      id: row.id,
      usuario_id: row.usuario_id,
      categoria_id: row.categoria_id,
      titulo: row.titulo,
      descripcion: row.descripcion,
      completada: row.completada,
      prioridad: row.prioridad,
      fecha_vencimiento: row.fecha_vencimiento,
      completada_en: row.completada_en,
      creado_en: row.creado_en,
      actualizado_en: row.actualizado_en,
      Category: row.categoria_id ? {
        id: row.categoria_id,
        usuario_id: row.usuario_id,
        nombre: row.categoria_nombre,
        color: row.categoria_color,
        creado_en: row.creado_en,
        actualizado_en: row.actualizado_en,
      } : undefined,
      etiquetas: row.etiquetas || []
    };

    return {
      success: true,
      data: Task,
    };
  } catch (error) {
    console.error('Error obteniendo Task por ID:', error);
    return {
      success: false,
      error: 'Error interno del servidor',
    };
  }
};

/**
 * Crea una nueva Task
 */
export const crearTarea = async (
  usuarioId: number,
  datosTarea: TaskCreation
): Promise<ApiResponse<Task>> => {
  try {
    // Validar que la categoría pertenezca al User (si se especifica)
    if (datosTarea.categoria_id) {
      const categoriaResult = await query(
        'SELECT id FROM categorias WHERE id = $1 AND usuario_id = $2',
        [datosTarea.categoria_id, usuarioId]
      );

      if (categoriaResult.rows.length === 0) {
        return {
          success: false,
          error: 'Categoría no encontrada o no pertenece al User',
        };
      }
    }

    // Validar que las etiquetas pertenezcan al User (si se especifican)
    if (datosTarea.etiquetas && datosTarea.etiquetas.length > 0) {
      const etiquetasResult = await query(
        'SELECT id FROM etiquetas WHERE id = ANY($1) AND usuario_id = $2',
        [datosTarea.etiquetas, usuarioId]
      );

      if (etiquetasResult.rows.length !== datosTarea.etiquetas.length) {
        return {
          success: false,
          error: 'Una o más etiquetas no pertenecen al User',
        };
      }
    }

    const resultado = await transaction(async (client) => {
      // Crear la Task
      const insertResult = await client.query(
        `INSERT INTO tareas (
          usuario_id, categoria_id, titulo, descripcion, prioridad, fecha_vencimiento
        ) VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING *`,
        [
          usuarioId,
          datosTarea.categoria_id || null,
          datosTarea.titulo,
          datosTarea.descripcion || null,
          datosTarea.prioridad || 'media',
          datosTarea.fecha_vencimiento || null
        ]
      );

      const nuevaTarea = insertResult.rows[0];

      // Asociar etiquetas si se especificaron
      if (datosTarea.etiquetas && datosTarea.etiquetas.length > 0) {
        for (const etiquetaId of datosTarea.etiquetas) {
          await client.query(
            'INSERT INTO tarea_etiquetas (tarea_id, etiqueta_id) VALUES ($1, $2)',
            [nuevaTarea.id, etiquetaId]
          );
        }
      }

      return nuevaTarea;
    });

    // Obtener la Task completa con relaciones
    const tareaCompleta = await obtenerTareaPorId(resultado.id, usuarioId);

    if (tareaCompleta.success) {
      return {
        success: true,
        data: tareaCompleta.data!,
        message: 'Task creada exitosamente',
      };
    } else {
      return tareaCompleta;
    }
  } catch (error) {
    console.error('Error creando Task:', error);
    return {
      success: false,
      error: 'Error interno del servidor',
    };
  }
};

/**
 * Actualiza una Task existente
 */
export const actualizarTarea = async (
  tareaId: number,
  usuarioId: number,
  datosActualizacion: TaskUpdate
): Promise<ApiResponse<Task>> => {
  try {
    // Verificar que la Task existe y pertenece al User
    const tareaExiste = await query(
      'SELECT id FROM tareas WHERE id = $1 AND usuario_id = $2',
      [tareaId, usuarioId]
    );

    if (tareaExiste.rows.length === 0) {
      return {
        success: false,
        error: 'Task no encontrada',
      };
    }

    // Validar categoría si se especifica
    if (datosActualizacion.categoria_id) {
      const categoriaResult = await query(
        'SELECT id FROM categorias WHERE id = $1 AND usuario_id = $2',
        [datosActualizacion.categoria_id, usuarioId]
      );

      if (categoriaResult.rows.length === 0) {
        return {
          success: false,
          error: 'Categoría no encontrada o no pertenece al User',
        };
      }
    }

    // Validar etiquetas si se especifican
    if (datosActualizacion.etiquetas && datosActualizacion.etiquetas.length > 0) {
      const etiquetasResult = await query(
        'SELECT id FROM etiquetas WHERE id = ANY($1) AND usuario_id = $2',
        [datosActualizacion.etiquetas, usuarioId]
      );

      if (etiquetasResult.rows.length !== datosActualizacion.etiquetas.length) {
        return {
          success: false,
          error: 'Una o más etiquetas no pertenecen al User',
        };
      }
    }

    const resultado = await transaction(async (client) => {
      // Construir query de actualización dinámicamente
      const camposActualizar: string[] = [];
      const valores: any[] = [];
      let contador = 1;

      if (datosActualizacion.titulo !== undefined) {
        camposActualizar.push(`titulo = $${contador}`);
        valores.push(datosActualizacion.titulo);
        contador++;
      }

      if (datosActualizacion.descripcion !== undefined) {
        camposActualizar.push(`descripcion = $${contador}`);
        valores.push(datosActualizacion.descripcion);
        contador++;
      }

      if (datosActualizacion.categoria_id !== undefined) {
        camposActualizar.push(`categoria_id = $${contador}`);
        valores.push(datosActualizacion.categoria_id);
        contador++;
      }

      if (datosActualizacion.prioridad !== undefined) {
        camposActualizar.push(`prioridad = $${contador}`);
        valores.push(datosActualizacion.prioridad);
        contador++;
      }

      if (datosActualizacion.fecha_vencimiento !== undefined) {
        camposActualizar.push(`fecha_vencimiento = $${contador}`);
        valores.push(datosActualizacion.fecha_vencimiento);
        contador++;
      }

      if (datosActualizacion.completada !== undefined) {
        camposActualizar.push(`completada = $${contador}`);
        valores.push(datosActualizacion.completada);
        contador++;

        // Si se marca como completada, establecer fecha de completado
        if (datosActualizacion.completada) {
          camposActualizar.push(`completada_en = CURRENT_TIMESTAMP`);
        } else {
          camposActualizar.push(`completada_en = NULL`);
        }
      }

      if (camposActualizar.length === 0 && !datosActualizacion.etiquetas) {
        throw new Error('No hay datos para actualizar');
      }

      // Actualizar la Task si hay campos para actualizar
      if (camposActualizar.length > 0) {
        camposActualizar.push(`actualizado_en = CURRENT_TIMESTAMP`);
        valores.push(tareaId, usuarioId);

        const queryText = `
          UPDATE tareas 
          SET ${camposActualizar.join(', ')} 
          WHERE id = $${valores.length - 1} AND usuario_id = $${valores.length}
          RETURNING *
        `;

        await client.query(queryText, valores);
      }

      // Actualizar etiquetas si se especificaron
      if (datosActualizacion.etiquetas !== undefined) {
        // Eliminar etiquetas existentes
        await client.query(
          'DELETE FROM tarea_etiquetas WHERE tarea_id = $1',
          [tareaId]
        );

        // Agregar nuevas etiquetas
        if (datosActualizacion.etiquetas.length > 0) {
          for (const etiquetaId of datosActualizacion.etiquetas) {
            await client.query(
              'INSERT INTO tarea_etiquetas (tarea_id, etiqueta_id) VALUES ($1, $2)',
              [tareaId, etiquetaId]
            );
          }
        }
      }

      return true;
    });

    // Obtener la Task actualizada
    const tareaActualizada = await obtenerTareaPorId(tareaId, usuarioId);

    if (tareaActualizada.success) {
      return {
        success: true,
        data: tareaActualizada.data!,
        message: 'Task actualizada exitosamente',
      };
    } else {
      return tareaActualizada;
    }
  } catch (error) {
    console.error('Error actualizando Task:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor',
    };
  }
};

/**
 * Elimina una Task
 */
export const eliminarTarea = async (
  tareaId: number,
  usuarioId: number
): Promise<ApiResponse<void>> => {
  try {
    const resultado = await transaction(async (client) => {
      // Eliminar asociaciones con etiquetas
      await client.query(
        'DELETE FROM tarea_etiquetas WHERE tarea_id = $1',
        [tareaId]
      );

      // Eliminar la Task
      const deleteResult = await client.query(
        'DELETE FROM tareas WHERE id = $1 AND usuario_id = $2',
        [tareaId, usuarioId]
      );

      return deleteResult.rowCount;
    });

    if (resultado === 0) {
      return {
        success: false,
        error: 'Task no encontrada',
      };
    }

    return {
      success: true,
      message: 'Task eliminada exitosamente',
    };
  } catch (error) {
    console.error('Error eliminando Task:', error);
    return {
      success: false,
      error: 'Error interno del servidor',
    };
  }
};

/**
 * Obtiene estadísticas de las tareas del User
 */
export const obtenerEstadisticasTareas = async (
  usuarioId: number
): Promise<ApiResponse<any>> => {
  try {
    // Estadísticas generales
    const estadisticasGenerales = await query(`
      SELECT 
        COUNT(*) as total_tareas,
        COUNT(CASE WHEN completada = true THEN 1 END) as tareas_completadas,
        COUNT(CASE WHEN completada = false THEN 1 END) as tareas_pendientes,
        COUNT(CASE WHEN fecha_vencimiento < NOW() AND completada = false THEN 1 END) as tareas_vencidas,
        COUNT(CASE WHEN fecha_vencimiento >= NOW() AND fecha_vencimiento <= NOW() + INTERVAL '7 days' AND completada = false THEN 1 END) as tareas_proximas
      FROM tareas 
      WHERE usuario_id = $1
    `, [usuarioId]);

    // Estadísticas por prioridad
    const estadisticasPrioridad = await query(`
      SELECT 
        prioridad,
        COUNT(*) as total,
        COUNT(CASE WHEN completada = true THEN 1 END) as completadas,
        COUNT(CASE WHEN completada = false THEN 1 END) as pendientes
      FROM tareas 
      WHERE usuario_id = $1
      GROUP BY prioridad
      ORDER BY 
        CASE prioridad 
          WHEN 'alta' THEN 1 
          WHEN 'media' THEN 2 
          WHEN 'baja' THEN 3 
        END
    `, [usuarioId]);

    // Estadísticas por categoría
    const estadisticasCategorias = await query(`
      SELECT 
        c.id as categoria_id,
        c.nombre as categoria_nombre,
        c.color as categoria_color,
        COUNT(t.id) as total_tareas,
        COUNT(CASE WHEN t.completada = true THEN 1 END) as tareas_completadas,
        COUNT(CASE WHEN t.completada = false THEN 1 END) as tareas_pendientes
      FROM categorias c
      LEFT JOIN tareas t ON c.id = t.categoria_id AND t.usuario_id = $1
      WHERE c.usuario_id = $1
      GROUP BY c.id, c.nombre, c.color
      ORDER BY total_tareas DESC
    `, [usuarioId]);

    // Productividad reciente (últimos 7 días)
    const productividad = await query(`
      SELECT 
        DATE(completada_en) as fecha,
        COUNT(*) as tareas_completadas
      FROM tareas 
      WHERE usuario_id = $1 
        AND completada = true 
        AND completada_en >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(completada_en)
      ORDER BY fecha DESC
    `, [usuarioId]);

    // Estadísticas de etiquetas más usadas
    const etiquetasPopulares = await query(`
      SELECT 
        e.id,
        e.nombre,
        e.color,
        COUNT(te.tarea_id) as uso_count
      FROM etiquetas e
      INNER JOIN tarea_etiquetas te ON e.id = te.etiqueta_id
      INNER JOIN tareas t ON te.tarea_id = t.id
      WHERE e.usuario_id = $1 AND t.usuario_id = $1
      GROUP BY e.id, e.nombre, e.color
      ORDER BY uso_count DESC
      LIMIT 10
    `, [usuarioId]);

    // Calcular porcentajes
    const totales = estadisticasGenerales.rows[0];
    const totalTareas = parseInt(totales.total_tareas);
    const porcentajeCompletadas = totalTareas > 0 ? Math.round((parseInt(totales.tareas_completadas) / totalTareas) * 100) : 0;

    const estadisticas = {
      resumen: {
        total_tareas: parseInt(totales.total_tareas),
        tareas_completadas: parseInt(totales.tareas_completadas),
        tareas_pendientes: parseInt(totales.tareas_pendientes),
        tareas_vencidas: parseInt(totales.tareas_vencidas),
        tareas_proximas: parseInt(totales.tareas_proximas),
        porcentaje_completadas: porcentajeCompletadas
      },
      por_prioridad: estadisticasPrioridad.rows.map(row => ({
        prioridad: row.prioridad,
        total: parseInt(row.total),
        completadas: parseInt(row.completadas),
        pendientes: parseInt(row.pendientes),
        porcentaje_completadas: parseInt(row.total) > 0 ? Math.round((parseInt(row.completadas) / parseInt(row.total)) * 100) : 0
      })),
      por_categoria: estadisticasCategorias.rows.map(row => ({
        categoria_id: row.categoria_id,
        categoria_nombre: row.categoria_nombre,
        categoria_color: row.categoria_color,
        total_tareas: parseInt(row.total_tareas),
        tareas_completadas: parseInt(row.tareas_completadas),
        tareas_pendientes: parseInt(row.tareas_pendientes),
        porcentaje_completadas: parseInt(row.total_tareas) > 0 ? Math.round((parseInt(row.tareas_completadas) / parseInt(row.total_tareas)) * 100) : 0
      })),
      productividad_reciente: productividad.rows.map(row => ({
        fecha: row.fecha,
        tareas_completadas: parseInt(row.tareas_completadas)
      })),
      etiquetas_populares: etiquetasPopulares.rows.map(row => ({
        id: row.id,
        nombre: row.nombre,
        color: row.color,
        uso_count: parseInt(row.uso_count)
      }))
    };

    return {
      success: true,
      data: estadisticas,
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas de tareas:', error);
    return {
      success: false,
      error: 'Error interno del servidor',
    };
  }
};
