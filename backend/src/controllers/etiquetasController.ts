import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthenticatedRequest } from '../types';
import * as etiquetasService from '../services/etiquetasService';

/**
 * Obtener todas las etiquetas del usuario
 */
export const obtenerEtiquetas = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const usuarioId = req.user.id;
    const etiquetas = await etiquetasService.obtenerEtiquetas(usuarioId);

    res.status(200).json({
      success: true,
      data: {
        etiquetas,
        total: etiquetas.length,
      },
      message: etiquetas.length > 0 
        ? `Se encontraron ${etiquetas.length} etiqueta(s)`
        : 'No se encontraron etiquetas'
    });
  } catch (error: any) {
    console.error('Error al obtener etiquetas:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor al obtener etiquetas',
        type: 'INTERNAL_SERVER_ERROR',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Obtener una etiqueta específica por ID
 */
export const obtenerEtiquetaPorId = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Datos de entrada inválidos',
          type: 'VALIDATION_ERROR',
          statusCode: 400,
          timestamp: new Date().toISOString(),
          details: errors.array(),
        },
      });
      return;
    }

    const usuarioId = req.user.id;
    const etiquetaId = parseInt(req.params.id as string);

    const etiqueta = await etiquetasService.obtenerEtiquetaPorId(etiquetaId, usuarioId);

    if (!etiqueta) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Etiqueta no encontrada',
          type: 'NOT_FOUND_ERROR',
          statusCode: 404,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: etiqueta,
      message: 'Etiqueta obtenida exitosamente'
    });
  } catch (error: any) {
    console.error('Error al obtener etiqueta por ID:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor al obtener la etiqueta',
        type: 'INTERNAL_SERVER_ERROR',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Crear una nueva etiqueta
 */
export const crearEtiqueta = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Datos de entrada inválidos',
          type: 'VALIDATION_ERROR',
          statusCode: 400,
          timestamp: new Date().toISOString(),
          details: errors.array(),
        },
      });
      return;
    }

    const usuarioId = req.user.id;
    const etiquetaData = req.body;

    const nuevaEtiqueta = await etiquetasService.crearEtiqueta(etiquetaData, usuarioId);

    res.status(201).json({
      success: true,
      data: nuevaEtiqueta,
      message: `Etiqueta "${nuevaEtiqueta.nombre}" creada exitosamente`
    });
  } catch (error: any) {
    console.error('Error al crear etiqueta:', error);

    // Manejar errores específicos
    if (error.code === 'VALIDATION_ERROR') {
      res.status(400).json({
        success: false,
        error: {
          message: error.message,
          type: 'VALIDATION_ERROR',
          statusCode: 400,
          timestamp: new Date().toISOString(),
          details: error.details,
        },
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor al crear la etiqueta',
        type: 'INTERNAL_SERVER_ERROR',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Actualizar una etiqueta existente
 */
export const actualizarEtiqueta = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Datos de entrada inválidos',
          type: 'VALIDATION_ERROR',
          statusCode: 400,
          timestamp: new Date().toISOString(),
          details: errors.array(),
        },
      });
      return;
    }

    const usuarioId = req.user.id;
    const etiquetaId = parseInt(req.params.id as string);
    const etiquetaData = req.body;

    const etiquetaActualizada = await etiquetasService.actualizarEtiqueta(
      etiquetaId,
      etiquetaData,
      usuarioId
    );

    if (!etiquetaActualizada) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Etiqueta no encontrada',
          type: 'NOT_FOUND_ERROR',
          statusCode: 404,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: etiquetaActualizada,
      message: `Etiqueta "${etiquetaActualizada.nombre}" actualizada exitosamente`
    });
  } catch (error: any) {
    console.error('Error al actualizar etiqueta:', error);

    // Manejar errores específicos
    if (error.code === 'VALIDATION_ERROR') {
      res.status(400).json({
        success: false,
        error: {
          message: error.message,
          type: 'VALIDATION_ERROR',
          statusCode: 400,
          timestamp: new Date().toISOString(),
          details: error.details,
        },
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor al actualizar la etiqueta',
        type: 'INTERNAL_SERVER_ERROR',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Eliminar una etiqueta (solo si no tiene tareas asociadas)
 */
export const eliminarEtiqueta = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Datos de entrada inválidos',
          type: 'VALIDATION_ERROR',
          statusCode: 400,
          timestamp: new Date().toISOString(),
          details: errors.array(),
        },
      });
      return;
    }

    const usuarioId = req.user.id;
    const etiquetaId = parseInt(req.params.id as string);

    const resultado = await etiquetasService.eliminarEtiqueta(etiquetaId, usuarioId);

    if (!resultado.eliminada) {
      if (resultado.mensaje === 'Etiqueta no encontrada') {
        res.status(404).json({
          success: false,
          error: {
            message: resultado.mensaje,
            type: 'NOT_FOUND_ERROR',
            statusCode: 404,
            timestamp: new Date().toISOString(),
          },
        });
      } else {
        res.status(409).json({
          success: false,
          error: {
            message: resultado.mensaje,
            type: 'CONFLICT_ERROR',
            statusCode: 409,
            timestamp: new Date().toISOString(),
          },
        });
      }
      return;
    }

    res.status(200).json({
      success: true,
      data: { eliminada: true },
      message: resultado.mensaje
    });
  } catch (error: any) {
    console.error('Error al eliminar etiqueta:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor al eliminar la etiqueta',
        type: 'INTERNAL_SERVER_ERROR',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Eliminar una etiqueta forzadamente (eliminando también sus asociaciones)
 */
export const eliminarEtiquetaForzar = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Datos de entrada inválidos',
          type: 'VALIDATION_ERROR',
          statusCode: 400,
          timestamp: new Date().toISOString(),
          details: errors.array(),
        },
      });
      return;
    }

    const usuarioId = req.user.id;
    const etiquetaId = parseInt(req.params.id as string);

    const resultado = await etiquetasService.eliminarEtiquetaForzar(etiquetaId, usuarioId);

    if (!resultado.eliminada) {
      res.status(404).json({
        success: false,
        error: {
          message: resultado.mensaje,
          type: 'NOT_FOUND_ERROR',
          statusCode: 404,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { 
        eliminada: true,
        tareasAfectadas: resultado.tareasAfectadas 
      },
      message: resultado.mensaje
    });
  } catch (error: any) {
    console.error('Error al eliminar etiqueta forzadamente:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor al eliminar la etiqueta',
        type: 'INTERNAL_SERVER_ERROR',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Obtener estadísticas de una etiqueta
 */
export const obtenerEstadisticasEtiqueta = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Datos de entrada inválidos',
          type: 'VALIDATION_ERROR',
          statusCode: 400,
          timestamp: new Date().toISOString(),
          details: errors.array(),
        },
      });
      return;
    }

    const usuarioId = req.user.id;
    const etiquetaId = parseInt(req.params.id as string);

    const estadisticas = await etiquetasService.obtenerEstadisticasEtiqueta(etiquetaId, usuarioId);

    if (!estadisticas) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Etiqueta no encontrada',
          type: 'NOT_FOUND_ERROR',
          statusCode: 404,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: estadisticas,
      message: 'Estadísticas de etiqueta obtenidas exitosamente'
    });
  } catch (error: any) {
    console.error('Error al obtener estadísticas de etiqueta:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor al obtener estadísticas',
        type: 'INTERNAL_SERVER_ERROR',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Obtener etiquetas más usadas del usuario
 */
export const obtenerEtiquetasMasUsadas = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const usuarioId = req.user.id;
    const limite = parseInt(req.query.limite as string) || 10;

    // Validar límite
    if (limite < 1 || limite > 50) {
      res.status(400).json({
        success: false,
        error: {
          message: 'El límite debe ser un número entre 1 y 50',
          type: 'VALIDATION_ERROR',
          statusCode: 400,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const etiquetas = await etiquetasService.obtenerEtiquetasMasUsadas(usuarioId, limite);

    res.status(200).json({
      success: true,
      data: {
        etiquetas,
        total: etiquetas.length,
        limite
      },
      message: etiquetas.length > 0 
        ? `Se encontraron ${etiquetas.length} etiqueta(s) más usada(s)`
        : 'No se encontraron etiquetas con uso'
    });
  } catch (error: any) {
    console.error('Error al obtener etiquetas más usadas:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor al obtener etiquetas más usadas',
        type: 'INTERNAL_SERVER_ERROR',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
    });
  }
};
