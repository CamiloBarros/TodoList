// Global type definitions for the TodoList application
import { Request } from 'express';

export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  password_hash: string;
  creado_en: Date;
  actualizado_en: Date;
  activo: boolean;
}

export interface UsuarioCreacion {
  email: string;
  nombre: string;
  password: string;
}

export interface UsuarioLogin {
  email: string;
  password: string;
}

export interface UsuarioPublico {
  id: number;
  email: string;
  nombre: string;
  creado_en: Date;
  actualizado_en: Date;
}

export interface Categoria {
  id: number;
  usuario_id: number;
  nombre: string;
  descripcion?: string;
  color: string;
  creado_en: Date;
  actualizado_en: Date;
}

export interface CategoriaCreacion {
  nombre: string;
  descripcion?: string;
  color?: string;
}

export type Prioridad = 'baja' | 'media' | 'alta';

export interface Tarea {
  id: number;
  usuario_id: number;
  categoria_id?: number;
  titulo: string;
  descripcion?: string;
  completada: boolean;
  prioridad: Prioridad;
  fecha_vencimiento?: Date;
  completada_en?: Date;
  creado_en: Date;
  actualizado_en: Date;

  // Relaciones
  categoria?: Categoria;
  etiquetas?: Etiqueta[];
}

export interface TareaCreacion {
  titulo: string;
  descripcion?: string;
  categoria_id?: number;
  prioridad?: Prioridad;
  fecha_vencimiento?: Date;
  etiquetas?: number[];
}

export interface TareaActualizacion {
  titulo?: string;
  descripcion?: string;
  categoria_id?: number;
  prioridad?: Prioridad;
  fecha_vencimiento?: Date;
  completada?: boolean;
  etiquetas?: number[];
}

export interface Etiqueta {
  id: number;
  usuario_id: number;
  nombre: string;
  color: string;
  creado_en: Date;
  actualizado_en?: Date;
  uso_count?: number;
}

export interface EtiquetaCreacion {
  nombre: string;
  color?: string;
}

// DTOs para etiquetas
export interface CrearEtiquetaDTO {
  nombre: string;
  color?: string;
}

export interface ActualizarEtiquetaDTO {
  nombre?: string;
  color?: string;
}

export interface TareaEtiqueta {
  id: number;
  tarea_id: number;
  etiqueta_id: number;
  creado_en: Date;
}

// Filtros y consultas
export interface FiltrosTareas {
  completada?: boolean;
  categoria?: number;
  prioridad?: Prioridad;
  fecha_vencimiento?: string;
  busqueda?: string;
  etiquetas?: string;
  ordenar?: 'creado_en' | 'fecha_vencimiento' | 'prioridad' | 'titulo';
  direccion?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ResultadoPaginado<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// JWT
export interface JWTPayload {
  id: number;
  email: string;
  iat?: number;
  exp?: number;
  iss?: string;
}

// Responses de API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    type: string;
    statusCode: number;
    timestamp: string;
    field?: string;
    stack?: string;
  };
  request?: {
    method: string;
    url: string;
    ip: string;
    userAgent: string;
  };
}

// Middleware types
export interface AuthenticatedRequest extends Request {
  user: UsuarioPublico;
}

// Database types
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  maxConnections: number;
  idleTimeout: number;
  connectionTimeout: number;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  database: number;
  defaultTTL: number;
}

// Configuration types
export interface AppConfig {
  NODE_ENV: string;
  PORT: number;
  API_VERSION: string;
  database: DatabaseConfig;
  redis: RedisConfig;
  jwt: {
    secret: string;
    expiresIn: string;
    issuer: string;
    algorithm: string;
  };
  security: {
    bcryptRounds: number;
    rateLimitWindowMs: number;
    rateLimitMaxRequests: number;
    rateLimitMessage: string;
  };
  cors: {
    origin: string;
    methods: string;
    allowedHeaders: string;
    credentials: boolean;
  };
  logging: {
    level: string;
    format: string;
    errorFile: string;
    combinedFile: string;
    maxSize: string;
    maxFiles: string;
  };
  upload: {
    maxSize: number;
    allowedTypes: string[];
    destination: string;
  };
  email: {
    service: string;
    user?: string;
    password?: string;
    from: string;
  };
  cache: {
    defaultTTL: number;
    searchTTL: number;
    statsTTL: number;
  };
  pagination: {
    defaultPageSize: number;
    maxPageSize: number;
  };
  features: {
    emailNotifications: boolean;
    fileUpload: boolean;
    bulkOperations: boolean;
  };
  helmet: {
    contentSecurityPolicy: boolean;
    hstsMaxAge: number;
  };
}

// Estadísticas
export interface EstadisticasUsuario {
  totalTareas: number;
  tareasCompletadas: number;
  tareasPendientes: number;
  tareasVencidas: number;
  tareasPorPrioridad: {
    alta: number;
    media: number;
    baja: number;
  };
  tareasPorCategoria: {
    categoria: string;
    color: string;
    total: number;
  }[];
  productividadSemanal: {
    semana: string;
    completadas: number;
    creadas: number;
  }[];
}

export interface EstadisticasCategoria {
  categoria_id: number;
  nombre: string;
  color: string;
  total_tareas: number;
  tareas_completadas: number;
  tareas_pendientes: number;
  tareas_vencidas: number;
  distribucion_prioridad: {
    alta: number;
    media: number;
    baja: number;
  };
  porcentaje_completado: number;
}

export interface EstadisticasEtiqueta {
  etiqueta_id: number;
  nombre: string;
  color: string;
  total_tareas: number;
  tareas_completadas: number;
  tareas_pendientes: number;
  tareas_vencidas: number;
  distribucion_prioridad: {
    alta: number;
    media: number;
    baja: number;
  };
  porcentaje_completado: number;
}

// Enums y códigos de error
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  FILE_UPLOAD_ERROR = 'FILE_UPLOAD_ERROR'
}

export class DatabaseError extends Error {
  public code: ErrorCode;
  public details?: string;

  constructor(message: string, code: ErrorCode, details?: string) {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
    this.details = details;
  }
}

// Health Check
export interface HealthStatus {
  status: 'OK' | 'ERROR';
  timestamp: string;
  environment: string;
  version: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
  };
  database?: {
    connected: boolean;
    responseTime?: number;
  };
  redis?: {
    connected: boolean;
    responseTime?: number;
  };
}
