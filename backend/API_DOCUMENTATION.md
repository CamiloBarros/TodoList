# TodoList API - Documentación

## 📋 Descripción General

La **TodoList API** es una aplicación backend completa construida con Node.js, Express, PostgreSQL y TypeScript que proporciona funcionalidades completas para la gestión de tareas personales.

## ✨ Características Principales

- 🔐 **Autenticación JWT** - Sistema completo de registro y login
- ✅ **Gestión de Tareas** - CRUD completo con filtros avanzados
- 📁 **Categorías** - Organización de tareas por categorías personalizables
- 🏷️ **Etiquetas** - Sistema de tags para clasificación adicional
- 🔍 **Búsqueda y Filtros** - Búsqueda por texto, filtros por estado, prioridad, fechas
- 📄 **Paginación** - Manejo eficiente de grandes volúmenes de datos
- 📊 **Estadísticas** - Dashboard con métricas de productividad
- 🛡️ **Seguridad** - Rate limiting, CORS, Helmet, validaciones
- 📚 **Documentación Automática** - Swagger/OpenAPI 3.0

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js >= 20.0.0
- PostgreSQL >= 13
- Redis >= 6.0
- npm >= 10.0.0

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/your-username/todolist-backend.git
cd todolist-backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Ejecutar migraciones de base de datos
npm run db:migrate

# Insertar datos de prueba (opcional)
npm run db:seed

# Iniciar en modo desarrollo
npm run dev
```

### Variables de Entorno Requeridas

```env
# Base de datos
DATABASE_URL=postgresql://usuario:password@localhost:5432/todolist_db

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=tu-clave-secreta-muy-segura-de-al-menos-32-caracteres
JWT_EXPIRES_IN=24h

# Servidor
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000

# Seguridad
BCRYPT_SALT_ROUNDS=12
```

## 📚 Documentación de la API

### Acceso a la Documentación Interactiva

Una vez que el servidor esté en funcionamiento, puedes acceder a la documentación completa de Swagger en:

- **Interfaz Web**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- **JSON Schema**: [http://localhost:3000/api/docs.json](http://localhost:3000/api/docs.json)

### Base URL

```
http://localhost:3000/api
```

### Autenticación

La API utiliza **JWT Bearer Token** para la autenticación. Incluye el token en el header de autorización:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Endpoints Principales

#### 🔐 Autenticación

| Método | Endpoint                | Descripción                | Autenticación |
| ------ | ----------------------- | -------------------------- | ------------- |
| POST   | `/auth/register`        | Registrar nuevo usuario    | No            |
| POST   | `/auth/login`           | Iniciar sesión             | No            |
| GET    | `/auth/profile`         | Obtener perfil del usuario | Sí            |
| PUT    | `/auth/profile`         | Actualizar perfil          | Sí            |
| PUT    | `/auth/change-password` | Cambiar contraseña         | Sí            |
| POST   | `/auth/verify-token`    | Verificar token JWT        | Sí            |
| POST   | `/auth/logout`          | Cerrar sesión              | Sí            |
| DELETE | `/auth/deactivate`      | Desactivar cuenta          | Sí            |

#### ✅ Tareas

| Método | Endpoint            | Descripción                | Autenticación |
| ------ | ------------------- | -------------------------- | ------------- |
| GET    | `/tasks`            | Listar tareas con filtros  | Sí            |
| GET    | `/tasks/statistics` | Estadísticas de tareas     | Sí            |
| GET    | `/tasks/:id`        | Obtener tarea específica   | Sí            |
| POST   | `/tasks`            | Crear nueva tarea          | Sí            |
| PUT    | `/tasks/:id`        | Actualizar tarea completa  | Sí            |
| PATCH  | `/tasks/:id/toggle` | Alternar estado completado | Sí            |
| DELETE | `/tasks/:id`        | Eliminar tarea             | Sí            |

#### 📁 Categorías

| Método | Endpoint                     | Descripción                  | Autenticación |
| ------ | ---------------------------- | ---------------------------- | ------------- |
| GET    | `/categories`                | Listar categorías            | Sí            |
| GET    | `/categories/:id`            | Obtener categoría específica | Sí            |
| GET    | `/categories/:id/statistics` | Estadísticas de categoría    | Sí            |
| POST   | `/categories`                | Crear nueva categoría        | Sí            |
| PUT    | `/categories/:id`            | Actualizar categoría         | Sí            |
| DELETE | `/categories/:id`            | Eliminar categoría           | Sí            |

#### 🏷️ Etiquetas

| Método | Endpoint    | Descripción                 | Autenticación |
| ------ | ----------- | --------------------------- | ------------- |
| GET    | `/tags`     | Listar etiquetas            | Sí            |
| GET    | `/tags/:id` | Obtener etiqueta específica | Sí            |
| POST   | `/tags`     | Crear nueva etiqueta        | Sí            |
| PUT    | `/tags/:id` | Actualizar etiqueta         | Sí            |
| DELETE | `/tags/:id` | Eliminar etiqueta           | Sí            |

### Filtros y Parámetros de Consulta

#### Tareas (`/tasks`)

```http
GET /api/tasks?completed=false&priority=high&category=1&search=documentar&page=1&limit=20
```

**Parámetros disponibles:**

- `completed` (boolean): Filtrar por estado
- `priority` (string): low, medium, high
- `category` (integer): ID de categoría
- `due_date` (date): Fecha límite (YYYY-MM-DD)
- `search` (string): Búsqueda en título y descripción
- `tags` (string): IDs de etiquetas separados por coma
- `sort_by` (string): created_at, updated_at, due_date, priority, title
- `sort_direction` (string): asc, desc
- `page` (integer): Número de página (default: 1)
- `limit` (integer): Elementos por página (default: 20, max: 100)

### Ejemplos de Uso

#### Registrar Usuario

```bash
curl -X POST http://localhost:3000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "password": "miPassword123"
  }'
