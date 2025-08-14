import { Router } from 'express';
import * as tasksController from '../controllers/tasksController';
import { authenticateToken } from '../middleware/auth';
import {
  validateCrearTarea,
  validateActualizarTarea,
  validateIdParam,
  validateFiltrosTareas,
} from '../middleware/validation';
import { body } from 'express-validator';

const router = Router();

// Todas las rutas de tareas requieren autenticación
router.use(authenticateToken);

/**
 * Validación para toggle completar tarea
 */
const validateToggleCompletar = [
  body('completada')
    .isBoolean()
    .withMessage('El campo completada debe ser true o false'),
];

/**
 * @route   GET /api/tareas
 * @desc    Obtener todas las tareas del usuario con filtros y paginación
 * @access  Private
 * @query   ?completada=true&categoria=1&prioridad=alta&fecha_vencimiento=2025-08-15
 *          &busqueda=texto&etiquetas=1,2,3&ordenar=creado_en&direccion=desc
 *          &page=1&limit=20
 */
router.get('/', ...validateFiltrosTareas, tasksController.obtenerTareas as any);

/**
 * @route   GET /api/tareas/estadisticas
 * @desc    Obtener estadísticas de las tareas del usuario
 * @access  Private
 */
router.get('/estadisticas', tasksController.obtenerEstadisticasTareas as any);

/**
 * @route   GET /api/tareas/:id
 * @desc    Obtener una tarea específica por ID
 * @access  Private
 */
router.get(
  '/:id',
  ...validateIdParam,
  tasksController.obtenerTareaPorId as any
);

/**
 * @route   POST /api/tareas
 * @desc    Crear una nueva tarea
 * @access  Private
 * @body    { titulo, descripcion?, categoria_id?, prioridad?, fecha_vencimiento?, etiquetas? }
 */
router.post('/', ...validateCrearTarea, tasksController.crearTarea as any);

/**
 * @route   PUT /api/tareas/:id
 * @desc    Actualizar una tarea completa
 * @access  Private
 * @body    { titulo?, descripcion?, categoria_id?, prioridad?, fecha_vencimiento?, completada?, etiquetas? }
 */
router.put(
  '/:id',
  ...validateActualizarTarea,
  tasksController.actualizarTarea as any
);

/**
 * @route   PATCH /api/tareas/:id/completar
 * @desc    Marcar una tarea como completada o pendiente
 * @access  Private
 * @body    { completada: boolean }
 */
router.patch(
  '/:id/completar',
  ...validateIdParam,
  ...validateToggleCompletar,
  tasksController.toggleCompletarTarea as any
);

/**
 * @route   DELETE /api/tareas/:id
 * @desc    Eliminar una tarea
 * @access  Private
 */
router.delete('/:id', ...validateIdParam, tasksController.eliminarTarea as any);

export default router;
