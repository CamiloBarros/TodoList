import { query, transaction } from '../config/database';
import {
  Task,
  TaskCreation,
  TaskUpdate,
  TaskFilters,
  PaginatedResult,
  ApiResponse,
  Priority,
} from '../types';
import appConfig from '../config/env';

/**
 * Tasks Service
 * Handles all CRUD and query operations for tasks
 */

/**
 * Gets all user tasks with filters and pagination
 */
export const getTasks = async (
  userId: number,
  filters: TaskFilters = {}
): Promise<ApiResponse<PaginatedResult<Task>>> => {
  try {
    const {
      completed,
      category,
      priority,
      due_date,
      search,
      tags,

      sort_by = 'created_at',
      sort_direction = 'desc',
      page = 1,
      limit = appConfig.pagination.defaultPageSize,
    } = filters;

    // Validate pagination limit
    const finalLimit = Math.min(limit, appConfig.pagination.maxPageSize);
    const offset = (page - 1) * finalLimit;

    // Build base query with JOIN for categories
    let queryText = `
      SELECT 
        t.id, t.user_id, t.category_id, t.title, t.description,
        t.completed, t.priority, t.due_date, t.completed_at,
        t.created_at, t.updated_at,
        c.name as category_name, c.color as category_color,
        COALESCE(
          JSON_AGG(
            CASE WHEN e.id IS NOT NULL THEN
              JSON_BUILD_OBJECT('id', e.id, 'name', e.name, 'color', e.color)
            END
          ) FILTER (WHERE e.id IS NOT NULL), '[]'
        ) as tags
      FROM tasks t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN task_tags te ON t.id = te.task_id
      LEFT JOIN tags e ON te.tag_id = e.id
      WHERE t.user_id = $1
    `;

    const params: any[] = [userId];
    let paramCounter = 2;

    // Apply filters
    if (completed !== undefined) {
      queryText += ` AND t.completed = $${paramCounter}`;
      params.push(completed);
      paramCounter++;
    }

    if (category) {
      queryText += ` AND t.category_id = $${paramCounter}`;
      params.push(category);
      paramCounter++;
    }

    if (priority) {
      queryText += ` AND t.priority = $${paramCounter}`;
      params.push(priority);
      paramCounter++;
    }

    if (due_date) {
      queryText += ` AND DATE(t.due_date) = DATE($${paramCounter})`;
      params.push(due_date);
      paramCounter++;
    }

    if (search) {
      queryText += ` AND (t.title ILIKE $${paramCounter} OR t.description ILIKE $${paramCounter})`;
      params.push(`%${search}%`);
      paramCounter++;
    }

    if (tags) {
      const tagIds = tags.split(',').map((id) => parseInt(id.trim()));
      queryText += ` AND t.id IN (
        SELECT DISTINCT te2.task_id 
        FROM task_tags te2 
        WHERE te2.tag_id = ANY($${paramCounter})
      )`;
      params.push(tagIds);
      paramCounter++;
    }

    // Group by task
    queryText += ` GROUP BY t.id, c.name, c.color`;

    // Sorting
    const validSort = ['created_at', 'due_date', 'priority', 'title'];
    const validSortField = validSort.includes(sort_by) ? sort_by : 'created_at';
    const validDirection = sort_direction === 'asc' ? 'ASC' : 'DESC';

    // Special sorting for priority
    if (validSortField === 'priority') {
      queryText += ` ORDER BY 
        CASE t.priority 
          WHEN 'high' THEN 3 
          WHEN 'medium' THEN 2 
          WHEN 'low' THEN 1 
        END ${validDirection}`;
    } else {
      queryText += ` ORDER BY t.${validSortField} ${validDirection}`;
    }

    // Pagination
    queryText += ` LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`;
    params.push(finalLimit, offset);

    // Execute main query
    const result = await query(queryText, params);

    // Query to count total
    let countQuery = `
      SELECT COUNT(DISTINCT t.id) as total
      FROM tasks t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN task_tags te ON t.id = te.task_id
      LEFT JOIN tags e ON te.tag_id = e.id
      WHERE t.user_id = $1
    `;

    // Apply the same filters for counting
    let countParams: any[] = [userId];
    let countParamCounter = 2;

    if (completed !== undefined) {
      countQuery += ` AND t.completed = $${countParamCounter}`;
      countParams.push(completed);
      countParamCounter++;
    }

    if (category) {
      countQuery += ` AND t.category_id = $${countParamCounter}`;
      countParams.push(category);
      countParamCounter++;
    }

    if (priority) {
      countQuery += ` AND t.priority = $${countParamCounter}`;
      countParams.push(priority);
      countParamCounter++;
    }

    if (due_date) {
      countQuery += ` AND DATE(t.due_date) = DATE($${countParamCounter})`;
      countParams.push(due_date);
      countParamCounter++;
    }

    if (search) {
      countQuery += ` AND (t.title ILIKE $${countParamCounter} OR t.description ILIKE $${countParamCounter})`;
      countParams.push(`%${search}%`);
      countParamCounter++;
    }

    if (tags) {
      const tagIds = tags.split(',').map((id) => parseInt(id.trim()));
      countQuery += ` AND t.id IN (
        SELECT DISTINCT te2.task_id 
        FROM task_tags te2 
        WHERE te2.tag_id = ANY($${countParamCounter})
      )`;
      countParams.push(tagIds);
      countParamCounter++;
    }

    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    // Process results
    const tasks: Task[] = result.rows.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      category_id: row.category_id,
      title: row.title,
      description: row.description,
      completed: row.completed,
      priority: row.priority,
      due_date: row.due_date,
      completed_at: row.completed_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
      category: row.category_id
        ? {
            id: row.category_id,
            user_id: row.user_id,
            name: row.category_name,
            color: row.category_color,
            created_at: row.created_at,
            updated_at: row.updated_at,
          }
        : undefined,
      tags: row.tags || [],
    }));

    const totalPages = Math.ceil(total / finalLimit);

    return {
      success: true,
      data: {
        data: tasks,
        pagination: {
          page,
          limit: finalLimit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    };
  } catch (error) {
    console.error('Error getting tasks:', error);
    return {
      success: false,
      error: 'Internal server error',
    };
  }
};

