import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { getConfig } from '../config/env';
import { Prioridad } from '../types';

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
  nombre: string;
  password: string;
}

interface SampleCategory {
  nombre: string;
  descripcion: string;
  color: string;
}

interface SampleTag {
  nombre: string;
  color: string;
}

interface SampleTask {
  titulo: string;
  descripcion: string;
  prioridad: Prioridad;
  fecha_vencimiento?: Date;
  categoria: string;
  etiquetas: string[];
}

/**
 * Sample users data
 */
const sampleUsers: SampleUser[] = [
  {
    email: 'admin@todolist.com',
    nombre: 'Administrator',
    password: 'admin123',
  },
  {
    email: 'user1@example.com',
    nombre: 'Juan Pérez',
    password: 'user123',
  },
  {
    email: 'user2@example.com',
    nombre: 'María García',
    password: 'user123',
  },
];

/**
 * Sample categories data
 */
const sampleCategories: SampleCategory[] = [
  {
    nombre: 'Trabajo',
    descripcion: 'Tareas relacionadas con el trabajo',
    color: '#3B82F6',
  },
  {
    nombre: 'Personal',
    descripcion: 'Tareas personales y domésticas',
    color: '#10B981',
  },
  {
    nombre: 'Estudios',
    descripcion: 'Tareas académicas y de aprendizaje',
    color: '#F59E0B',
  },
  {
    nombre: 'Salud',
    descripcion: 'Citas médicas y ejercicio',
    color: '#EF4444',
  },
  {
    nombre: 'Compras',
    descripcion: 'Lista de compras y diligencias',
    color: '#8B5CF6',
  },
];

/**
 * Sample tags data
 */
const sampleTags: SampleTag[] = [
  { nombre: 'urgente', color: '#EF4444' },
  { nombre: 'importante', color: '#F59E0B' },
  { nombre: 'reunión', color: '#3B82F6' },
  { nombre: 'llamada', color: '#10B981' },
  { nombre: 'email', color: '#6B7280' },
  { nombre: 'documento', color: '#8B5CF6' },
  { nombre: 'revisión', color: '#F97316' },
  { nombre: 'proyecto', color: '#06B6D4' },
];

/**
 * Sample tasks data (will be created for each user)
 */
const sampleTasks: SampleTask[] = [
  {
    titulo: 'Revisar correos electrónicos',
    descripcion: 'Revisar y responder correos pendientes de la semana',
    prioridad: 'alta',
    fecha_vencimiento: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    categoria: 'Trabajo',
    etiquetas: ['email', 'importante'],
  },
  {
    titulo: 'Comprar víveres',
    descripcion: 'Leche, pan, frutas, verduras',
    prioridad: 'media',
    fecha_vencimiento: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
    categoria: 'Compras',
    etiquetas: ['urgente'],
  },
  {
    titulo: 'Llamar al dentista',
    descripcion: 'Agendar cita para limpieza dental',
    prioridad: 'baja',
    categoria: 'Salud',
    etiquetas: ['llamada'],
  },
  {
    titulo: 'Completar proyecto React',
    descripcion: 'Finalizar componentes pendientes y hacer testing',
    prioridad: 'alta',
    fecha_vencimiento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
    categoria: 'Trabajo',
    etiquetas: ['proyecto', 'importante'],
  },
  {
    titulo: 'Estudiar para examen',
    descripcion: 'Repasar capítulos 5-8 del libro de matemáticas',
    prioridad: 'alta',
    fecha_vencimiento: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
    categoria: 'Estudios',
    etiquetas: ['importante', 'revisión'],
  },
  {
    titulo: 'Ejercicio en el gimnasio',
    descripcion: 'Rutina de cardio y pesas',
    prioridad: 'media',
    categoria: 'Salud',
    etiquetas: [],
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
        'INSERT INTO usuarios (email, nombre, password_hash) VALUES ($1, $2, $3) RETURNING id',
        [user.email, user.nombre, hashedPassword]
      );

      userIds.push(result.rows[0].id);
      console.log(`✅ User created: ${user.email} (ID: ${result.rows[0].id})`);
    } catch (error: any) {
      if (error.code === '23505') {
        console.log(`⏭️ User already exists: ${user.email}`);
        const existingUser = await pool.query(
          'SELECT id FROM usuarios WHERE email = $1',
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
          'INSERT INTO categorias (usuario_id, nombre, descripcion, color) VALUES ($1, $2, $3, $4) RETURNING id',
          [userId, category.nombre, category.descripcion, category.color]
        );

        categoryMap.get(userId)![category.nombre] = result.rows[0].id;
        console.log(
          `✅ Category created: ${category.nombre} for user ${userId}`
        );
      } catch (error: any) {
        if (error.code === '23505') {
          console.log(
            `⏭️ Category already exists: ${category.nombre} for user ${userId}`
          );
          const existing = await pool.query(
            'SELECT id FROM categorias WHERE usuario_id = $1 AND nombre = $2',
            [userId, category.nombre]
          );
          categoryMap.get(userId)![category.nombre] = existing.rows[0].id;
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
          'INSERT INTO etiquetas (usuario_id, nombre, color) VALUES ($1, $2, $3) RETURNING id',
          [userId, tag.nombre, tag.color]
        );

        tagMap.get(userId)![tag.nombre] = result.rows[0].id;
        console.log(`✅ Tag created: ${tag.nombre} for user ${userId}`);
      } catch (error: any) {
        if (error.code === '23505') {
          console.log(
            `⏭️ Tag already exists: ${tag.nombre} for user ${userId}`
          );
          const existing = await pool.query(
            'SELECT id FROM etiquetas WHERE usuario_id = $1 AND nombre = $2',
            [userId, tag.nombre]
          );
          tagMap.get(userId)![tag.nombre] = existing.rows[0].id;
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
        const categoryId = categoryMap.get(userId)?.[task.categoria] || null;

        // Insert task
        const result = await pool.query(
          `INSERT INTO tareas (usuario_id, categoria_id, titulo, descripcion, prioridad, fecha_vencimiento) 
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
          [
            userId,
            categoryId,
            task.titulo,
            task.descripcion,
            task.prioridad,
            task.fecha_vencimiento,
          ]
        );

        const taskId = result.rows[0].id;
        console.log(`✅ Task created: ${task.titulo} for user ${userId}`);

        // Insert task tags
        for (const tagName of task.etiquetas) {
          const tagId = tagMap.get(userId)?.[tagName];
          if (tagId) {
            await pool.query(
              'INSERT INTO tarea_etiquetas (tarea_id, etiqueta_id) VALUES ($1, $2)',
              [taskId, tagId]
            );
            console.log(`🔗 Tag linked: ${tagName} to task ${taskId}`);
          }
        }
      } catch (error) {
        console.error(`❌ Error creating task ${task.titulo}:`, error);
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
        (SELECT COUNT(*) FROM usuarios) as users,
        (SELECT COUNT(*) FROM categorias) as categories,
        (SELECT COUNT(*) FROM etiquetas) as tags,
        (SELECT COUNT(*) FROM tareas) as tasks,
        (SELECT COUNT(*) FROM tarea_etiquetas) as task_tags
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

    await pool.query('DELETE FROM tarea_etiquetas');
    await pool.query('DELETE FROM tareas');
    await pool.query('DELETE FROM etiquetas');
    await pool.query('DELETE FROM categorias');
    await pool.query('DELETE FROM usuarios');

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
