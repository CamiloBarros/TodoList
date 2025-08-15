import { Response } from 'express';
import { AuthenticatedRequest, TaskFilters } from '../types';
import * as tasksService from '../services/tasksService';

/**
 * Tasks Controller
 * Handles all routes related to task management
 */

/**
 * GET /api/tasks
 * Get all user tasks with filters and pagination
 */
export const getTasks = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const filters: TaskFilters = {
      completed: req.query.completed
        ? req.query.completed === 'true'
        : undefined,
      category: req.query.category
        ? parseInt(req.query.category as string)
        : undefined,
      priority: req.query.priority as any,
      due_date: req.query.due_date as string,
      search: req.query.search as string,
      tags: req.query.tags as string,
      sort_by: req.query.sort_by as any,
      sort_direction: req.query.sort_direction as any,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    };

    const result = await tasksService.getTasks(req.user.id, filters);

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
    console.error('Error in get tasks controller:', error);
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
 * GET /api/tasks/:id
 * Get a specific task by ID
 */
export const getTaskById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const taskId = parseInt(req.params.id || '0');

    if (isNaN(taskId)) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Invalid task ID',
          type: 'VALIDATION_ERROR',
          statusCode: 400,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const result = await tasksService.getTaskById(taskId, req.user.id);

    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.data,
      });
    } else {
      const statusCode = result.error === 'Task not found' ? 404 : 500;
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
    console.error('Error in get task by ID controller:', error);
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
 * POST /api/tasks
 * Create a new task
 */
export const createTask = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, description, category_id, priority, due_date, tags } =
      req.body;

    const result = await tasksService.createTask(req.user.id, {
      title,
      description,
      category_id,
      priority,
      due_date,
      tags,
    });

    if (result.success) {
      res.status(201).json({
        success: true,
        data: result.data,
        message: result.message,
      });
    } else {
      const statusCode =
        result.error?.includes('not found') ||
        result.error?.includes('no pertenece') ||
        result.error?.includes('Due date must be in the future')
          ? 422
          : 500;

      res.status(statusCode).json({
        success: false,
        error: {
          message: result.error,
          type:
            statusCode === 422 ? 'VALIDATION_ERROR' : 'INTERNAL_SERVER_ERROR',
          statusCode,
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error('Error in create task controller:', error);
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
 * PUT /api/tasks/:id
 * Updates an existing task
 */
export const updateTask = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const taskId = parseInt(req.params.id || '0');

    if (isNaN(taskId)) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Invalid task ID',
          type: 'VALIDATION_ERROR',
          statusCode: 400,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const {
      title,
      description,
      category_id,
      priority,
      due_date,
      completed,
      tags,
    } = req.body;

    const result = await tasksService.updateTask(taskId, req.user.id, {
      title,
      description,
      category_id,
      priority,
      due_date,
      completed,
      tags,
    });

    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.data,
        message: result.message,
      });
    } else {
      const statusCode =
        result.error === 'Task not found'
          ? 404
          : result.error?.includes('not found') ||
              result.error?.includes('no pertenece') ||
              result.error?.includes('No hay datos') ||
              result.error?.includes('Due date must be in the future')
            ? 422
            : 500;

      res.status(statusCode).json({
        success: false,
        error: {
          message: result.error,
          type:
            statusCode === 404
              ? 'NOT_FOUND'
              : statusCode === 422
                ? 'VALIDATION_ERROR'
                : 'INTERNAL_SERVER_ERROR',
          statusCode,
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error('Error in update task controller:', error);
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
 * DELETE /api/tasks/:id
 * Deletes a task
 */
export const deleteTask = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const taskId = parseInt(req.params.id || '0');

    if (isNaN(taskId)) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Invalid task ID',
          type: 'VALIDATION_ERROR',
          statusCode: 400,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const result = await tasksService.deleteTask(taskId, req.user.id);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } else {
      const statusCode = result.error === 'Task not found' ? 404 : 500;
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
    console.error('Error in delete task controller:', error);
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
 * PATCH /api/tasks/:id/complete
 * Mark a task as completed or pending
 */
export const toggleCompleteTask = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const taskId = parseInt(req.params.id || '0');

    if (isNaN(taskId)) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Invalid task ID',
          type: 'VALIDATION_ERROR',
          statusCode: 400,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const { completed } = req.body;

    if (typeof completed !== 'boolean') {
      res.status(400).json({
        success: false,
        error: {
          message: 'The completed field must be true or false',
          type: 'VALIDATION_ERROR',
          statusCode: 400,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const result = await tasksService.updateTask(taskId, req.user.id, {
      completed,
    });

    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.data,
        message: `Task marked as ${completed ? 'completed' : 'pending'}`,
      });
    } else {
      const statusCode = result.error === 'Task not found' ? 404 : 500;
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
    console.error('Error in toggle complete task controller:', error);
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
 * GET /api/tasks/statistics
 * Get user task statistics
 */
export const getTaskStatistics = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const result = await tasksService.getTaskStatistics(req.user.id);

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
    console.error('Error in get task statistics controller:', error);
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
