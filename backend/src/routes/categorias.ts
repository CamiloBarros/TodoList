import { Router } from 'express';
import * as categoriasController from '../controllers/categoriasController';
import { authenticateToken } from '../middleware/auth';
import {
  validateCrearCategoria,
  validateActualizarCategoria,
  validateIdParam,
} from '../middleware/validation';

const router = Router();

// Todas las rutas de categorías requieren autenticación
router.use(authenticateToken);

/**
 * @route   GET /api/categorias
 * @desc    Obtener todas las categorías del usuario
 * @access  Private
 */
router.get('/', categoriasController.obtenerCategorias as any);

/**
 * @route   GET /api/categorias/:id
 * @desc    Obtener una categoría específica por ID
 * @access  Private
 */
router.get('/:id', ...validateIdParam, categoriasController.obtenerCategoriaPorId as any);

/**
 * @route   GET /api/categorias/:id/estadisticas
 * @desc    Obtener estadísticas de una categoría (número de tareas)
 * @access  Private
 */
router.get('/:id/estadisticas', ...validateIdParam, categoriasController.obtenerEstadisticasCategoria as any);

/**
 * @route   POST /api/categorias
 * @desc    Crear una nueva categoría
 * @access  Private
 * @body    { nombre, descripcion?, color? }
 */
router.post('/', ...validateCrearCategoria, categoriasController.crearCategoria as any);

/**
 * @route   PUT /api/categorias/:id
 * @desc    Actualizar una categoría
 * @access  Private
 * @body    { nombre?, descripcion?, color? }
 */
router.put('/:id', ...validateActualizarCategoria, categoriasController.actualizarCategoria as any);

/**
 * @route   DELETE /api/categorias/:id
 * @desc    Eliminar una categoría (solo si no tiene tareas asociadas)
 * @access  Private
 */
router.delete('/:id', ...validateIdParam, categoriasController.eliminarCategoria as any);

/**
 * @route   DELETE /api/categorias/:id/forzar
 * @desc    Eliminar una categoría forzadamente (mueve las tareas a "sin categoría")
 * @access  Private
 */
router.delete('/:id/forzar', ...validateIdParam, categoriasController.eliminarCategoriaForzar as any);

export default router;
