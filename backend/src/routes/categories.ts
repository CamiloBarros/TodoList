import { Router } from 'express';
import * as categoriesController from '../controllers/categoriesController';
import { authenticateToken } from '../middleware/auth';
import {
  validateCreateCategory,
  validateUpdateCategory,
  validateIdParam,
} from '../middleware/validation';

const router = Router();

// All category routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Obtener categorías del usuario
 *     description: Retorna todas las categorías del usuario autenticado
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorías obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *             example:
 *               success: true
 *               data:
 *                 - id: 1
 *                   name: "Trabajo"
 *                   description: "Tareas relacionadas con el trabajo"
 *                   color: "#3B82F6"
 *                   user_id: 1
 *                   created_at: "2025-08-14T10:00:00Z"
 *                   updated_at: "2025-08-14T10:00:00Z"
 *                 - id: 2
 *                   name: "Personal"
 *                   description: "Tareas personales"
 *                   color: "#EF4444"
 *                   user_id: 1
 *                   created_at: "2025-08-14T10:00:00Z"
 *                   updated_at: "2025-08-14T10:00:00Z"
 *       401:
 *         description: Token no válido o no proporcionado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * @route   GET /api/categories
 * @desc    Get all user categories
 * @access  Private
 */
router.get('/', categoriesController.getCategories as any);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Obtener categoría específica
 *     description: Retorna los detalles de una categoría específica del usuario
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID único de la categoría
 *         example: "6759a456b789c012d345e678"
 *     responses:
 *       200:
 *         description: Categoría obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *             example:
 *               success: true
 *               data:
 *                 id: 1
 *                 name: "Trabajo"
 *                 description: "Tareas relacionadas con el trabajo"
 *                 color: "#3B82F6"
 *                 user_id: 1
 *                 created_at: "2024-12-11T10:30:00.000Z"
 *                 updated_at: "2024-12-11T10:30:00.000Z"
 *       401:
 *         description: Token no válido o no proporcionado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Categoría no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * @route   GET /api/categories/:id
 * @desc    Get a specific category by ID
 * @access  Private
 */
router.get(
  '/:id',
  ...validateIdParam,
  categoriesController.getCategoryById as any
);

/**
 * @swagger
 * /categories/{id}/statistics:
 *   get:
 *     summary: Obtener estadísticas de categoría
 *     description: Retorna estadísticas de tareas asociadas a una categoría específica
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID único de la categoría
 *         example: "6759a456b789c012d345e678"
 *     responses:
 *       200:
 *         description: Estadísticas de categoría obtenidas exitosamente
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
 *                     categoryId:
 *                       type: string
 *                       example: "6759a456b789c012d345e678"
 *                     categoryName:
 *                       type: string
 *                       example: "Trabajo"
 *                     totalTasks:
 *                       type: integer
 *                       example: 15
 *                     completedTasks:
 *                       type: integer
 *                       example: 8
 *                     pendingTasks:
 *                       type: integer
 *                       example: 7
 *                     completionRate:
 *                       type: number
 *                       format: float
 *                       example: 53.3
 *             example:
 *               success: true
 *               data:
 *                 categoryId: "6759a456b789c012d345e678"
 *                 categoryName: "Trabajo"
 *                 totalTasks: 15
 *                 completedTasks: 8
 *                 pendingTasks: 7
 *                 completionRate: 53.3
 *       401:
 *         description: Token no válido o no proporcionado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Categoría no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * @route   GET /api/categories/:id/statistics
 * @desc    Get category statistics (number of tasks)
 * @access  Private
 */
