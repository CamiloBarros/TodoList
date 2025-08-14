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
 * @route   GET /api/categories
 * @desc    Get all user categories
 * @access  Private
 */
router.get('/', categoriesController.getCategories as any);

/**
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
