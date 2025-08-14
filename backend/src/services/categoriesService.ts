import { query, transaction } from '../config/database';
import { Category, CategoryCreation, ApiResponse } from '../types';

/**
 * Categories Service
 * Handles all CRUD operations for user categories
 */

/**
 * Gets all user categories
 */
export const getCategories = async (
  userId: number
): Promise<ApiResponse<Category[]>> => {
  try {
    const result = await query(
      `SELECT id, user_id, name, description, color, created_at, updated_at 
       FROM categories 
       WHERE user_id = $1 
       ORDER BY name ASC`,
      [userId]
    );

    const categories: Category[] = result.rows.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      name: row.name,
      description: row.description,
      color: row.color,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    return {
      success: true,
      data: categories,
    };
  } catch (error) {
    console.error('Error getting categories:', error);
    return {
      success: false,
      error: 'Internal server error',
    };
  }
};

/**
 * Gets a specific category by ID
 */
export const getCategoryById = async (
  categoryId: number,
  userId: number
): Promise<ApiResponse<Category>> => {
  try {
    const result = await query(
      `SELECT id, user_id, name, description, color, created_at, updated_at 
       FROM categories 
       WHERE id = $1 AND user_id = $2`,
      [categoryId, userId]
    );

    if (result.rows.length === 0) {
      return {
        success: false,
        error: 'Category not found',
      };
    }

    const category: Category = result.rows[0];

    return {
      success: true,
      data: category,
    };
  } catch (error) {
    console.error('Error getting category by ID:', error);
    return {
      success: false,
      error: 'Internal server error',
    };
  }
};

/**
 * Creates a new category
 */
export const createCategory = async (
  userId: number,
  categoryData: CategoryCreation
): Promise<ApiResponse<Category>> => {
  try {
    // Check if a category with the same name already exists for this user
    const categoryExists = await query(
      'SELECT id FROM categories WHERE name = $1 AND user_id = $2',
      [categoryData.name, userId]
    );

    if (categoryExists.rows.length > 0) {
      return {
        success: false,
        error: 'A category with that name already exists',
      };
    }

    // Generate random color if not provided
    const color = categoryData.color || generateRandomColor();

    const result = await query(
      `INSERT INTO categories (user_id, name, description, color) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, user_id, name, description, color, created_at, updated_at`,
      [userId, categoryData.name, categoryData.description || null, color]
    );

    const newCategory: Category = result.rows[0];

    return {
      success: true,
      data: newCategory,
      message: 'Category created successfully',
    };
  } catch (error) {
    console.error('Error creating category:', error);
    return {
      success: false,
      error: 'Internal server error',
    };
  }
};

/**
 * Updates an existing category
 */
export const updateCategory = async (
  categoryId: number,
  userId: number,
  updateData: Partial<CategoryCreation>
): Promise<ApiResponse<Category>> => {
  try {
    // Check that the category exists and belongs to the user
    const categoryExists = await query(
      'SELECT id FROM categories WHERE id = $1 AND user_id = $2',
      [categoryId, userId]
    );

    if (categoryExists.rows.length === 0) {
      return {
        success: false,
        error: 'Category not found',
      };
    }

    // Check if the new name already exists (if changing)
    if (updateData.name) {
      const nameExists = await query(
        'SELECT id FROM categories WHERE name = $1 AND user_id = $2 AND id != $3',
        [updateData.name, userId, categoryId]
      );

      if (nameExists.rows.length > 0) {
        return {
          success: false,
          error: 'A category with that name already exists',
        };
      }
    }

    // Build update query dynamically
    const fieldsToUpdate: string[] = [];
    const values: any[] = [];
    let counter = 1;

    if (updateData.name !== undefined) {
      fieldsToUpdate.push(`name = $${counter}`);
      values.push(updateData.name);
      counter++;
    }

    if (updateData.description !== undefined) {
      fieldsToUpdate.push(`description = $${counter}`);
      values.push(updateData.description);
      counter++;
    }

    if (updateData.color !== undefined) {
      fieldsToUpdate.push(`color = $${counter}`);
      values.push(updateData.color);
      counter++;
    }

    if (fieldsToUpdate.length === 0) {
      return {
        success: false,
        error: 'No data to update',
      };
    }

    // Add updated_at and IDs
    fieldsToUpdate.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(categoryId, userId);

    const queryText = `
      UPDATE categories 
      SET ${fieldsToUpdate.join(', ')} 
      WHERE id = $${values.length - 1} AND user_id = $${values.length}
      RETURNING id, user_id, name, description, color, created_at, updated_at
    `;

    const result = await query(queryText, values);

    const updatedCategory: Category = result.rows[0];

    return {
      success: true,
      data: updatedCategory,
      message: 'Category updated successfully',
    };
  } catch (error) {
    console.error('Error updating category:', error);
    return {
      success: false,
      error: 'Internal server error',
    };
  }
};

