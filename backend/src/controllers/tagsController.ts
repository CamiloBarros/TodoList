import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthenticatedRequest } from '../types';
import * as tagsService from '../services/tagsService';

/**
 * Get all user tags
 */
export const getTags = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user.id;
    const tags = await tagsService.getTags(userId);

    res.status(200).json({
      success: true,
      data: {
        tags,
        total: tags.length,
      },
      message:
        tags.length > 0 ? `Found ${tags.length} tag(s)` : 'No tags found',
    });
  } catch (error: any) {
    console.error('Error getting tags:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error getting tags',
        type: 'INTERNAL_SERVER_ERROR',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Get a specific tag by ID
 */
export const getTagById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Invalid input data',
          type: 'VALIDATION_ERROR',
          statusCode: 400,
          timestamp: new Date().toISOString(),
          details: errors.array(),
        },
      });
      return;
    }

    const userId = req.user.id;
    const tagId = parseInt(req.params.id as string);

    const tag = await tagsService.getTagById(tagId, userId);

    if (!tag) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Tag not found',
          type: 'NOT_FOUND_ERROR',
          statusCode: 404,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: tag,
      message: 'Tag retrieved successfully',
    });
  } catch (error: any) {
    console.error('Error getting tag by ID:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error getting the tag',
        type: 'INTERNAL_SERVER_ERROR',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Create a new tag
 */
export const createTag = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Invalid input data',
          type: 'VALIDATION_ERROR',
          statusCode: 400,
          timestamp: new Date().toISOString(),
          details: errors.array(),
        },
      });
      return;
    }

    const userId = req.user.id;
    const tagData = req.body;

    const newTag = await tagsService.createTag(tagData, userId);

    res.status(201).json({
      success: true,
      data: newTag,
      message: `Tag "${newTag.name}" created successfully`,
    });
  } catch (error: any) {
    console.error('Error creating tag:', error);

    // Handle specific errors
    if (error.code === 'VALIDATION_ERROR') {
      res.status(400).json({
        success: false,
        error: {
          message: error.message,
          type: 'VALIDATION_ERROR',
          statusCode: 400,
          timestamp: new Date().toISOString(),
          details: error.details,
        },
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error creating the tag',
        type: 'INTERNAL_SERVER_ERROR',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Update an existing tag
 */
export const updateTag = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Invalid input data',
          type: 'VALIDATION_ERROR',
          statusCode: 400,
          timestamp: new Date().toISOString(),
          details: errors.array(),
        },
      });
      return;
    }

    const userId = req.user.id;
    const tagId = parseInt(req.params.id as string);
    const tagData = req.body;

    const updatedTag = await tagsService.updateTag(tagId, tagData, userId);

    if (!updatedTag) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Tag not found',
          type: 'NOT_FOUND_ERROR',
          statusCode: 404,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: updatedTag,
      message: `Tag "${updatedTag.name}" updated successfully`,
    });
  } catch (error: any) {
    console.error('Error updating tag:', error);

    // Handle specific errors
    if (error.code === 'VALIDATION_ERROR') {
      res.status(400).json({
        success: false,
        error: {
          message: error.message,
          type: 'VALIDATION_ERROR',
          statusCode: 400,
          timestamp: new Date().toISOString(),
          details: error.details,
        },
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error updating the tag',
        type: 'INTERNAL_SERVER_ERROR',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Delete a tag (only if it has no associated tasks)
 */
export const deleteTag = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Invalid input data',
          type: 'VALIDATION_ERROR',
          statusCode: 400,
          timestamp: new Date().toISOString(),
          details: errors.array(),
        },
      });
      return;
    }

    const userId = req.user.id;
    const tagId = parseInt(req.params.id as string);

    const result = await tagsService.deleteTag(tagId, userId);

    if (!result.deleted) {
      if (result.message === 'Tag not found') {
        res.status(404).json({
          success: false,
          error: {
            message: result.message,
            type: 'NOT_FOUND_ERROR',
            statusCode: 404,
            timestamp: new Date().toISOString(),
          },
        });
      } else {
        res.status(409).json({
          success: false,
          error: {
            message: result.message,
            type: 'CONFLICT_ERROR',
            statusCode: 409,
            timestamp: new Date().toISOString(),
          },
        });
      }
      return;
    }

    res.status(200).json({
      success: true,
      data: { deleted: true },
      message: result.message,
    });
  } catch (error: any) {
    console.error('Error deleting tag:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error deleting the tag',
        type: 'INTERNAL_SERVER_ERROR',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Delete a tag forcefully (removing its associations as well)
 */
export const forceDeleteTag = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Invalid input data',
          type: 'VALIDATION_ERROR',
          statusCode: 400,
          timestamp: new Date().toISOString(),
          details: errors.array(),
        },
      });
      return;
    }

    const userId = req.user.id;
    const tagId = parseInt(req.params.id as string);

    const result = await tagsService.forceDeleteTag(tagId, userId);

    if (!result.deleted) {
      res.status(404).json({
        success: false,
        error: {
          message: result.message,
          type: 'NOT_FOUND_ERROR',
          statusCode: 404,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        deleted: true,
        affectedTasks: result.affectedTasks,
      },
      message: result.message,
    });
  } catch (error: any) {
    console.error('Error force deleting tag:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error deleting the tag',
        type: 'INTERNAL_SERVER_ERROR',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Get tag statistics
 */
export const getTagStatistics = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Invalid input data',
          type: 'VALIDATION_ERROR',
          statusCode: 400,
          timestamp: new Date().toISOString(),
          details: errors.array(),
        },
      });
      return;
    }

    const userId = req.user.id;
    const tagId = parseInt(req.params.id as string);

    const statistics = await tagsService.getTagStatistics(tagId, userId);

    if (!statistics) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Tag not found',
          type: 'NOT_FOUND_ERROR',
          statusCode: 404,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: statistics,
      message: 'Tag statistics retrieved successfully',
    });
  } catch (error: any) {
    console.error('Error getting tag statistics:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error getting statistics',
        type: 'INTERNAL_SERVER_ERROR',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Get user's most used tags
 */
export const getMostUsedTags = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limite as string) || 10;

    // Validate limit
    if (limit < 1 || limit > 50) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Limit must be a number between 1 and 50',
          type: 'VALIDATION_ERROR',
          statusCode: 400,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const tags = await tagsService.getMostUsedTags(userId, limit);

    res.status(200).json({
      success: true,
      data: {
        tags,
        total: tags.length,
        limit,
      },
      message:
        tags.length > 0
          ? `Found ${tags.length} most used tag(s)`
          : 'No tags with usage found',
    });
  } catch (error: any) {
    console.error('Error getting most used tags:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error getting most used tags',
        type: 'INTERNAL_SERVER_ERROR',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
    });
  }
};
