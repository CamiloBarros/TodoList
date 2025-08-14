import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { getConfig } from '../config/env';
import { Priority } from '../types';

/**
 * Database Seeding Script
 * Populates database with initial test data
 */

const config = getConfig();

const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.database,
  user: config.database.user,
  password: config.database.password,
});

interface SampleUser {
  email: string;
  name: string;
  password: string;
}

interface SampleCategory {
  name: string;
  description: string;
  color: string;
}

interface SampleTag {
  name: string;
  color: string;
}

interface SampleTask {
  title: string;
  description: string;
  priority: Priority;
  due_date?: Date;
  category: string;
  tags: string[];
}

/**
 * Sample users data
 */
const sampleUsers: SampleUser[] = [
  {
    email: 'admin@todolist.com',
    name: 'Administrator',
    password: 'admin123',
  },
  {
    email: 'user1@example.com',
    name: 'Juan Pérez',
    password: 'user123',
  },
  {
    email: 'user2@example.com',
    name: 'María García',
    password: 'user123',
  },
];

/**
 * Sample categories data
 */
const sampleCategories: SampleCategory[] = [
  {
    name: 'Work',
    description: 'Work-related tasks',
    color: '#3B82F6',
  },
  {
    name: 'Personal',
    description: 'Personal and household tasks',
    color: '#10B981',
  },
  {
    name: 'Studies',
    description: 'Academic and learning tasks',
    color: '#F59E0B',
  },
  {
    name: 'Health',
    description: 'Medical appointments and exercise',
    color: '#EF4444',
  },
  {
    name: 'Shopping',
    description: 'Shopping list and errands',
    color: '#8B5CF6',
  },
];

/**
 * Sample tags data
 */
const sampleTags: SampleTag[] = [
  { name: 'urgent', color: '#EF4444' },
  { name: 'important', color: '#F59E0B' },
  { name: 'meeting', color: '#3B82F6' },
  { name: 'call', color: '#10B981' },
  { name: 'email', color: '#6B7280' },
  { name: 'document', color: '#8B5CF6' },
  { name: 'review', color: '#F97316' },
  { name: 'project', color: '#06B6D4' },
];

/**
 * Sample tasks data (will be created for each user)
 */
const sampleTasks: SampleTask[] = [
  {
    title: 'Check emails',
    description: 'Review and respond to pending emails from the week',
    priority: 'high',
    due_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    category: 'Work',
    tags: ['email', 'important'],
  },
  {
    title: 'Buy groceries',
    description: 'Milk, bread, fruits, vegetables',
    priority: 'medium',
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
    category: 'Shopping',
    tags: ['urgent'],
  },
  {
    title: 'Call the dentist',
    description: 'Schedule appointment for dental cleaning',
    priority: 'low',
    category: 'Health',
    tags: ['call'],
  },
  {
    title: 'Complete React project',
    description: 'Finish pending components and do testing',
    priority: 'high',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
    category: 'Work',
    tags: ['project', 'important'],
  },
  {
    title: 'Study for exam',
    description: 'Review chapters 5-8 of the math book',
    priority: 'high',
    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
    category: 'Studies',
    tags: ['important', 'review'],
  },
  {
    title: 'Gym workout',
    description: 'Cardio and weight routine',
    priority: 'medium',
    category: 'Health',
    tags: [],
  },
];

/**
 * Hash password
 */
const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, config.security.bcryptRounds);
};

/**
 * Insert users
 */
const insertUsers = async (): Promise<number[]> => {
  console.log('👥 Inserting sample users...');

  const userIds: number[] = [];

  for (const user of sampleUsers) {
    try {
      const hashedPassword = await hashPassword(user.password);

      const result = await pool.query(
        'INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3) RETURNING id',
        [user.email, user.name, hashedPassword]
      );

      userIds.push(result.rows[0].id);
      console.log(`✅ User created: ${user.email} (ID: ${result.rows[0].id})`);
    } catch (error: any) {
      if (error.code === '23505') {
        console.log(`⏭️ User already exists: ${user.email}`);
        const existingUser = await pool.query(
          'SELECT id FROM users WHERE email = $1',
          [user.email]
        );
        userIds.push(existingUser.rows[0].id);
      } else {
        throw error;
      }
    }
  }

  return userIds;
};

/**
 * Insert categories for each user
 */
const insertCategories = async (
  userIds: number[]
): Promise<Map<number, Record<string, number>>> => {
  console.log('📁 Inserting sample categories...');

  const categoryMap = new Map<number, Record<string, number>>(); // user_id -> { category_name: category_id }

  for (const userId of userIds) {
    categoryMap.set(userId, {});

    for (const category of sampleCategories) {
      try {
        const result = await pool.query(
          'INSERT INTO categories (user_id, name, description, color) VALUES ($1, $2, $3, $4) RETURNING id',
          [userId, category.name, category.description, category.color]
        );

        categoryMap.get(userId)![category.name] = result.rows[0].id;
        console.log(`✅ Category created: ${category.name} for user ${userId}`);
      } catch (error: any) {
        if (error.code === '23505') {
          console.log(
            `⏭️ Category already exists: ${category.name} for user ${userId}`
          );
          const existing = await pool.query(
            'SELECT id FROM categories WHERE user_id = $1 AND name = $2',
            [userId, category.name]
          );
          categoryMap.get(userId)![category.name] = existing.rows[0].id;
        } else {
          throw error;
        }
      }
    }
  }

  return categoryMap;
};

