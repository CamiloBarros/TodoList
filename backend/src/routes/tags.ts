import { Router } from 'express';
import * as tagsController from '../controllers/tagsController';
import { authenticateToken } from '../middleware/auth';
import {
  validateCreateTag,
  validateUpdateTag,
  validateIdParam,
} from '../middleware/validation';

const router = Router();

// All tag routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /tags:
 *   get:
 *     summary: Obtener tags del usuario
 *     description: Retorna todas las etiquetas del usuario autenticado
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tags obtenida exitosamente
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
 *                     $ref: '#/components/schemas/Tag'
 *             example:
 *               success: true
 *               data:
 *                 - id: 1
 *                   name: "urgente"
 *                   color: "#EF4444"
 *                   user_id: 1
 *                   created_at: "2024-12-11T10:00:00.000Z"
 *                   updated_at: "2024-12-11T10:00:00.000Z"
 *                 - id: 2
 *                   name: "trabajo"
 *                   color: "#3B82F6"
 *                   user_id: 1
 *                   created_at: "2024-12-11T10:00:00.000Z"
 *                   updated_at: "2024-12-11T10:00:00.000Z"
 *       401:
 *         description: Token no válido o no proporcionado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * @route   GET /api/tags
 * @desc    Get all user tags
 * @access  Private
 */
router.get('/', tagsController.getTags as any);

/**
 * @swagger
 * /tags/most-used:
 *   get:
 *     summary: Obtener tags más utilizados
 *     description: Retorna las etiquetas más utilizadas por el usuario
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Número máximo de tags a retornar
 *         example: 10
 *     responses:
 *       200:
 *         description: Tags más utilizados obtenidos exitosamente
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "urgente"
 *                       color:
 *                         type: string
 *                         example: "#EF4444"
 *                       usage_count:
 *                         type: integer
 *                         description: Número de tareas que usan este tag
 *                         example: 15
 *             example:
 *               success: true
 *               data:
 *                 - id: 1
 *                   name: "urgente"
 *                   color: "#EF4444"
 *                   usage_count: 15
 *                 - id: 2
 *                   name: "trabajo"
 *                   color: "#3B82F6"
 *                   usage_count: 12
 *       401:
 *         description: Token no válido o no proporcionado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * @route   GET /api/tags/most-used
 * @desc    Get user's most used tags
 * @access  Private
 * @query   ?limit=10
 */
router.get('/most-used', tagsController.getMostUsedTags as any);

/**
 * @swagger
 * /tags/{id}:
 *   get:
 *     summary: Obtener tag específico
 *     description: Retorna los detalles de un tag específico del usuario
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID único del tag
 *         example: "6759a789c012d345e678f901"
 *     responses:
 *       200:
 *         description: Tag obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Tag'
 *             example:
 *               success: true
 *               data:
 *                 id: 1
 *                 name: "urgente"
 *                 color: "#EF4444"
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
 *         description: Tag no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * @route   GET /api/tags/:id
 * @desc    Get a specific tag by ID
 * @access  Private
 */
router.get('/:id', ...validateIdParam, tagsController.getTagById as any);

/**
 * @swagger
 * /tags/{id}/statistics:
 *   get:
 *     summary: Obtener estadísticas de tag
 *     description: Retorna estadísticas de tareas asociadas a un tag específico
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID único del tag
 *         example: "6759a789c012d345e678f901"
 *     responses:
 *       200:
 *         description: Estadísticas de tag obtenidas exitosamente
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
 *                     tagId:
 *                       type: string
 *                       example: "6759a789c012d345e678f901"
 *                     tagName:
 *                       type: string
 *                       example: "urgente"
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
 *                 tagId: "6759a789c012d345e678f901"
 *                 tagName: "urgente"
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
 *         description: Tag no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * @route   GET /api/tags/:id/statistics
 * @desc    Get tag statistics (number of tasks by status)
 * @access  Private
 */
router.get(
  '/:id/statistics',
  ...validateIdParam,
  tagsController.getTagStatistics as any
);

