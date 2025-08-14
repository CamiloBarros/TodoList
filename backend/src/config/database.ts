import { Pool, PoolClient, QueryResult } from 'pg';
import { createClient, RedisClientType } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

/**
 * PostgreSQL Database Configuration
 */
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'todolist_db',
  user: process.env.DB_USER || 'todolist_user',
  password: process.env.DB_PASSWORD || 'todolist_password',
  max: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000'),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

/**
 * Redis Cache Configuration
 */
const redisConfig = {
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  password: process.env.REDIS_PASSWORD || undefined,
  database: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
};

/**
 * Create PostgreSQL connection pool
 */
const pool = new Pool(dbConfig);

/**
 * Create Redis client
 */
const redisClient = createClient(redisConfig) as RedisClientType;

/**
 * Handle PostgreSQL connection events
 */
pool.on('connect', (client: PoolClient) => {
  console.log('📦 Nueva conexión PostgreSQL establecida');
});

pool.on('error', (err: Error, client: PoolClient) => {
  console.error('❌ Error inesperado en cliente PostgreSQL:', err);
  process.exit(-1);
});

/**
 * Handle Redis connection events
 */
redisClient.on('connect', () => {
  console.log('🔗 Conectando a Redis...');
});

redisClient.on('ready', () => {
  console.log('✅ Cliente Redis listo');
});

redisClient.on('error', (err: Error) => {
  console.error('❌ Error de conexión Redis:', err);
});

redisClient.on('end', () => {
  console.log('🔚 Conexión Redis cerrada');
});

/**
 * Initialize Redis connection
 */
const initializeRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    console.log('🎯 Redis conectado exitosamente');
  } catch (error) {
    console.error('❌ Error al conectar Redis:', error);
    process.exit(1);
  }
};

/**
 * Test database connection
 */
const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as version');
    console.log('✅ Conexión PostgreSQL exitosa:', {
      time: result.rows[0].current_time,
      version: result.rows[0].version.split(' ')[0],
    });
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Error de conexión PostgreSQL:', error);
    return false;
  }
};

/**
 * Test Redis connection
 */
const testRedisConnection = async (): Promise<boolean> => {
  try {
    await redisClient.ping();
    console.log('✅ Conexión Redis exitosa');
    return true;
  } catch (error) {
    console.error('❌ Error de conexión Redis:', error);
    return false;
  }
};

/**
 * Initialize all database connections
 */
const initializeDatabases = async (): Promise<void> => {
  console.log('🚀 Inicializando conexiones de base de datos...');
  
  // Test PostgreSQL connection
  const pgConnected = await testDatabaseConnection();
  if (!pgConnected) {
    throw new Error('No se pudo conectar a PostgreSQL');
  }
  
  // Initialize and test Redis connection
  await initializeRedis();
  const redisConnected = await testRedisConnection();
  if (!redisConnected) {
    throw new Error('No se pudo conectar a Redis');
  }
  
  console.log('🎉 Todas las conexiones de base de datos inicializadas');
};

/**
 * Close all database connections gracefully
 */
const closeDatabases = async (): Promise<void> => {
  console.log('🔌 Cerrando conexiones de base de datos...');
  
  try {
    await pool.end();
    console.log('✅ PostgreSQL pool cerrado');
  } catch (error) {
    console.error('❌ Error cerrando PostgreSQL:', error);
  }
  
  try {
    await redisClient.quit();
    console.log('✅ Redis client cerrado');
  } catch (error) {
    console.error('❌ Error cerrando Redis:', error);
  }
};

/**
 * Execute SQL query with error handling
 */
const query = async (text: string, params: any[] = []): Promise<QueryResult> => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('🔍 Query ejecutado:', { 
      text: text.substring(0, 50) + '...', 
      duration, 
      rows: result.rowCount 
    });
    return result;
  } catch (error) {
    console.error('❌ Error en query:', { 
      text: text.substring(0, 50) + '...', 
      error: error instanceof Error ? error.message : error 
    });
    throw error;
  }
};

/**
 * Execute transaction with automatic rollback on error
 */
const transaction = async <T>(callback: (client: PoolClient) => Promise<T>): Promise<T> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export {
  pool,
  redisClient,
  query,
  transaction,
  initializeDatabases,
  closeDatabases,
  testDatabaseConnection,
  testRedisConnection,
};