/**
 * Gets a specific task by ID
 */
export const getTaskById = async (
  taskId: number,
  userId: number
): Promise<ApiResponse<Task>> => {
  try {
    const queryText = `
      SELECT 
        t.id, t.user_id, t.category_id, t.title, t.description,
        t.completed, t.priority, t.due_date, t.completed_at,
        t.created_at, t.updated_at,
        c.name as category_name, c.color as category_color,
        COALESCE(
          JSON_AGG(
            CASE WHEN e.id IS NOT NULL THEN
              JSON_BUILD_OBJECT('id', e.id, 'name', e.name, 'color', e.color)
            END
          ) FILTER (WHERE e.id IS NOT NULL), '[]'
        ) as tags
      FROM tasks t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN task_tags te ON t.id = te.task_id
      LEFT JOIN tags e ON te.tag_id = e.id
      WHERE t.id = $1 AND t.user_id = $2
      GROUP BY t.id, c.name, c.color
    `;

    const result = await query(queryText, [taskId, userId]);

    if (result.rows.length === 0) {
      return {
        success: false,
        error: 'Task not found',
      };
    }

    const row = result.rows[0];
    const task: Task = {
      id: row.id,
      user_id: row.user_id,
      category_id: row.category_id,
      title: row.title,
      description: row.description,
      completed: row.completed,
      priority: row.priority,
      due_date: row.due_date,
      completed_at: row.completed_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
      category: row.category_id
        ? {
            id: row.category_id,
            user_id: row.user_id,
            name: row.category_name,
            color: row.category_color,
            created_at: row.created_at,
            updated_at: row.updated_at,
          }
        : undefined,
      tags: row.tags || [],
    };

    return {
      success: true,
      data: task,
    };
  } catch (error) {
    console.error('Error getting task by ID:', error);
    return {
      success: false,
      error: 'Internal server error',
    };
  }
};

