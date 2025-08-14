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
 * @route   GET /api/tasks
 * @desc    Get all user tasks with filters and pagination
 * @access  Private
 * @query   ?completed=true&category=1&priority=high&due_date=2025-08-15
 *          &search=text&tags=1,2,3&sort_by=created_at&sort_direction=desc
 *          &page=1&limit=20
 */
router.get('/', ...validateTaskFilters, tasksController.getTasks as any);

/**
 * @route   GET /api/tasks/statistics
 * @desc    Get user task statistics
 * @access  Private
 */
router.get('/statistics', tasksController.getTaskStatistics as any);

/**
 * @route   GET /api/tasks/:id
 * @desc    Get a specific task by ID
 * @access  Private
 */
router.get('/:id', ...validateIdParam, tasksController.getTaskById as any);

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 * @body    { title, description?, category_id?, priority?, due_date?, tags? }
 */
router.post('/', ...validateCreateTask, tasksController.createTask as any);

/**
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
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Private
 */
router.delete('/:id', ...validateIdParam, tasksController.deleteTask as any);

export default router;