/**
 * Insert tags for each user
 */
const insertTags = async (
  userIds: number[]
): Promise<Map<number, Record<string, number>>> => {
  console.log('🏷️ Inserting sample tags...');

  const tagMap = new Map<number, Record<string, number>>(); // user_id -> { tag_name: tag_id }

  for (const userId of userIds) {
    tagMap.set(userId, {});

    for (const tag of sampleTags) {
      try {
        const result = await pool.query(
          'INSERT INTO tags (user_id, name, color) VALUES ($1, $2, $3) RETURNING id',
          [userId, tag.name, tag.color]
        );

        tagMap.get(userId)![tag.name] = result.rows[0].id;
        console.log(`✅ Tag created: ${tag.name} for user ${userId}`);
      } catch (error: any) {
        if (error.code === '23505') {
          console.log(`⏭️ Tag already exists: ${tag.name} for user ${userId}`);
          const existing = await pool.query(
            'SELECT id FROM tags WHERE user_id = $1 AND name = $2',
            [userId, tag.name]
          );
          tagMap.get(userId)![tag.name] = existing.rows[0].id;
        } else {
          throw error;
        }
      }
    }
  }

  return tagMap;
};

/**
 * Insert tasks for each user
 */
const insertTasks = async (
  userIds: number[],
  categoryMap: Map<number, Record<string, number>>,
  tagMap: Map<number, Record<string, number>>
): Promise<void> => {
  console.log('✅ Inserting sample tasks...');

  for (const userId of userIds) {
    for (const task of sampleTasks) {
      try {
        // Get category ID
        const categoryId = categoryMap.get(userId)?.[task.category] || null;

        // Insert task
        const result = await pool.query(
          `INSERT INTO tasks (user_id, category_id, title, description, priority, due_date) 
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
          [
            userId,
            categoryId,
            task.title,
            task.description,
            task.priority,
            task.due_date,
          ]
        );

        const taskId = result.rows[0].id;
        console.log(`✅ Task created: ${task.title} for user ${userId}`);

        // Insert task tags
        for (const tagName of task.tags) {
          const tagId = tagMap.get(userId)?.[tagName];
          if (tagId) {
            await pool.query(
              'INSERT INTO task_tags (task_id, tag_id) VALUES ($1, $2)',
              [taskId, tagId]
            );
            console.log(`🔗 Tag linked: ${tagName} to task ${taskId}`);
          }
        }
      } catch (error) {
        console.error(`❌ Error creating task ${task.title}:`, error);
      }
    }
  }
};

/**
 * Main seeding function
 */
export const seedDatabase = async (): Promise<void> => {
  try {
    console.log('🌱 Starting database seeding...');

    // Insert users
    const userIds = await insertUsers();

    // Insert categories
    const categoryMap = await insertCategories(userIds);

    // Insert tags
    const tagMap = await insertTags(userIds);

    // Insert tasks
    await insertTasks(userIds, categoryMap, tagMap);

    console.log('🎉 Database seeding completed successfully!');

    // Show summary
    const summary = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM categories) as categories,
        (SELECT COUNT(*) FROM tags) as tags,
        (SELECT COUNT(*) FROM tasks) as tasks,
        (SELECT COUNT(*) FROM task_tags) as task_tags
    `);

    console.log('📊 Database Summary:', summary.rows[0]);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

/**
 * Clear all data (keep tables)
 */
export const clearDatabase = async (): Promise<void> => {
  try {
    console.log('🧹 Clearing database data...');

    await pool.query('DELETE FROM task_tags');
    await pool.query('DELETE FROM tasks');
    await pool.query('DELETE FROM tags');
    await pool.query('DELETE FROM categories');
    await pool.query('DELETE FROM users');

    console.log('✅ Database cleared');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
};

/**
 * Command line interface
 */
const main = async (): Promise<void> => {
  const command = process.argv[2];

  switch (command) {
    case 'seed':
      await seedDatabase();
      break;

    case 'clear':
      await clearDatabase();
      break;

    case 'reset':
      await clearDatabase();
      await seedDatabase();
      break;

    default:
      console.log(`
🌱 Database Seeding Tool

Usage: node seed.js <command>

Commands:
  seed   - Add sample data to database
  clear  - Remove all data (keep tables)
  reset  - Clear and re-seed database

Examples:
  npm run db:seed
  node src/scripts/seed.js reset
      `);
      break;
  }
};

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
