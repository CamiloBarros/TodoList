import { pool } from '../config/database';
import {
  Tag,
  CreateTagDTO,
  UpdateTagDTO,
  TagStatistics,
  ErrorCode,
  DatabaseError,
} from '../types';

/**
 * Generates a random color for the tag if not provided
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
    '#F8B500',
    '#5D4E75',
    '#8395A7',
    '#00CED1',
    '#FF7675',
    '#74B9FF',
    '#81ECEC',
    '#00B894',
    '#E17055',
    '#FDCB6E',
  ];
  return colors[Math.floor(Math.random() * colors.length)] as string;
};

/**
 * Get all user tags
 */
export const getTags = async (userId: number): Promise<Tag[]> => {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `
      SELECT 
        e.id,
        e.name,
        e.color,
        e.created_at,
        e.updated_at,
        COUNT(DISTINCT te.task_id) as usage_count
      FROM tags e
      LEFT JOIN task_tags te ON e.id = te.tag_id
      WHERE e.user_id = $1
      GROUP BY e.id, e.name, e.color, e.created_at, e.updated_at
      ORDER BY e.name ASC
    `,
      [userId]
    );

    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      color: row.color,
      user_id: userId,
      created_at: row.created_at,
      updated_at: row.updated_at,
      usage_count: parseInt(row.usage_count) || 0,
    }));
  } catch (error: any) {
    throw new DatabaseError(
      'Error getting tags',
      ErrorCode.DATABASE_ERROR,
      error.message
    );
  } finally {
    client.release();
  }
};

/**
 * Get a specific tag by ID
 */
export const getTagById = async (
  tagId: number,
  userId: number
): Promise<Tag | null> => {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `
      SELECT 
        e.id,
        e.name,
        e.color,
        e.created_at,
        e.updated_at,
        COUNT(DISTINCT te.task_id) as usage_count
      FROM tags e
      LEFT JOIN task_tags te ON e.id = te.tag_id
      WHERE e.id = $1 AND e.user_id = $2
      GROUP BY e.id, e.name, e.color, e.created_at, e.updated_at
    `,
      [tagId, userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      color: row.color,
      user_id: userId,
      created_at: row.created_at,
      updated_at: row.updated_at,
      usage_count: parseInt(row.usage_count) || 0,
    };
  } catch (error: any) {
    throw new DatabaseError(
      'Error getting tag',
      ErrorCode.DATABASE_ERROR,
      error.message
    );
  } finally {
    client.release();
  }
};

/**
 * Check if a tag with the same name already exists for the user
 */
export const tagExistsWithName = async (
  name: string,
  userId: number,
  excludeId?: number
): Promise<boolean> => {
  const client = await pool.connect();

  try {
    let query = `
      SELECT id FROM tags 
      WHERE LOWER(name) = LOWER($1) AND user_id = $2
    `;
    const params: any[] = [name.trim(), userId];

    if (excludeId) {
      query += ' AND id != $3';
      params.push(excludeId);
    }

    const result = await client.query(query, params);
    return result.rows.length > 0;
  } catch (error: any) {
    throw new DatabaseError(
      'Error checking tag existence',
      ErrorCode.DATABASE_ERROR,
      error.message
    );
  } finally {
    client.release();
  }
};

/**
 * Create a new tag
 */
export const createTag = async (
  tagData: CreateTagDTO,
  userId: number
): Promise<Tag> => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check that a tag with the same name doesn't exist
    const nameExists = await tagExistsWithName(tagData.name, userId);
    if (nameExists) {
      throw new DatabaseError(
        'A tag with that name already exists',
        ErrorCode.VALIDATION_ERROR,
        `The tag "${tagData.name}" already exists`
      );
    }

    // Generate color if not provided
    const color = tagData.color || generateRandomColor();

    // Create the tag
    const result = await client.query(
      `
      INSERT INTO tags (name, color, user_id)
      VALUES ($1, $2, $3)
      RETURNING id, name, color, created_at, updated_at
    `,
      [tagData.name.trim(), color, userId]
    );

    await client.query('COMMIT');

    const newTag = result.rows[0];
    return {
      id: newTag.id,
      name: newTag.name,
      color: newTag.color,
      user_id: userId,
      created_at: newTag.created_at,
      updated_at: newTag.updated_at,
      usage_count: 0,
    };
  } catch (error: any) {
    await client.query('ROLLBACK');

    if (error instanceof DatabaseError) {
      throw error;
    }

    throw new DatabaseError(
      'Error creating tag',
      ErrorCode.DATABASE_ERROR,
      error.message
    );
  } finally {
    client.release();
  }
};

/**
 * Update an existing tag
 */