/**
 * Creates a new task
 */
export const createTask = async (
  userId: number,
  taskData: TaskCreation
): Promise<ApiResponse<Task>> => {
  try {
    // Validate due date (must be in the future)
    if (taskData.due_date) {
      const dueDate = new Date(taskData.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today

      if (dueDate <= today) {
        return {
          success: false,
          error: 'Due date must be in the future',
        };
      }
    }

    // Validate that category belongs to user (if specified)
    if (taskData.category_id) {
      const categoryResult = await query(
        'SELECT id FROM categories WHERE id = $1 AND user_id = $2',
        [taskData.category_id, userId]
      );

      if (categoryResult.rows.length === 0) {
        return {
          success: false,
          error: 'Category not found or does not belong to user',
        };
      }
    }

    // Validate that tags belong to user (if specified)
    if (taskData.tags && taskData.tags.length > 0) {
      const tagsResult = await query(
        'SELECT id FROM tags WHERE id = ANY($1) AND user_id = $2',
        [taskData.tags, userId]
      );

      if (tagsResult.rows.length !== taskData.tags.length) {
        return {
          success: false,
          error: 'One or more tags do not belong to user',
        };
      }
    }

    const result = await transaction(async (client) => {
      // Create the task
      const insertResult = await client.query(
        `INSERT INTO tasks (
          user_id, category_id, title, description, priority, due_date
        ) VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING *`,
        [
          userId,
          taskData.category_id || null,
          taskData.title,
          taskData.description || null,
          taskData.priority || 'medium',
          taskData.due_date || null,
        ]
      );

      const newTask = insertResult.rows[0];

      // Associate tags if specified
      if (taskData.tags && taskData.tags.length > 0) {
        for (const tagId of taskData.tags) {
          await client.query(
            'INSERT INTO task_tags (task_id, tag_id) VALUES ($1, $2)',
            [newTask.id, tagId]
          );
        }
      }

      return newTask;
    });

    // Get the complete task with relations
    const completeTask = await getTaskById(result.id, userId);

    if (completeTask.success) {
      return {
        success: true,
        data: completeTask.data!,
        message: 'Task created successfully',
      };
    } else {
      return completeTask;
    }
  } catch (error) {
    console.error('Error creating task:', error);
    return {
      success: false,
      error: 'Internal server error',
    };
  }
};

/**
 * Updates an existing task
 */
export const updateTask = async (
  taskId: number,
  userId: number,
  updateData: TaskUpdate
): Promise<ApiResponse<Task>> => {
  try {
    // Check that task exists and belongs to user
    const taskExists = await query(
      'SELECT id FROM tasks WHERE id = $1 AND user_id = $2',
      [taskId, userId]
    );

    if (taskExists.rows.length === 0) {
      return {
        success: false,
        error: 'Task not found',
      };
    }

    // Validate due date (must be in the future)
    if (updateData.due_date) {
      const dueDate = new Date(updateData.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today

      if (dueDate <= today) {
        return {
          success: false,
          error: 'Due date must be in the future',
        };
      }
    }

    // Validate category if specified
    if (updateData.category_id) {
      const categoryResult = await query(
        'SELECT id FROM categories WHERE id = $1 AND user_id = $2',
        [updateData.category_id, userId]
      );

      if (categoryResult.rows.length === 0) {
        return {
          success: false,
          error: 'Category not found or does not belong to user',
        };
      }
    }

    // Validate tags if specified
    if (updateData.tags && updateData.tags.length > 0) {
      const tagsResult = await query(
        'SELECT id FROM tags WHERE id = ANY($1) AND user_id = $2',
        [updateData.tags, userId]
      );

      if (tagsResult.rows.length !== updateData.tags.length) {
        return {
          success: false,
          error: 'One or more tags do not belong to user',
        };
      }
    }

    const result = await transaction(async (client) => {
      // Build update query dynamically
      const fieldsToUpdate: string[] = [];
      const values: any[] = [];
      let counter = 1;

      if (updateData.title !== undefined) {
        fieldsToUpdate.push(`title = $${counter}`);
        values.push(updateData.title);
        counter++;
      }

      if (updateData.description !== undefined) {
        fieldsToUpdate.push(`description = $${counter}`);
        values.push(updateData.description);
        counter++;
      }

      if (updateData.category_id !== undefined) {
        fieldsToUpdate.push(`category_id = $${counter}`);
        values.push(updateData.category_id);
        counter++;
      }

      if (updateData.priority !== undefined) {
        fieldsToUpdate.push(`priority = $${counter}`);
        values.push(updateData.priority);
        counter++;
      }

      if (updateData.due_date !== undefined) {
        fieldsToUpdate.push(`due_date = $${counter}`);
        values.push(updateData.due_date);
        counter++;
      }

      if (updateData.completed !== undefined) {
        fieldsToUpdate.push(`completed = $${counter}`);
        values.push(updateData.completed);
        counter++;

        // If marked as completed, set completion date
        if (updateData.completed) {
          fieldsToUpdate.push(`completed_at = CURRENT_TIMESTAMP`);
        } else {
          fieldsToUpdate.push(`completed_at = NULL`);
        }
      }

      if (fieldsToUpdate.length === 0 && !updateData.tags) {
        throw new Error('No data to update');
      }

      // Update task if there are fields to update
      if (fieldsToUpdate.length > 0) {
        fieldsToUpdate.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(taskId, userId);

        const queryText = `
          UPDATE tasks 
          SET ${fieldsToUpdate.join(', ')} 
          WHERE id = $${values.length - 1} AND user_id = $${values.length}
          RETURNING *
        `;

        await client.query(queryText, values);
      }

      // Update tags if specified
      if (updateData.tags !== undefined) {
        // Delete existing tags
        await client.query('DELETE FROM task_tags WHERE task_id = $1', [
          taskId,
        ]);

        // Add new tags
        if (updateData.tags.length > 0) {
          for (const tagId of updateData.tags) {
            await client.query(
              'INSERT INTO task_tags (task_id, tag_id) VALUES ($1, $2)',
              [taskId, tagId]
            );
          }
        }
      }

      return true;
    });

    // Get updated task
    const updatedTask = await getTaskById(taskId, userId);

    if (updatedTask.success) {
      return {
        success: true,
        data: updatedTask.data!,
        message: 'Task updated successfully',
      };
    } else {
      return updatedTask;
    }
  } catch (error) {
    console.error('Error updating task:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    };
  }
};

/**
 * Deletes a task
 */
export const deleteTask = async (
  taskId: number,
  userId: number
): Promise<ApiResponse<void>> => {
  try {
    const result = await transaction(async (client) => {
      // Delete associations with tags
      await client.query('DELETE FROM task_tags WHERE task_id = $1', [taskId]);

      // Delete the task
      const deleteResult = await client.query(
        'DELETE FROM tasks WHERE id = $1 AND user_id = $2',
        [taskId, userId]
      );

      return deleteResult.rowCount;
    });

    if (result === 0) {
      return {
        success: false,
        error: 'Task not found',
      };
    }

    return {
      success: true,
      message: 'Task deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting task:', error);
    return {
      success: false,
      error: 'Internal server error',
    };
  }
};

/**
 * Gets user task statistics
 */
export const getTaskStatistics = async (
  userId: number
): Promise<ApiResponse<any>> => {
  try {
    // General statistics
    const generalStats = await query(
      `
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN completed = true THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN completed = false THEN 1 END) as pending_tasks,
        COUNT(CASE WHEN due_date < NOW() AND completed = false THEN 1 END) as overdue_tasks,
        COUNT(CASE WHEN due_date >= NOW() AND due_date <= NOW() + INTERVAL '7 days' AND completed = false THEN 1 END) as upcoming_tasks
      FROM tasks 
      WHERE user_id = $1
    `,
      [userId]
    );

    // Statistics by priority
    const priorityStats = await query(
      `
      SELECT 
        priority,
        COUNT(*) as total,
        COUNT(CASE WHEN completed = true THEN 1 END) as completed,
        COUNT(CASE WHEN completed = false THEN 1 END) as pending
      FROM tasks 
      WHERE user_id = $1
      GROUP BY priority
      ORDER BY 
        CASE priority 
          WHEN 'high' THEN 1 
          WHEN 'medium' THEN 2 
          WHEN 'low' THEN 3 
        END
    `,
      [userId]
    );

    // Statistics by category
    const categoryStats = await query(
      `
      SELECT 
        c.id as category_id,
        c.name as category_name,
        c.color as category_color,
        COUNT(t.id) as total_tasks,
        COUNT(CASE WHEN t.completed = true THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN t.completed = false THEN 1 END) as pending_tasks
      FROM categories c
      LEFT JOIN tasks t ON c.id = t.category_id AND t.user_id = $1
      WHERE c.user_id = $1
      GROUP BY c.id, c.name, c.color
      ORDER BY total_tasks DESC
    `,
      [userId]
    );

    // Recent productivity (last 7 days)
    const productivity = await query(
      `
      SELECT 
        DATE(completed_at) as date,
        COUNT(*) as completed_tasks
      FROM tasks 
      WHERE user_id = $1 
        AND completed = true 
        AND completed_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(completed_at)
      ORDER BY date DESC
    `,
      [userId]
    );

    // Most used tags statistics
    const popularTags = await query(
      `
      SELECT 
        e.id,
        e.name,
        e.color,
        COUNT(te.task_id) as usage_count
      FROM tags e
      INNER JOIN task_tags te ON e.id = te.tag_id
      INNER JOIN tasks t ON te.task_id = t.id
      WHERE e.user_id = $1 AND t.user_id = $1
      GROUP BY e.id, e.name, e.color
      ORDER BY usage_count DESC
      LIMIT 10
    `,
      [userId]
    );

    // Calculate percentages
    const totals = generalStats.rows[0];
    const totalTasks = parseInt(totals.total_tasks);
    const completedPercentage =
      totalTasks > 0
        ? Math.round((parseInt(totals.completed_tasks) / totalTasks) * 100)
        : 0;

    const statistics = {
      summary: {
        total_tasks: parseInt(totals.total_tasks),
        completed_tasks: parseInt(totals.completed_tasks),
        pending_tasks: parseInt(totals.pending_tasks),
        overdue_tasks: parseInt(totals.overdue_tasks),
        upcoming_tasks: parseInt(totals.upcoming_tasks),
        completed_percentage: completedPercentage,
      },
      by_priority: priorityStats.rows.map((row) => ({
        priority: row.priority,
        total: parseInt(row.total),
        completed: parseInt(row.completed),
        pending: parseInt(row.pending),
        completed_percentage:
          parseInt(row.total) > 0
            ? Math.round((parseInt(row.completed) / parseInt(row.total)) * 100)
            : 0,
      })),
      by_category: categoryStats.rows.map((row) => ({
        category_id: row.category_id,
        category_name: row.category_name,
        category_color: row.category_color,
        total_tasks: parseInt(row.total_tasks),
        completed_tasks: parseInt(row.completed_tasks),
        pending_tasks: parseInt(row.pending_tasks),
        completed_percentage:
          parseInt(row.total_tasks) > 0
            ? Math.round(
                (parseInt(row.completed_tasks) / parseInt(row.total_tasks)) *
                  100
              )
            : 0,
      })),
      recent_productivity: productivity.rows.map((row) => ({
        date: row.date,
        completed_tasks: parseInt(row.completed_tasks),
      })),
      popular_tags: popularTags.rows.map((row) => ({
        id: row.id,
        name: row.name,
        color: row.color,
        usage_count: parseInt(row.usage_count),
      })),
    };

    return {
      success: true,
      data: statistics,
    };
  } catch (error) {
    console.error('Error getting task statistics:', error);
    return {
      success: false,
      error: 'Internal server error',
    };
  }
};
