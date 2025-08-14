/**
 * Swagger/OpenAPI Configuration
 * Configuración de la documentación automática de la API
 */

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';
import appConfig from './env';

const config = appConfig;

// Configuración básica de OpenAPI
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TodoList API',
      version: '1.0.0',
      description: `
        API RESTful para la aplicación TodoList construida con Node.js, Express, PostgreSQL y TypeScript.
        
        ## Características principales:
        - Autenticación JWT
        - Gestión completa de tareas (CRUD)
        - Organización por categorías
        - Sistema de etiquetas
        - Filtros y búsquedas avanzadas
        - Paginación en endpoints que retornan listas
        
        ## Autenticación:
        La mayoría de endpoints requieren autenticación mediante token JWT.
        Incluye el token en el header Authorization: Bearer <token>
      `,
      contact: {
        name: 'TodoList Development Team',
        email: 'contact@todolist.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url:
          config.NODE_ENV === 'production'
            ? `https://api.todolist.com/api`
            : `http://localhost:${config.PORT}/api`,
        description:
          config.NODE_ENV === 'production'
            ? 'Production server'
            : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingresa el token JWT obtenido del endpoint de login',
        },
      },
      schemas: {
        // Esquemas comunes
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  description: 'Descripción del error',
                },
                type: {
                  type: 'string',
                  description: 'Tipo de error',
                },
                statusCode: {
                  type: 'integer',
                  description: 'Código de estado HTTP',
                },
                timestamp: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Timestamp del error',
                },
              },
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              description: 'Mensaje de éxito',
            },
            data: {
              type: 'object',
              description: 'Datos de respuesta',
            },
          },
        },
        PaginationInfo: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              description: 'Página actual',
              example: 1,
            },
            limit: {
              type: 'integer',
              description: 'Elementos por página',
              example: 10,
            },
            total: {
              type: 'integer',
              description: 'Total de elementos',
              example: 100,
            },
            totalPages: {
              type: 'integer',
              description: 'Total de páginas',
              example: 10,
            },
            hasNext: {
              type: 'boolean',
              description: 'Si hay página siguiente',
              example: true,
            },
            hasPrev: {
              type: 'boolean',
              description: 'Si hay página anterior',
              example: false,
            },
          },
        },
        // Esquemas de Usuario
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del usuario',
              example: 1,
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario',
              example: 'usuario@example.com',
            },
            name: {
              type: 'string',
              description: 'Nombre completo del usuario',
              example: 'Juan Pérez',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización',
            },
          },
        },
        UserRegistration: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: {
              type: 'string',
              description: 'Nombre completo del usuario',
              example: 'Juan Pérez',
              minLength: 2,
              maxLength: 100,
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario',
              example: 'usuario@example.com',
            },
            password: {
              type: 'string',
              description: 'Contraseña (mínimo 6 caracteres)',
              example: 'miPassword123',
              minLength: 6,
            },
          },
        },
        UserLogin: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario',
              example: 'usuario@example.com',
            },
            password: {
              type: 'string',
              description: 'Contraseña del usuario',
              example: 'miPassword123',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
              properties: {
                user: {
                  $ref: '#/components/schemas/User',
                },
                token: {
                  type: 'string',
                  description: 'Token JWT para autenticación',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                },
              },
            },
            message: {
              type: 'string',
              example: 'Login successful',
            },
          },
        },
        // Esquemas de Tareas
        Task: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único de la tarea',
              example: 1,
            },
            title: {
              type: 'string',
              description: 'Título de la tarea',
              example: 'Completar documentación API',
            },
            description: {
              type: 'string',
              nullable: true,
              description: 'Descripción detallada de la tarea',
              example:
                'Crear documentación completa con Swagger para todos los endpoints',
            },
            completed: {
              type: 'boolean',
              description: 'Estado de completado de la tarea',
              example: false,
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              description: 'Prioridad de la tarea',
              example: 'medium',
            },
            due_date: {
              type: 'string',
              format: 'date',
              nullable: true,
              description: 'Fecha límite de la tarea',
              example: '2025-08-20',
            },
            user_id: {
              type: 'integer',
              description: 'ID del usuario propietario',
              example: 1,
            },
            category_id: {
              type: 'integer',
              nullable: true,
              description: 'ID de la categoría asignada',
              example: 2,
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización',
            },
            category: {
              $ref: '#/components/schemas/Category',
              nullable: true,
            },
            tags: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Tag',
              },
            },
          },
        },
        TaskCreation: {
          type: 'object',
          required: ['title'],
          properties: {
            title: {
              type: 'string',
              description: 'Título de la tarea',
              example: 'Nueva tarea importante',
              minLength: 1,
              maxLength: 255,
            },
            description: {
              type: 'string',
              description: 'Descripción detallada de la tarea',
              example: 'Descripción detallada de lo que hay que hacer',
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              description: 'Prioridad de la tarea',
              example: 'medium',
              default: 'medium',
            },
            due_date: {
              type: 'string',
              format: 'date',
              description: 'Fecha límite de la tarea',
              example: '2025-08-20',
            },
            category_id: {
              type: 'integer',
              description: 'ID de la categoría asignada',
              example: 2,
            },
            tags: {
              type: 'array',
              items: {
                type: 'integer',
              },
              description: 'Array de IDs de etiquetas',
              example: [1, 3, 5],
            },
          },
        },
        TasksResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
              properties: {
                data: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Task',
                  },
                },
                pagination: {
                  $ref: '#/components/schemas/PaginationInfo',
                },
              },
            },
          },
        },
        // Esquemas de Categorías
        Category: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único de la categoría',
              example: 1,
            },
            name: {
              type: 'string',
              description: 'Nombre de la categoría',
              example: 'Trabajo',
            },
            description: {
              type: 'string',
              nullable: true,
              description: 'Descripción de la categoría',
              example: 'Tareas relacionadas con el trabajo',
            },
            color: {
              type: 'string',
              description: 'Color hexadecimal para la categoría',
              example: '#3B82F6',
              pattern: '^#[0-9A-Fa-f]{6}$',
            },
            user_id: {
              type: 'integer',
              description: 'ID del usuario propietario',
              example: 1,
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización',
            },
          },
        },
        CategoryCreation: {
          type: 'object',
          required: ['name'],
          properties: {
            name: {
              type: 'string',
              description: 'Nombre de la categoría',
              example: 'Personal',
              minLength: 1,
              maxLength: 100,
            },
            description: {
              type: 'string',
              description: 'Descripción de la categoría',
              example: 'Tareas personales y del hogar',
            },
            color: {
              type: 'string',
              description: 'Color hexadecimal para la categoría',
              example: '#EF4444',
              pattern: '^#[0-9A-Fa-f]{6}$',
              default: '#6B7280',
            },
          },
        },
        // Esquemas de Etiquetas
        Tag: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único de la etiqueta',
              example: 1,
            },
            name: {
              type: 'string',
              description: 'Nombre de la etiqueta',
              example: 'urgente',
            },
            color: {
              type: 'string',
              description: 'Color hexadecimal para la etiqueta',
              example: '#EF4444',
              pattern: '^#[0-9A-Fa-f]{6}$',
            },
            user_id: {
              type: 'integer',
              description: 'ID del usuario propietario',
              example: 1,
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización',
            },
          },
        },
        TagCreation: {
          type: 'object',
          required: ['name'],
          properties: {
            name: {
              type: 'string',
              description: 'Nombre de la etiqueta',
              example: 'importante',
              minLength: 1,
              maxLength: 50,
            },
            color: {
              type: 'string',
              description: 'Color hexadecimal para la etiqueta',
              example: '#F59E0B',
              pattern: '^#[0-9A-Fa-f]{6}$',
              default: '#6B7280',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'Endpoints de autenticación y gestión de usuarios',
      },
      {
        name: 'Tasks',
        description: 'Operaciones CRUD para tareas',
      },
      {
        name: 'Categories',
        description: 'Gestión de categorías de tareas',
      },
      {
        name: 'Tags',
        description: 'Gestión de etiquetas para tareas',
      },
      {
        name: 'Health',
        description: 'Endpoints de monitoreo y salud del sistema',
      },
    ],
  },
  apis: [
    './src/routes/*.ts', // Archivos donde están las rutas documentadas
    './src/controllers/*.ts', // Archivos de controladores
  ],
};

// Generar especificación Swagger
const swaggerSpec = swaggerJsdoc(swaggerOptions);

/**
 * Configurar Swagger UI en la aplicación Express
 */
export const setupSwagger = (app: Application): void => {
  // Configuración personalizada de Swagger UI
  const swaggerUiOptions = {
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info .title { color: #1e40af; }
      .swagger-ui .scheme-container { background: #f8fafc; padding: 15px; border-radius: 5px; }
    `,
    customSiteTitle: 'TodoList API Documentation',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      tryItOutEnabled: true,
    },
  };

  // Ruta para servir la documentación
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, swaggerUiOptions)
  );

  // Ruta para obtener el JSON de la especificación
  app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log(
    `📚 API Documentation available at: http://localhost:${config.PORT}/api/docs`
  );
};

export { swaggerSpec };
