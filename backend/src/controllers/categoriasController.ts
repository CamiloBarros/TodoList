import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import * as categoriasService from '../services/categoriasService';

/**
 * Controller de Categorías
 * Maneja todas las rutas relacionadas con la gestión de categorías
 */

/**
 * GET /api/categorias
 * Obtiene todas las categorías del usuario
 */
export const obtenerCategorias = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const resultado = await categoriasService.obtenerCategorias(req.user.id);

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
    console.error('Error en obtener categorías controller:', error);
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
 * GET /api/categorias/:id
 * Obtiene una categoría específica por ID
 */
export const obtenerCategoriaPorId = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const categoriaId = parseInt(req.params.id || '0');

    if (isNaN(categoriaId)) {
      res.status(400).json({
        success: false,
        error: {
          message: 'ID de categoría inválido',
          type: 'VALIDATION_ERROR',
          statusCode: 400,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const resultado = await categoriasService.obtenerCategoriaPorId(categoriaId, req.user.id);

    if (resultado.success) {
      res.status(200).json({
        success: true,
        data: resultado.data,
      });
    } else {
      const statusCode = resultado.error === 'Categoría no encontrada' ? 404 : 500;
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
    console.error('Error en obtener categoría por ID controller:', error);
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
 * POST /api/categorias
 * Crea una nueva categoría
 */
export const crearCategoria = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { nombre, descripcion, color } = req.body;

    const resultado = await categoriasService.crearCategoria(req.user.id, {
      nombre,
      descripcion,
      color,
    });

    if (resultado.success) {
      res.status(201).json({
        success: true,
        data: resultado.data,
        message: resultado.message,
      });
    } else {
      const statusCode = resultado.error === 'Ya existe una categoría con ese nombre' ? 409 : 500;
      res.status(statusCode).json({
        success: false,
        error: {
          message: resultado.error,
          type: statusCode === 409 ? 'CONFLICT' : 'INTERNAL_SERVER_ERROR',
          statusCode,
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error('Error en crear categoría controller:', error);
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
 * PUT /api/categorias/:id
 * Actualiza una categoría existente
 */
export const actualizarCategoria = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const categoriaId = parseInt(req.params.id || '0');

    if (isNaN(categoriaId)) {
      res.status(400).json({
        success: false,
        error: {
          message: 'ID de categoría inválido',
          type: 'VALIDATION_ERROR',
          statusCode: 400,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const { nombre, descripcion, color } = req.body;

    const resultado = await categoriasService.actualizarCategoria(categoriaId, req.user.id, {
      nombre,
      descripcion,
      color,
    });

    if (resultado.success) {
      res.status(200).json({
        success: true,
        data: resultado.data,
        message: resultado.message,
      });
    } else {
      const statusCode = 
        resultado.error === 'Categoría no encontrada' ? 404 :
        resultado.error === 'Ya existe una categoría con ese nombre' ? 409 :
        resultado.error === 'No hay datos para actualizar' ? 400 : 500;
      
      res.status(statusCode).json({
        success: false,
        error: {
          message: resultado.error,
          type: statusCode === 404 ? 'NOT_FOUND' : 
                statusCode === 409 ? 'CONFLICT' :
                statusCode === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_SERVER_ERROR',
          statusCode,
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error('Error en actualizar categoría controller:', error);
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
 * DELETE /api/categorias/:id
 * Elimina una categoría (solo si no tiene tareas asociadas)
 */
export const eliminarCategoria = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const categoriaId = parseInt(req.params.id || '0');

    if (isNaN(categoriaId)) {
      res.status(400).json({
        success: false,
        error: {
          message: 'ID de categoría inválido',
          type: 'VALIDATION_ERROR',
          statusCode: 400,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const resultado = await categoriasService.eliminarCategoria(categoriaId, req.user.id);

    if (resultado.success) {
      res.status(200).json({
        success: true,
        message: resultado.message,
      });
    } else {
      const statusCode = 
        resultado.error === 'Categoría no encontrada' ? 404 :
        resultado.error?.includes('tiene') && resultado.error?.includes('tarea') ? 409 : 500;
      
      res.status(statusCode).json({
        success: false,
        error: {
          message: resultado.error,
          type: statusCode === 404 ? 'NOT_FOUND' : 
                statusCode === 409 ? 'CONFLICT' : 'INTERNAL_SERVER_ERROR',
          statusCode,
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error('Error en eliminar categoría controller:', error);
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
 * DELETE /api/categorias/:id/forzar
 * Elimina una categoría forzadamente (mueve las tareas a "sin categoría")
 */
export const eliminarCategoriaForzar = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const categoriaId = parseInt(req.params.id || '0');

    if (isNaN(categoriaId)) {
      res.status(400).json({
        success: false,
        error: {
          message: 'ID de categoría inválido',
          type: 'VALIDATION_ERROR',
          statusCode: 400,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const resultado = await categoriasService.eliminarCategoriaConTareas(categoriaId, req.user.id);

    if (resultado.success) {
      res.status(200).json({
        success: true,
        message: resultado.message,
      });
    } else {
      const statusCode = resultado.error === 'Categoría no encontrada' ? 404 : 500;
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
    console.error('Error en eliminar categoría forzar controller:', error);
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
 * GET /api/categorias/:id/estadisticas
 * Obtiene estadísticas de una categoría
 */
export const obtenerEstadisticasCategoria = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const categoriaId = parseInt(req.params.id || '0');

    if (isNaN(categoriaId)) {
      res.status(400).json({
        success: false,
        error: {
          message: 'ID de categoría inválido',
          type: 'VALIDATION_ERROR',
          statusCode: 400,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const resultado = await categoriasService.obtenerEstadisticasCategoria(categoriaId, req.user.id);

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
    console.error('Error en obtener estadísticas categoría controller:', error);
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
