import { Router } from 'express';
import * as tagsController from '../controllers/tagsController';
import { authenticateToken } from '../middleware/auth';
import {
  validateCrearEtiqueta,
  validateActualizarEtiqueta,
  validateIdParam,
} from '../middleware/validation';

const router = Router();

// Todas las rutas de etiquetas requieren autenticación
router.use(authenticateToken);

/**
 * @route   GET /api/etiquetas
 * @desc    Obtener todas las etiquetas del usuario
 * @access  Private
 */
router.get('/', tagsController.obtenerEtiquetas as any);

/**
 * @route   GET /api/etiquetas/mas-usadas
 * @desc    Obtener las etiquetas más usadas del usuario
 * @access  Private
 * @query   ?limite=10
 */
router.get('/mas-usadas', tagsController.obtenerEtiquetasMasUsadas as any);

/**
 * @route   GET /api/etiquetas/:id
 * @desc    Obtener una etiqueta específica por ID
 * @access  Private
 */
router.get(
  '/:id',
  ...validateIdParam,
  tagsController.obtenerEtiquetaPorId as any
);

/**
 * @route   GET /api/etiquetas/:id/estadisticas
 * @desc    Obtener estadísticas de una etiqueta (número de tareas por estado)
 * @access  Private
 */
router.get(
  '/:id/estadisticas',
  ...validateIdParam,
  tagsController.obtenerEstadisticasEtiqueta as any
);

/**
 * @route   POST /api/etiquetas
 * @desc    Crear una nueva etiqueta
 * @access  Private
 * @body    { nombre, color? }
 */
router.post('/', ...validateCrearEtiqueta, tagsController.crearEtiqueta as any);

/**
 * @route   PUT /api/etiquetas/:id
 * @desc    Actualizar una etiqueta
 * @access  Private
 * @body    { nombre?, color? }
 */
router.put(
  '/:id',
  ...validateActualizarEtiqueta,
  tagsController.actualizarEtiqueta as any
);

/**
 * @route   DELETE /api/etiquetas/:id
 * @desc    Eliminar una etiqueta (solo si no tiene tareas asociadas)
 * @access  Private
 */
router.delete(
  '/:id',
  ...validateIdParam,
  tagsController.eliminarEtiqueta as any
);

/**
 * @route   DELETE /api/etiquetas/:id/forzar
 * @desc    Eliminar una etiqueta forzadamente (removiendo asociaciones con tareas)
 * @access  Private
 */
router.delete(
  '/:id/forzar',
  ...validateIdParam,
  tagsController.eliminarEtiquetaForzar as any
);

export default router;