/**
 * @swagger
 * /tags:
 *   post:
 *     summary: Crear nuevo tag
 *     description: Crea una nueva etiqueta para el usuario autenticado
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TagCreate'
 *           examples:
 *             minimal:
 *               summary: Tag básico
 *               value:
 *                 name: "urgente"
 *             complete:
 *               summary: Tag completo
 *               value:
 *                 name: "proyecto-importante"
 *                 color: "#F59E0B"
 *     responses:
 *       201:
 *         description: Tag creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Tag'
 *             example:
 *               success: true
 *               data:
 *                 id: 3
 *                 name: "proyecto-importante"
 *                 color: "#F59E0B"
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
 *         description: Ya existe un tag con ese nombre
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * @route   POST /api/tags
 * @desc    Create a new tag
 * @access  Private
 * @body    { name, color? }
 */
router.post('/', ...validateCreateTag, tagsController.createTag as any);

/**
 * @swagger
 * /tags/{id}:
 *   put:
 *     summary: Actualizar tag
 *     description: Actualiza los detalles de un tag específico del usuario
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID único del tag
 *         example: "6759a789c012d345e678f901"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TagUpdate'
 *           examples:
 *             name_only:
 *               summary: Actualizar solo nombre
 *               value:
 *                 name: "super-urgente"
 *             complete:
 *               summary: Actualización completa
 *               value:
 *                 name: "muy-importante"
 *                 color: "#DC2626"
 *     responses:
 *       200:
 *         description: Tag actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Tag'
 *             example:
 *               success: true
 *               data:
 *                 id: 1
 *                 name: "muy-importante"
 *                 color: "#DC2626"
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
 *         description: Tag no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Ya existe un tag con ese nombre
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * @route   PUT /api/tags/:id
 * @desc    Update a tag
 * @access  Private
 * @body    { name?, color? }
 */
router.put('/:id', ...validateUpdateTag, tagsController.updateTag as any);

/**
 * @swagger
 * /tags/{id}:
 *   delete:
 *     summary: Eliminar tag
 *     description: Elimina un tag solo si no está asociado con ninguna tarea
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID único del tag a eliminar
 *         example: "6759a789c012d345e678f901"
 *     responses:
 *       200:
 *         description: Tag eliminado exitosamente
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
 *                   example: "Tag eliminado exitosamente"
 *             example:
 *               success: true
 *               message: "Tag eliminado exitosamente"
 *       400:
 *         description: El tag tiene tareas asociadas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: "No se puede eliminar el tag porque tiene tareas asociadas"
 *       401:
 *         description: Token no válido o no proporcionado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Tag no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * @route   DELETE /api/tags/:id
 * @desc    Delete a tag (only if it has no associated tasks)
 * @access  Private
 */
router.delete('/:id', ...validateIdParam, tagsController.deleteTag as any);

/**
 * @swagger
 * /tags/{id}/force:
 *   delete:
 *     summary: Eliminar tag forzadamente
 *     description: Elimina un tag forzadamente removiendo todas las asociaciones con tareas
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID único del tag a eliminar forzadamente
 *         example: "6759a789c012d345e678f901"
 *     responses:
 *       200:
 *         description: Tag eliminado forzadamente y asociaciones removidas exitosamente
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
 *                   example: "Tag eliminado forzadamente y asociaciones removidas"
 *                 tasksAffected:
 *                   type: integer
 *                   description: Número de tareas que tenían este tag
 *                   example: 8
 *             example:
 *               success: true
 *               message: "Tag eliminado forzadamente y asociaciones removidas"
 *               tasksAffected: 8
 *       401:
 *         description: Token no válido o no proporcionado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Tag no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * @route   DELETE /api/tags/:id/force
 * @desc    Delete a tag forcefully (removing associations with tasks)
 * @access  Private
 */
router.delete(
  '/:id/force',
  ...validateIdParam,
  tagsController.forceDeleteTag as any
);

export default router;
