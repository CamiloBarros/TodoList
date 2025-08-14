import { promises as fs } from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { getConfig } from '../config/env';

/**
 * Database Migration Script
 * Executes SQL migration files in order
 */

const config = getConfig();

const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.database,
  user: config.database.user,
  password: config.database.password,
});

/**
 * Create migrations table if it doesn't exist
 */
const createMigrationsTable = async (): Promise<void> => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  await pool.query(createTableQuery);
  console.log('✅ Migrations table ready');
};

/**
 * Get list of executed migrations
 */
const getExecutedMigrations = async (): Promise<string[]> => {
  try {
    const result = await pool.query('SELECT filename FROM migrations ORDER BY executed_at');
    return result.rows.map(row => row.filename);
  } catch (error) {
    console.error('❌ Error getting executed migrations:', error);
    return [];
  }
};

/**
 * Execute a single migration file
 */
const executeMigration = async (filename: string, filepath: string): Promise<void> => {
  try {
    const sql = await fs.readFile(filepath, 'utf8');
    
    console.log(`🔄 Executing migration: ${filename}`);
    
    // Execute the migration SQL
    await pool.query(sql);
    
    // Record the migration as executed
    await pool.query(
      'INSERT INTO migrations (filename) VALUES ($1)',
      [filename]
    );
    
    console.log(`✅ Migration completed: ${filename}`);
  } catch (error) {
    console.error(`❌ Migration failed: ${filename}`, error);
    throw error;
  }
};

/**
 * Run all pending migrations
 */
export const runMigrations = async (): Promise<void> => {
  try {
    console.log('🚀 Starting database migrations...');
    
    // Create migrations table
    await createMigrationsTable();
    
    // Get executed migrations
    const executedMigrations = await getExecutedMigrations();
    console.log('📋 Executed migrations:', executedMigrations);
    
    // Get migration files
    const migrationsDir = path.join(__dirname, '../../migrations');
    const files = await fs.readdir(migrationsDir);
    const migrationFiles = files
      .filter(file => file.endsWith('.sql'))
      .sort(); // Execute in alphabetical order
    
    console.log('📁 Available migrations:', migrationFiles);
    
    // Execute pending migrations
    let executedCount = 0;
    for (const filename of migrationFiles) {
      if (!executedMigrations.includes(filename)) {
        const filepath = path.join(migrationsDir, filename);
        await executeMigration(filename, filepath);
        executedCount++;
      } else {
        console.log(`⏭️ Skipping already executed migration: ${filename}`);
      }
    }
    
    if (executedCount === 0) {
      console.log('✅ No pending migrations to execute');
    } else {
      console.log(`🎉 Successfully executed ${executedCount} migration(s)`);
    }
    
  } catch (error) {
    console.error('❌ Migration process failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

/**
 * Reset database (DROP and recreate all tables)
 */
export const resetDatabase = async (): Promise<void> => {
  try {
    console.log('🔄 Resetting database...');
    
    // Drop all tables in reverse dependency order
    const dropTablesQuery = `
      DROP TABLE IF EXISTS tarea_etiquetas CASCADE;
      DROP TABLE IF EXISTS etiquetas CASCADE;
      DROP TABLE IF EXISTS tareas CASCADE;
      DROP TABLE IF EXISTS categorias CASCADE;
      DROP TABLE IF EXISTS usuarios CASCADE;
      DROP TABLE IF EXISTS migrations CASCADE;
      DROP TYPE IF EXISTS prioridad_enum CASCADE;
      DROP FUNCTION IF EXISTS update_actualizado_en_column() CASCADE;
      DROP FUNCTION IF EXISTS set_completada_en() CASCADE;
    `;
    
    await pool.query(dropTablesQuery);
    console.log('✅ All tables dropped');
    
    // Run migrations to recreate everything
    await runMigrations();
    
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    process.exit(1);
  }
};

/**
 * Check database status
 */
export const checkDatabaseStatus = async (): Promise<void> => {
  try {
    console.log('🔍 Checking database status...');
    
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');
    
    // Check if migrations table exists
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('📊 Existing tables:', tablesResult.rows.map(row => row.table_name));
    
    // Check migrations status if table exists
    const migrationTableExists = tablesResult.rows.some(row => row.table_name === 'migrations');
    if (migrationTableExists) {
      const executedMigrations = await getExecutedMigrations();
      console.log('📋 Executed migrations:', executedMigrations);
    } else {
      console.log('⚠️ Migrations table does not exist');
    }
    
  } catch (error) {
    console.error('❌ Database status check failed:', error);
  } finally {
    await pool.end();
  }
};

/**
 * Command line interface
 */
const main = async (): Promise<void> => {
  const command = process.argv[2];
  
  switch (command) {
    case 'migrate':
      await runMigrations();
      break;
    
    case 'reset':
      await resetDatabase();
      break;
    
    case 'status':
      await checkDatabaseStatus();
      break;
    
    default:
      console.log(`
📚 Database Migration Tool

Usage: node migrate.js <command>

Commands:
  migrate  - Run pending migrations
  reset    - Drop all tables and run all migrations
  status   - Check database and migration status

Examples:
  npm run db:migrate
  npm run db:reset
  node src/scripts/migrate.js status
      `);
      break;
  }
};

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
