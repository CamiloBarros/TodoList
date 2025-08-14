import { Router } from 'express';
import * as tasksController from '../controllers/tasksController';
import { authenticateToken } from '../middleware/auth';
import {
  validateCreateTask,
  validateUpdateTask,
  validateIdParam,
  validateTaskFilters,
} from '../middleware/validation';
import { body } from 'express-validator';

const router = Router();

// All task routes require authentication
router.use(authenticateToken);

/**
 * Validation for toggle complete task
 */
const validateToggleComplete = [
  body('completed')
    .isBoolean()
    .withMessage('The completed field must be true or false'),
];

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Obtener tareas del usuario
 *     description: Retorna todas las tareas del usuario autenticado con filtros, búsqueda y paginación
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: completed
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado de completado
 *         example: false
 *       - in: query
 *         name: category
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de categoría
 *         example: 1
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *         description: Filtrar por prioridad
 *         example: high
 *       - in: query
 *         name: due_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar por fecha límite
 *         example: "2025-08-20"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar en título y descripción
 *         example: "documentación"
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: IDs de etiquetas separados por coma
 *         example: "1,2,3"
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [created_at, updated_at, due_date, priority, title]
 *         description: Campo para ordenar
 *         example: created_at
 *       - in: query
 *         name: sort_direction
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Dirección del ordenamiento
 *         example: desc
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Número de página
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Elementos por página
 *         example: 20
 *     responses:
 *       200:
 *         description: Lista de tareas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TasksResponse'
 *             example:
 *               success: true
 *               data:
 *                 data:
 *                   - id: 1
 *                     title: "Completar documentación API"
 *                     description: "Crear documentación completa con Swagger"
 *                     completed: false
 *                     priority: "high"
 *                     due_date: "2025-08-20"
 *                     user_id: 1
 *                     category_id: 2
 *                     created_at: "2025-08-14T10:00:00Z"
 *                     updated_at: "2025-08-14T10:00:00Z"
 *                     category:
 *                       id: 2
 *                       name: "Trabajo"
 *                       color: "#3B82F6"
 *                     tags:
 *                       - id: 1
 *                         name: "urgente"
 *                         color: "#EF4444"
 *                 pagination:
 *                   page: 1
 *                   limit: 20
 *                   total: 1
 *                   totalPages: 1
 *                   hasNext: false
 *                   hasPrev: false
 *       401:
 *         description: Token no válido o no proporcionado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * @route   GET /api/tasks
 * @desc    Get all user tasks with filters and pagination
 * @access  Private
 * @query   ?completed=true&category=1&priority=high&due_date=2025-08-15
 *          &search=text&tags=1,2,3&sort_by=created_at&sort_direction=desc
 *          &page=1&limit=20
 */
router.get('/', ...validateTaskFilters, tasksController.getTasks as any);

/**
 * @swagger
 * /tasks/statistics:
 *   get:
 *     summary: Obtener estadísticas de tareas del usuario
 *     description: Retorna estadísticas resumidas de las tareas del usuario autenticado
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalTasks:
 *                       type: integer
 *                       description: Total de tareas
 *                       example: 25
 *                     completedTasks:
 *                       type: integer
 *                       description: Tareas completadas
 *                       example: 15
 *                     pendingTasks:
 *                       type: integer
 *                       description: Tareas pendientes
 *                       example: 10
 *                     overdueTasks:
 *                       type: integer
 *                       description: Tareas vencidas
 *                       example: 3
 *                     todayTasks:
 *                       type: integer
 *                       description: Tareas para hoy
 *                       example: 5
 *                     completionRate:
 *                       type: number
 *                       format: float
 *                       description: Porcentaje de completado
 *                       example: 60.0
 *             example:
 *               success: true
 *               data:
 *                 totalTasks: 25
 *                 completedTasks: 15
 *                 pendingTasks: 10
 *                 overdueTasks: 3
 *                 todayTasks: 5
 *                 completionRate: 60.0
 *       401:
 *         description: Token no válido o no proporcionado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * @route   GET /api/tasks/statistics
 * @desc    Get user task statistics
 * @access  Private
 */
