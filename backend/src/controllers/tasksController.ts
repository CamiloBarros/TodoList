import { Response } from 'express';
import { AuthenticatedRequest, FiltrosTareas } from '../types';
import * as tasksService from '../services/tasksService';

/**
 * Controller de Tareas
 * Maneja todas las rutas relacionadas con la gestión de tareas
 */

/**
 * GET /api/tareas
 * Obtiene todas las tareas del usuario con filtros y paginación
 */
export const obtenerTareas = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const filtros: FiltrosTareas = {
      completada: req.query.completada ? req.query.completada === 'true' : undefined,
      categoria: req.query.categoria ? parseInt(req.query.categoria as string) : undefined,
      prioridad: req.query.prioridad as any,
      fecha_vencimiento: req.query.fecha_vencimiento as string,
      busqueda: req.query.busqueda as string,
      etiquetas: req.query.etiquetas as string,
      ordenar: req.query.ordenar as any,
      direccion: req.query.direccion as any,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    };

    const resultado = await tasksService.obtenerTareas(req.user.id, filtros);

    if (resultado.success) {
      res.status(200).json({
        success: true,
        data: resultado.data,
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          message: resultado.error,
          type: 'INTERNAL_SERVER_ERROR',
          statusCode: 500,
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error('Error en obtener tareas controller:', error);
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
 * GET /api/tareas/:id
 * Obtiene una tarea específica por ID
 */
export const obtenerTareaPorId = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tareaId = parseInt(req.params.id || '0');

    if (isNaN(tareaId)) {
      res.status(400).json({
        success: false,
        error: {
          message: 'ID de tarea inválido',
          type: 'VALIDATION_ERROR',
          statusCode: 400,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const resultado = await tasksService.obtenerTareaPorId(tareaId, req.user.id);

    if (resultado.success) {
      res.status(200).json({
        success: true,
        data: resultado.data,
      });
    } else {
      const statusCode = resultado.error === 'Tarea no encontrada' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: {
          message: resultado.error,
          type: statusCode === 404 ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
          statusCode,
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error('Error en obtener tarea por ID controller:', error);
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
 * POST /api/tareas
 * Crea una nueva tarea
 */
export const crearTarea = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { titulo, descripcion, categoria_id, prioridad, fecha_vencimiento, etiquetas } = req.body;

    const resultado = await tasksService.crearTarea(req.user.id, {
      titulo,
      descripcion,
      categoria_id,
      prioridad,
      fecha_vencimiento,
      etiquetas,
    });

    if (resultado.success) {
      res.status(201).json({
        success: true,
        data: resultado.data,
        message: resultado.message,
      });
    } else {
      const statusCode = 
        resultado.error?.includes('no encontrada') || 
        resultado.error?.includes('no pertenece') ? 400 : 500;
      
      res.status(statusCode).json({
        success: false,
        error: {
          message: resultado.error,
          type: statusCode === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_SERVER_ERROR',
          statusCode,
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error('Error en crear tarea controller:', error);
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
 * PUT /api/tareas/:id
 * Actualiza una tarea existente
 */
export const actualizarTarea = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tareaId = parseInt(req.params.id || '0');

    if (isNaN(tareaId)) {
      res.status(400).json({
        success: false,
        error: {
          message: 'ID de tarea inválido',
          type: 'VALIDATION_ERROR',
          statusCode: 400,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const { titulo, descripcion, categoria_id, prioridad, fecha_vencimiento, completada, etiquetas } = req.body;

    const resultado = await tasksService.actualizarTarea(tareaId, req.user.id, {
      titulo,
      descripcion,
      categoria_id,
      prioridad,
      fecha_vencimiento,
      completada,
      etiquetas,
    });

    if (resultado.success) {
      res.status(200).json({
        success: true,
        data: resultado.data,
        message: resultado.message,
      });
    } else {
      const statusCode = 
        resultado.error === 'Tarea no encontrada' ? 404 :
        resultado.error?.includes('no encontrada') || 
        resultado.error?.includes('no pertenece') || 
        resultado.error?.includes('No hay datos') ? 400 : 500;
      
      res.status(statusCode).json({
        success: false,
        error: {
          message: resultado.error,
          type: statusCode === 404 ? 'NOT_FOUND' : 
                statusCode === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_SERVER_ERROR',
          statusCode,
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error('Error en actualizar tarea controller:', error);
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
 * DELETE /api/tareas/:id
 * Elimina una tarea
 */
export const eliminarTarea = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tareaId = parseInt(req.params.id || '0');

    if (isNaN(tareaId)) {
      res.status(400).json({
        success: false,
        error: {
          message: 'ID de tarea inválido',
          type: 'VALIDATION_ERROR',
          statusCode: 400,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const resultado = await tasksService.eliminarTarea(tareaId, req.user.id);

    if (resultado.success) {
      res.status(200).json({
        success: true,
        message: resultado.message,
      });
    } else {
      const statusCode = resultado.error === 'Tarea no encontrada' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: {
          message: resultado.error,
          type: statusCode === 404 ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
          statusCode,
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error('Error en eliminar tarea controller:', error);
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
 * PATCH /api/tareas/:id/completar
 * Marca una tarea como completada o pendiente
 */
export const toggleCompletarTarea = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tareaId = parseInt(req.params.id || '0');

    if (isNaN(tareaId)) {
      res.status(400).json({
        success: false,
        error: {
          message: 'ID de tarea inválido',
          type: 'VALIDATION_ERROR',
          statusCode: 400,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const { completada } = req.body;

    if (typeof completada !== 'boolean') {
      res.status(400).json({
        success: false,
        error: {
          message: 'El campo completada debe ser true o false',
          type: 'VALIDATION_ERROR',
          statusCode: 400,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const resultado = await tasksService.actualizarTarea(tareaId, req.user.id, {
      completada,
    });

    if (resultado.success) {
      res.status(200).json({
        success: true,
        data: resultado.data,
        message: `Tarea marcada como ${completada ? 'completada' : 'pendiente'}`,
      });
    } else {
      const statusCode = resultado.error === 'Tarea no encontrada' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: {
          message: resultado.error,
          type: statusCode === 404 ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
          statusCode,
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error('Error en toggle completar tarea controller:', error);
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
 * GET /api/tareas/estadisticas
 * Obtiene estadísticas de las tareas del usuario
 */
export const obtenerEstadisticasTareas = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const resultado = await tasksService.obtenerEstadisticasTareas(req.user.id);

    if (resultado.success) {
      res.status(200).json({
        success: true,
        data: resultado.data,
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          message: resultado.error,
          type: 'INTERNAL_SERVER_ERROR',
          statusCode: 500,
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error('Error en obtener estadísticas de tareas controller:', error);
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
