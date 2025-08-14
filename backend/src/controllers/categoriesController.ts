import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import * as categoriesService from '../services/categoriesService';

/**
 * Categories Controller
 * Handles all routes related to category management
 */

/**
 * GET /api/categories
 * Get all user categories
 */
export const getCategories = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const result = await categoriesService.getCategories(req.user.id);

    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.data,
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          message: result.error,
          type: 'INTERNAL_SERVER_ERROR',
          statusCode: 500,
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error('Error in get categories controller:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        type: 'INTERNAL_SERVER_ERROR',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * GET /api/categories/:id
 * Get a specific category by ID
 */
export const getCategoryById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const categoryId = parseInt(req.params.id || '0');

    if (isNaN(categoryId)) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Invalid category ID',
          type: 'VALIDATION_ERROR',
          statusCode: 400,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const result = await categoriesService.getCategoryById(
      categoryId,
      req.user.id
    );

    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.data,
      });
    } else {
      const statusCode = result.error === 'Category not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: {
          message: result.error,
          type: statusCode === 404 ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
          statusCode,
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error('Error in get category by ID controller:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        type: 'INTERNAL_SERVER_ERROR',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * POST /api/categories
 * Create a new category
 */
export const createCategory = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, description, color } = req.body;

    const result = await categoriesService.createCategory(req.user.id, {
      name,
      description,
      color,
    });

    if (result.success) {
      res.status(201).json({
        success: true,
        data: result.data,
        message: result.message,
      });
    } else {
      const statusCode =
        result.error === 'A category with that name already exists' ? 409 : 500;
      res.status(statusCode).json({
        success: false,
        error: {
          message: result.error,
          type: statusCode === 409 ? 'CONFLICT' : 'INTERNAL_SERVER_ERROR',
          statusCode,
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error('Error in create category controller:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        type: 'INTERNAL_SERVER_ERROR',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * PUT /api/categories/:id
 * Update an existing category
 */
export const updateCategory = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const categoryId = parseInt(req.params.id || '0');

    if (isNaN(categoryId)) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Invalid category ID',
          type: 'VALIDATION_ERROR',
          statusCode: 400,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const { name, description, color } = req.body;

    const result = await categoriesService.updateCategory(
      categoryId,
      req.user.id,
      {
        name,
        description,
        color,
      }
    );

    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.data,
        message: result.message,
      });
    } else {
      const statusCode =
        result.error === 'Category not found'
          ? 404
          : result.error === 'A category with that name already exists'
            ? 409
            : result.error === 'No data to update'
              ? 400
              : 500;

      res.status(statusCode).json({
        success: false,
        error: {
          message: result.error,
          type:
            statusCode === 404
              ? 'NOT_FOUND'
              : statusCode === 409
                ? 'CONFLICT'
                : statusCode === 400
                  ? 'VALIDATION_ERROR'
                  : 'INTERNAL_SERVER_ERROR',
          statusCode,
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error('Error in update category controller:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        type: 'INTERNAL_SERVER_ERROR',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * DELETE /api/categories/:id
 * Delete a category (only if it has no associated tasks)
 */
export const deleteCategory = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const categoryId = parseInt(req.params.id || '0');

    if (isNaN(categoryId)) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Invalid category ID',
          type: 'VALIDATION_ERROR',
          statusCode: 400,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const result = await categoriesService.deleteCategory(
      categoryId,
      req.user.id
    );

    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } else {
      const statusCode =
        result.error === 'Category not found'
          ? 404
          : result.error?.includes('has') && result.error?.includes('task')
            ? 409
            : 500;

      res.status(statusCode).json({
        success: false,
        error: {
          message: result.error,
          type:
            statusCode === 404
              ? 'NOT_FOUND'
              : statusCode === 409
                ? 'CONFLICT'
                : 'INTERNAL_SERVER_ERROR',
          statusCode,
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error('Error in delete category controller:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        type: 'INTERNAL_SERVER_ERROR',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * DELETE /api/categories/:id/force
 * Delete a category forcefully (moves tasks to "no category")
 */
export const forceCategoryDeletion = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const categoryId = parseInt(req.params.id || '0');

    if (isNaN(categoryId)) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Invalid category ID',
          type: 'VALIDATION_ERROR',
          statusCode: 400,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const result = await categoriesService.deleteCategoryWithTasks(
      categoryId,
      req.user.id
    );

    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } else {
      const statusCode = result.error === 'Category not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: {
          message: result.error,
          type: statusCode === 404 ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
          statusCode,
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error('Error in force category deletion controller:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        type: 'INTERNAL_SERVER_ERROR',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * GET /api/categories/:id/statistics
 * Get category statistics
 */
export const getCategoryStatistics = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const categoryId = parseInt(req.params.id || '0');

    if (isNaN(categoryId)) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Invalid category ID',
          type: 'VALIDATION_ERROR',
          statusCode: 400,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const result = await categoriesService.getCategoryStatistics(
      categoryId,
      req.user.id
    );

    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.data,
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          message: result.error,
          type: 'INTERNAL_SERVER_ERROR',
          statusCode: 500,
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error('Error in get category statistics controller:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        type: 'INTERNAL_SERVER_ERROR',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
    });
  }
};