export const updateTag = async (
  tagId: number,
  tagData: UpdateTagDTO,
  userId: number
): Promise<Tag | null> => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check that the tag exists and belongs to the user
    const existingTag = await getTagById(tagId, userId);
    if (!existingTag) {
      return null;
    }

    // Check unique name if updating
    if (tagData.name) {
      const nameExists = await tagExistsWithName(tagData.name, userId, tagId);
      if (nameExists) {
        throw new DatabaseError(
          'A tag with that name already exists',
          ErrorCode.VALIDATION_ERROR,
          `The tag "${tagData.name}" already exists`
        );
      }
    }

    // Build update query dynamically
    const fieldsToUpdate: string[] = [];
    const values: any[] = [];
    let parameterCounter = 1;

    if (tagData.name !== undefined) {
      fieldsToUpdate.push(`name = $${parameterCounter}`);
      values.push(tagData.name.trim());
      parameterCounter++;
    }

    if (tagData.color !== undefined) {
      fieldsToUpdate.push(`color = $${parameterCounter}`);
      values.push(tagData.color);
      parameterCounter++;
    }

    if (fieldsToUpdate.length === 0) {
      // No fields to update, return existing tag
      await client.query('COMMIT');
      return existingTag;
    }

    fieldsToUpdate.push(`updated_at = NOW()`);
    values.push(tagId, userId);

    const query = `
      UPDATE tags 
      SET ${fieldsToUpdate.join(', ')}
      WHERE id = $${parameterCounter} AND user_id = $${parameterCounter + 1}
      RETURNING id, name, color, created_at, updated_at
    `;

    const result = await client.query(query, values);

    if (result.rows.length === 0) {
      return null;
    }

    await client.query('COMMIT');

    const updatedTag = result.rows[0];
    return {
      id: updatedTag.id,
      name: updatedTag.name,
      color: updatedTag.color,
      user_id: userId,
      created_at: updatedTag.created_at,
      updated_at: updatedTag.updated_at,
      usage_count: existingTag.usage_count || 0,
    };
  } catch (error: any) {
    await client.query('ROLLBACK');

    if (error instanceof DatabaseError) {
      throw error;
    }

    throw new DatabaseError(
      'Error updating tag',
      ErrorCode.DATABASE_ERROR,
      error.message
    );
  } finally {
    client.release();
  }
};

/**
 * Check if a tag has associated tasks
 */
export const tagHasAssociatedTasks = async (
  tagId: number,
  userId: number
): Promise<boolean> => {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `
      SELECT COUNT(*) as count
      FROM task_tags te
      INNER JOIN tasks t ON te.task_id = t.id
      WHERE te.tag_id = $1 AND t.user_id = $2
    `,
      [tagId, userId]
    );

    return parseInt(result.rows[0].count) > 0;
  } catch (error: any) {
    throw new DatabaseError(
      'Error checking tag associations',
      ErrorCode.DATABASE_ERROR,
      error.message
    );
  } finally {
    client.release();
  }
};

/**
 * Delete a tag (only if it has no associated tasks)
 */
export const deleteTag = async (
  tagId: number,
  userId: number
): Promise<{ deleted: boolean; message: string }> => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check that the tag exists and belongs to the user
    const existingTag = await getTagById(tagId, userId);
    if (!existingTag) {
      return {
        deleted: false,
        message: 'Tag not found',
      };
    }

    // Check if it has associated tasks
    const hasAssociations = await tagHasAssociatedTasks(tagId, userId);
    if (hasAssociations) {
      return {
        deleted: false,
        message:
          'Cannot delete tag because it has associated tasks. Use forced deletion if you want to continue.',
      };
    }

    // Delete the tag
    await client.query(
      `
      DELETE FROM tags 
      WHERE id = $1 AND user_id = $2
    `,
      [tagId, userId]
    );

    await client.query('COMMIT');

    return {
      deleted: true,
      message: 'Tag deleted successfully',
    };
  } catch (error: any) {
    await client.query('ROLLBACK');

    throw new DatabaseError(
      'Error deleting tag',
      ErrorCode.DATABASE_ERROR,
      error.message
    );
  } finally {
    client.release();
  }
};

/**
 * Force delete a tag (also removing its associations)
 */