router.get(
  '/:id/statistics',
  ...validateIdParam,
  categoriesController.getCategoryStatistics as any
);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Crear nueva categoría
 *     description: Crea una nueva categoría para el usuario autenticado
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryCreate'
 *           examples:
 *             minimal:
 *               summary: Categoría básica
 *               value:
 *                 name: "Trabajo"
 *             complete:
 *               summary: Categoría completa
 *               value:
 *                 name: "Proyectos Personales"
 *                 description: "Proyectos de desarrollo personal"
 *                 color: "#10B981"
 *     responses:
 *       201:
 *         description: Categoría creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *             example:
 *               success: true
 *               data:
 *                 id: 3
 *                 name: "Proyectos Personales"
 *                 description: "Proyectos de desarrollo personal"
 *                 color: "#10B981"
 *                 user_id: 1
 *                 created_at: "2024-12-11T10:30:00.000Z"
 *                 updated_at: "2024-12-11T10:30:00.000Z"
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
 *       409:
 *         description: Ya existe una categoría con ese nombre
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * @route   POST /api/categories
 * @desc    Create a new category
 * @access  Private
 * @body    { name, description?, color? }
 */
router.post(
  '/',
  ...validateCreateCategory,
  categoriesController.createCategory as any
);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Actualizar categoría
 *     description: Actualiza los detalles de una categoría específica del usuario
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID único de la categoría
 *         example: "6759a456b789c012d345e678"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryUpdate'
 *           examples:
 *             name_only:
 *               summary: Actualizar solo nombre
 *               value:
 *                 name: "Trabajo Remoto"
 *             complete:
 *               summary: Actualización completa
 *               value:
 *                 name: "Proyectos Importantes"
 *                 description: "Proyectos con alta prioridad"
 *                 color: "#F59E0B"
 *     responses:
 *       200:
 *         description: Categoría actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *             example:
 *               success: true
 *               data:
 *                 id: 1
 *                 name: "Proyectos Importantes"
 *                 description: "Proyectos con alta prioridad"
 *                 color: "#F59E0B"
 *                 user_id: 1
 *                 created_at: "2024-12-11T10:30:00.000Z"
 *                 updated_at: "2024-12-11T15:45:00.000Z"
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
 *         description: Categoría no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Ya existe una categoría con ese nombre
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * @route   PUT /api/categories/:id
 * @desc    Update a category
 * @access  Private
 * @body    { name?, description?, color? }
 */
router.put(
  '/:id',
  ...validateUpdateCategory,
  categoriesController.updateCategory as any
);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Eliminar categoría
 *     description: Elimina una categoría solo si no tiene tareas asociadas
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID único de la categoría a eliminar
 *         example: "6759a456b789c012d345e678"
 *     responses:
 *       200:
 *         description: Categoría eliminada exitosamente
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
 *                   example: "Categoría eliminada exitosamente"
 *             example:
 *               success: true
 *               message: "Categoría eliminada exitosamente"
 *       400:
 *         description: La categoría tiene tareas asociadas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: "No se puede eliminar la categoría porque tiene tareas asociadas"
 *       401:
 *         description: Token no válido o no proporcionado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Categoría no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * @route   DELETE /api/categories/:id
 * @desc    Delete a category (only if it has no associated tasks)
 * @access  Private
 */
router.delete(
  '/:id',
  ...validateIdParam,
  categoriesController.deleteCategory as any
);

/**
 * @swagger
 * /categories/{id}/force:
 *   delete:
 *     summary: Eliminar categoría forzadamente
 *     description: Elimina una categoría forzadamente moviendo todas las tareas asociadas a "sin categoría"
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID único de la categoría a eliminar forzadamente
 *         example: "6759a456b789c012d345e678"
 *     responses:
 *       200:
 *         description: Categoría eliminada forzadamente y tareas movidas exitosamente
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
 *                   example: "Categoría eliminada forzadamente y tareas movidas a 'sin categoría'"
 *                 tasksAffected:
 *                   type: integer
 *                   description: Número de tareas que fueron movidas
 *                   example: 5
 *             example:
 *               success: true
 *               message: "Categoría eliminada forzadamente y tareas movidas a 'sin categoría'"
 *               tasksAffected: 5
 *       401:
 *         description: Token no válido o no proporcionado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Categoría no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * @route   DELETE /api/categories/:id/force
 * @desc    Delete a category forcefully (moves tasks to "no category")
 * @access  Private
 */
router.delete(
  '/:id/force',
  ...validateIdParam,
  categoriesController.forceCategoryDeletion as any
);

export default router;