```

#### Iniciar Sesión

```bash
curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "juan@example.com",
    "password": "miPassword123"
  }'
```

#### Crear Tarea

```bash
curl -X POST http://localhost:3000/api/tasks \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -d '{
    "title": "Completar documentación",
    "description": "Finalizar la documentación de la API",
    "priority": "high",
    "due_date": "2025-08-20",
    "category_id": 1,
    "tags": [1, 2]
  }'
```

#### Obtener Tareas con Filtros

```bash
curl -X GET "http://localhost:3000/api/tasks?completed=false&priority=high&page=1&limit=10" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Respuestas de la API

#### Formato de Respuesta Exitosa

```json
{
  "success": true,
  "data": {
    // Datos solicitados
  },
  "message": "Operación exitosa"
}
```

#### Formato de Respuesta con Paginación

```json
{
  "success": true,
  "data": {
    "data": [
      /* array de elementos */
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### Formato de Respuesta de Error

```json
{
  "success": false,
  "error": {
    "message": "Descripción del error",
    "type": "TIPO_ERROR",
    "statusCode": 400,
    "timestamp": "2025-08-14T10:00:00Z"
  }
}
```

### Códigos de Estado HTTP

| Código | Significado           | Descripción                        |
| ------ | --------------------- | ---------------------------------- |
| 200    | OK                    | Solicitud exitosa                  |
| 201    | Created               | Recurso creado exitosamente        |
| 400    | Bad Request           | Datos de entrada inválidos         |
| 401    | Unauthorized          | Token no válido o no proporcionado |
| 403    | Forbidden             | Acceso denegado                    |
| 404    | Not Found             | Recurso no encontrado              |
| 409    | Conflict              | Conflicto con el estado actual     |
| 422    | Unprocessable Entity  | Error de validación                |
| 429    | Too Many Requests     | Límite de rate limiting excedido   |
| 500    | Internal Server Error | Error interno del servidor         |

## 🛠️ Desarrollo

### Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar en modo desarrollo
npm run build           # Compilar TypeScript
npm run start           # Iniciar en producción

# Base de datos
npm run db:migrate      # Ejecutar migraciones
npm run db:seed         # Insertar datos de prueba
npm run db:reset        # Resetear base de datos
npm run db:status       # Estado de migraciones

# Testing
npm test                # Ejecutar pruebas
npm run test:watch      # Ejecutar pruebas en modo watch
npm run test:coverage   # Ejecutar pruebas con cobertura

# Calidad de código
npm run lint            # Ejecutar ESLint
npm run format          # Formatear código con Prettier
npm run type-check      # Verificar tipos TypeScript

# Docker
npm run docker:up       # Iniciar con Docker Compose
npm run docker:down     # Detener contenedores
npm run docker:build    # Construir imagen Docker
```

### Estructura del Proyecto

```
src/
├── config/          # Configuraciones (DB, env, swagger)
├── controllers/     # Controladores de rutas
├── middleware/      # Middleware personalizado
├── routes/          # Definición de rutas
├── services/        # Lógica de negocio
├── types/           # Definiciones TypeScript
├── utils/           # Utilidades helpers
├── scripts/         # Scripts de base de datos
└── __tests__/       # Pruebas unitarias
```

### Tecnologías Utilizadas

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Base de datos**: PostgreSQL + pg
- **Cache**: Redis
- **Autenticación**: JWT
- **Validación**: Joi + express-validator
- **Documentación**: Swagger/OpenAPI 3.0
- **Testing**: Jest + Supertest
- **Linting**: ESLint + Prettier
- **Containerización**: Docker + Docker Compose

## 🚢 Despliegue

### Docker

```bash
# Usando Docker Compose
docker-compose up -d

# Solo la aplicación
docker build -t todolist-api .
docker run -p 3000:3000 --env-file .env todolist-api
```

### Variables de Entorno para Producción

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@prod-db:5432/todolist
REDIS_URL=redis://prod-redis:6379
JWT_SECRET=your-super-secure-production-secret-key
PORT=3000
```

## 🔧 Monitoreo y Salud

### Health Check

```bash
curl http://localhost:3000/health
```

Respuesta:

```json
{
  "status": "OK",
  "timestamp": "2025-08-14T10:00:00Z",
  "environment": "development",
  "version": "1.0.0",
  "uptime": 3600,
  "memory": {
    "used": 45.2,
    "total": 128.0
  }
}
```

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

- **Documentación**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- **Issues**: [GitHub Issues](https://github.com/your-username/todolist-backend/issues)
- **Email**: contact@todolist.com

---

**Desarrollado con ❤️ por el equipo TodoList**