export const forceDeleteTag = async (
  tagId: number,
  userId: number
): Promise<{ deleted: boolean; message: string; affectedTasks?: number }> => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check that the tag exists and belongs to the user
    const existingTag = await getTagById(tagId, userId);
    if (!existingTag) {
      return {
        deleted: false,
        message: 'Tag not found',
      };
    }

    // Count affected tasks before deleting
    const countResult = await client.query(
      `
      SELECT COUNT(DISTINCT te.task_id) as count
      FROM task_tags te
      INNER JOIN tasks t ON te.task_id = t.id
      WHERE te.tag_id = $1 AND t.user_id = $2
    `,
      [tagId, userId]
    );

    const affectedTasks = parseInt(countResult.rows[0].count);

    // Delete associations with tasks
    await client.query(
      `
      DELETE FROM task_tags 
      WHERE tag_id = $1 AND task_id IN (
        SELECT id FROM tasks WHERE user_id = $2
      )
    `,
      [tagId, userId]
    );

    // Delete the tag
    await client.query(
      `
      DELETE FROM tags 
      WHERE id = $1 AND user_id = $2
    `,
      [tagId, userId]
    );

    await client.query('COMMIT');

    return {
      deleted: true,
      message: `Tag deleted successfully. Removed from ${affectedTasks} task(s).`,
      affectedTasks,
    };
  } catch (error: any) {
    await client.query('ROLLBACK');

    throw new DatabaseError(
      'Error force deleting tag',
      ErrorCode.DATABASE_ERROR,
      error.message
    );
  } finally {
    client.release();
  }
};

/**
 * Get tag statistics
 */
export const getTagStatistics = async (
  tagId: number,
  userId: number
): Promise<TagStatistics | null> => {
  const client = await pool.connect();

  try {
    // Check that the tag exists and belongs to the user
    const existingTag = await getTagById(tagId, userId);
    if (!existingTag) {
      return null;
    }

    // Get detailed statistics
    const result = await client.query(
      `
      SELECT 
        COUNT(DISTINCT te.task_id) as total_tasks,
        COUNT(DISTINCT CASE WHEN t.completed = true THEN te.task_id END) as completed_tasks,
        COUNT(DISTINCT CASE WHEN t.completed = false THEN te.task_id END) as pending_tasks,
        COUNT(DISTINCT CASE WHEN t.priority = 'high' THEN te.task_id END) as high_priority,
        COUNT(DISTINCT CASE WHEN t.priority = 'medium' THEN te.task_id END) as medium_priority,
        COUNT(DISTINCT CASE WHEN t.priority = 'low' THEN te.task_id END) as low_priority,
        COUNT(DISTINCT CASE WHEN t.due_date IS NOT NULL AND t.due_date < NOW() AND t.completed = false THEN te.task_id END) as overdue_tasks
      FROM task_tags te
      INNER JOIN tasks t ON te.task_id = t.id
      WHERE te.tag_id = $1 AND t.user_id = $2
    `,
      [tagId, userId]
    );

    const stats = result.rows[0];

    return {
      tag_id: tagId,
      name: existingTag.name,
      color: existingTag.color,
      total_tasks: parseInt(stats.total_tasks) || 0,
      completed_tasks: parseInt(stats.completed_tasks) || 0,
      pending_tasks: parseInt(stats.pending_tasks) || 0,
      overdue_tasks: parseInt(stats.overdue_tasks) || 0,
      priority_distribution: {
        high: parseInt(stats.high_priority) || 0,
        medium: parseInt(stats.medium_priority) || 0,
        low: parseInt(stats.low_priority) || 0,
      },
      completion_percentage:
        parseInt(stats.total_tasks) > 0
          ? Math.round(
              (parseInt(stats.completed_tasks) / parseInt(stats.total_tasks)) *
                100
            )
          : 0,
    };
  } catch (error: any) {
    throw new DatabaseError(
      'Error getting tag statistics',
      ErrorCode.DATABASE_ERROR,
      error.message
    );
  } finally {
    client.release();
  }
};

/**
 * Get most used tags by user
 */
export const getMostUsedTags = async (
  userId: number,
  limit: number = 10
): Promise<Tag[]> => {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `
      SELECT 
        e.id,
        e.name,
        e.color,
        e.created_at,
        e.updated_at,
        COUNT(DISTINCT te.task_id) as usage_count
      FROM tags e
      LEFT JOIN task_tags te ON e.id = te.tag_id
      LEFT JOIN tasks t ON te.task_id = t.id
      WHERE e.user_id = $1
      GROUP BY e.id, e.name, e.color, e.created_at, e.updated_at
      HAVING COUNT(DISTINCT te.task_id) > 0
      ORDER BY usage_count DESC, e.name ASC
      LIMIT $2
    `,
      [userId, limit]
    );

    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      color: row.color,
      user_id: userId,
      created_at: row.created_at,
      updated_at: row.updated_at,
      usage_count: parseInt(row.usage_count) || 0,
    }));
  } catch (error: any) {
    throw new DatabaseError(
      'Error getting most used tags',
      ErrorCode.DATABASE_ERROR,
      error.message
    );
  } finally {
    client.release();
  }
};