router.get('/statistics', tasksController.getTaskStatistics as any);

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Obtener una tarea específica
 *     description: Retorna los detalles de una tarea específica del usuario autenticado
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID único de la tarea
 *         example: "6759a123b456c789d012e345"
 *     responses:
 *       200:
 *         description: Tarea obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TaskResponse'
 *             example:
 *               success: true
 *               data:
 *                 _id: "6759a123b456c789d012e345"
 *                 title: "Completar proyecto"
 *                 description: "Finalizar la documentación del proyecto"
 *                 completed: false
 *                 priority: "high"
 *                 dueDate: "2024-12-25T10:00:00.000Z"
 *                 categoryId: "6759a456b789c012d345e678"
 *                 tags: ["trabajo", "urgente"]
 *                 userId: "6759a789c012d345e678f901"
 *                 createdAt: "2024-12-11T10:30:00.000Z"
 *                 updatedAt: "2024-12-11T15:45:00.000Z"
 *       401:
 *         description: Token no válido o no proporcionado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Tarea no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * @route   GET /api/tasks/:id
 * @desc    Get a specific task by ID
 * @access  Private
 */
router.get('/:id', ...validateIdParam, tasksController.getTaskById as any);

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Crear nueva tarea
 *     description: Crea una nueva tarea para el usuario autenticado
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskCreation'
 *           example:
 *             title: "Revisar código del proyecto"
 *             description: "Hacer code review del nuevo feature"
 *             priority: "high"
 *             due_date: "2025-08-20"
 *             category_id: 1
 *             tags: [1, 3]
 *     responses:
 *       201:
 *         description: Tarea creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *                 message:
 *                   type: string
 *                   example: "Task created successfully"
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token no válido o no proporcionado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 * @body    { title, description?, category_id?, priority?, due_date?, tags? }
 */
router.post('/', ...validateCreateTask, tasksController.createTask as any);

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Actualizar una tarea
 *     description: Actualiza los detalles de una tarea específica del usuario autenticado
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID único de la tarea
 *         example: "6759a123b456c789d012e345"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskUpdate'
 *           examples:
 *             complete_task:
 *               summary: Marcar tarea como completada
 *               value:
 *                 completed: true
 *             update_full:
 *               summary: Actualización completa
 *               value:
 *                 title: "Proyecto actualizado"
 *                 description: "Nueva descripción del proyecto"
 *                 priority: "medium"
 *                 dueDate: "2024-12-30T10:00:00.000Z"
 *                 categoryId: "6759a456b789c012d345e678"
 *                 tags: ["trabajo", "importante"]
 *                 completed: false
 *     responses:
 *       200:
 *         description: Tarea actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TaskResponse'
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token no válido o no proporcionado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Tarea no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * @route   PUT /api/tasks/:id
 * @desc    Update a complete task
 * @access  Private
 * @body    { title?, description?, category_id?, priority?, due_date?, completed?, tags? }
 */
router.put('/:id', ...validateUpdateTask, tasksController.updateTask as any);

/**
 * @route   PATCH /api/tasks/:id/complete
 * @desc    Mark a task as completed or pending
 * @access  Private
 * @body    { completed: boolean }
 */
router.patch(
  '/:id/complete',
  ...validateIdParam,
  ...validateToggleComplete,
  tasksController.toggleCompleteTask as any
);

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Eliminar una tarea
 *     description: Elimina permanentemente una tarea específica del usuario autenticado
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID único de la tarea a eliminar
 *         example: "6759a123b456c789d012e345"
 *     responses:
 *       200:
 *         description: Tarea eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Tarea eliminada exitosamente"
 *             example:
 *               success: true
 *               message: "Tarea eliminada exitosamente"
 *       401:
 *         description: Token no válido o no proporcionado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Tarea no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Private
 */
router.delete('/:id', ...validateIdParam, tasksController.deleteTask as any);

export default router;
