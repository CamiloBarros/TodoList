// Global type definitions for the TodoList application
import { Request } from 'express';

export interface User {
  id: number;
  email: string;
  name: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
  active: boolean;
}

export interface UserCreation {
  email: string;
  name: string;
  password: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface PublicUser {
  id: number;
  email: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface Category {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  color: string;
  created_at: Date;
  updated_at: Date;
}

export interface CategoryCreation {
  name: string;
  description?: string;
  color?: string;
}

export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  user_id: number;
  category_id?: number;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  due_date?: Date;
  completed_at?: Date;
  created_at: Date;
  updated_at: Date;

  // Relations
  category?: Category;
  tags?: Tag[];
}

export interface TaskCreation {
  title: string;
  description?: string;
  category_id?: number;
  priority?: Priority;
  due_date?: Date;
  tags?: number[];
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  category_id?: number;
  priority?: Priority;
  due_date?: Date;
  completed?: boolean;
  tags?: number[];
}

export interface Tag {
  id: number;
  user_id: number;
  name: string;
  color: string;
  created_at: Date;
  updated_at?: Date;
  usage_count?: number;
}

export interface TagCreation {
  name: string;
  color?: string;
}

// DTOs for tags
export interface CreateTagDTO {
  name: string;
  color?: string;
}

export interface UpdateTagDTO {
  name?: string;
  color?: string;
}

export interface TaskTag {
  id: number;
  task_id: number;
  tag_id: number;
  created_at: Date;
}

// Filters and queries
export interface TaskFilters {
  completed?: boolean;
  category?: number;
  priority?: Priority;
  due_date?: string;
  search?: string;
  tags?: string;
  sort_by?: 'created_at' | 'due_date' | 'priority' | 'title';
  sort_direction?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
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

// API Responses
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
  user: PublicUser;
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

// Statistics
export interface UserStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  tasksByPriority: {
    high: number;
    medium: number;
    low: number;
  };
  tasksByCategory: {
    category: string;
    color: string;
    total: number;
  }[];
  weeklyProductivity: {
    week: string;
    completed: number;
    created: number;
  }[];
}

export interface CategoryStats {
  category_id: number;
  name: string;
  color: string;
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  overdue_tasks: number;
  priority_distribution: {
    high: number;
    medium: number;
    low: number;
  };
  completion_percentage: number;
}

export interface TagStats {
  tag_id: number;
  name: string;
  color: string;
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  overdue_tasks: number;
  priority_distribution: {
    high: number;
    medium: number;
    low: number;
  };
  completion_percentage: number;
}

// Enums and error codes
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

