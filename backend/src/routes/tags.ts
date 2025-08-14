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
 * @route   GET /api/tags
 * @desc    Get all user tags
 * @access  Private
 */
router.get('/', tagsController.getTags as any);

/**
 * @route   GET /api/tags/most-used
 * @desc    Get user's most used tags
 * @access  Private
 * @query   ?limit=10
 */
router.get('/most-used', tagsController.getMostUsedTags as any);

/**
 * @route   GET /api/tags/:id
 * @desc    Get a specific tag by ID
 * @access  Private
 */
router.get('/:id', ...validateIdParam, tagsController.getTagById as any);

/**
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
 * @route   POST /api/tags
 * @desc    Create a new tag
 * @access  Private
 * @body    { name, color? }
 */
router.post('/', ...validateCreateTag, tagsController.createTag as any);

/**
 * @route   PUT /api/tags/:id
 * @desc    Update a tag
 * @access  Private
 * @body    { name?, color? }
 */
router.put('/:id', ...validateUpdateTag, tagsController.updateTag as any);

/**
 * @route   DELETE /api/tags/:id
 * @desc    Delete a tag (only if it has no associated tasks)
 * @access  Private
 */
router.delete('/:id', ...validateIdParam, tagsController.deleteTag as any);

/**
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