/**
 * Deletes a category
 */
export const deleteCategory = async (
  categoryId: number,
  userId: number
): Promise<ApiResponse<void>> => {
  try {
    // Check if there are tasks associated with this category
    const associatedTasks = await query(
      'SELECT COUNT(*) as count FROM tasks WHERE category_id = $1 AND user_id = $2',
      [categoryId, userId]
    );

    const taskCount = parseInt(associatedTasks.rows[0].count);

    if (taskCount > 0) {
      return {
        success: false,
        error: `Cannot delete category because it has ${taskCount} associated task(s)`,
      };
    }

    const result = await query(
      'DELETE FROM categories WHERE id = $1 AND user_id = $2',
      [categoryId, userId]
    );

    if (result.rowCount === 0) {
      return {
        success: false,
        error: 'Category not found',
      };
    }

    return {
      success: true,
      message: 'Category deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting category:', error);
    return {
      success: false,
      error: 'Internal server error',
    };
  }
};

/**
 * Deletes a category and moves associated tasks to "no category"
 */
export const deleteCategoryWithTasks = async (
  categoryId: number,
  userId: number
): Promise<ApiResponse<void>> => {
  try {
    const result = await transaction(async (client) => {
      // Check that the category exists
      const categoryExists = await client.query(
        'SELECT id FROM categories WHERE id = $1 AND user_id = $2',
        [categoryId, userId]
      );

      if (categoryExists.rows.length === 0) {
        throw new Error('Category not found');
      }

      // Move all tasks from this category to "no category" (category_id = null)
      await client.query(
        'UPDATE tasks SET category_id = NULL, updated_at = CURRENT_TIMESTAMP WHERE category_id = $1 AND user_id = $2',
        [categoryId, userId]
      );

      // Delete the category
      const deleteResult = await client.query(
        'DELETE FROM categories WHERE id = $1 AND user_id = $2',
        [categoryId, userId]
      );

      return deleteResult.rowCount;
    });

    if (result === 0) {
      return {
        success: false,
        error: 'Category not found',
      };
    }

    return {
      success: true,
      message: 'Category deleted and associated tasks moved to "no category"',
    };
  } catch (error) {
    console.error('Error deleting category with tasks:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    };
  }
};

/**
 * Gets category statistics (number of tasks)
 */
export const getCategoryStatistics = async (
  categoryId: number,
  userId: number
): Promise<
  ApiResponse<{
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
  }>
> => {
  try {
    const result = await query(
      `SELECT 
         COUNT(*) as total_tasks,
         COUNT(CASE WHEN completed = true THEN 1 END) as completed_tasks,
         COUNT(CASE WHEN completed = false THEN 1 END) as pending_tasks
       FROM tasks 
       WHERE category_id = $1 AND user_id = $2`,
      [categoryId, userId]
    );

    const stats = result.rows[0];

    return {
      success: true,
      data: {
        totalTasks: parseInt(stats.total_tasks),
        completedTasks: parseInt(stats.completed_tasks),
        pendingTasks: parseInt(stats.pending_tasks),
      },
    };
  } catch (error) {
    console.error('Error getting category statistics:', error);
    return {
      success: false,
      error: 'Internal server error',
    };
  }
};

/**
 * Generates a random hexadecimal color
 */
const generateRandomColor = (): string => {
  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#96CEB4',
    '#FECA57',
    '#FF9FF3',
    '#54A0FF',
    '#5F27CD',
    '#00D2D3',
    '#FF9F43',
    '#10AC84',
    '#EE5A24',
    '#0984E3',
    '#6C5CE7',
    '#A29BFE',
    '#FD79A8',
    '#E17055',
    '#00B894',
    '#00CEC9',
    '#6C5CE7',
  ];

  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex] || '#4ECDC4'; // Fallback color
};
