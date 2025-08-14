# TodoList Backend API

Backend API para aplicación TodoList construida con Node.js, Express, PostgreSQL y Redis.

## 🚀 Características

- **API RESTful** con Express.js
- **Base de datos PostgreSQL** con migraciones automáticas
- **Cache Redis** para optimización de performance
- **Autenticación JWT** segura
- **Docker Compose** para desarrollo local
- **Validación de datos** con Joi
- **Rate limiting** y middleware de seguridad
- **Logging** estructurado
- **Testing** automatizado con Jest

## 📋 Requisitos

- Node.js 20+
- Docker y Docker Compose
- npm 10+

## 🛠️ Configuración de Desarrollo

### 1. Clonar y configurar

```bash
cd backend
cp .env.example .env
# Editar .env con tus configuraciones
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Iniciar servicios con Docker

```bash
# Iniciar PostgreSQL y Redis
docker-compose up -d postgres redis

# O iniciar todo el stack
docker-compose up -d
```

### 4. Ejecutar migraciones

```bash
npm run db:migrate
```

### 5. Poblar base de datos (opcional)

```bash
npm run db:seed
```

### 6. Iniciar servidor de desarrollo

```bash
npm run dev
```

## 📚 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Servidor con hot reload
npm start               # Servidor producción

# Base de datos
npm run db:migrate      # Ejecutar migraciones
npm run db:seed         # Poblar con datos de prueba
npm run db:reset        # Reset completo (migrate + seed)

# Testing
npm test               # Ejecutar tests
npm run test:watch     # Tests en modo watch
npm run test:coverage  # Tests con coverage

# Código
npm run lint           # Linting con corrección
npm run format         # Formatear código

# Docker
npm run docker:up      # Levantar servicios
npm run docker:down    # Bajar servicios
npm run docker:logs    # Ver logs del backend
```

## 🔗 Endpoints de la API

### Health Check
- `GET /health` - Estado del servidor

### Autenticación
- `POST /api/auth/registro` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/perfil` - Obtener perfil (protegido)

### Tareas
- `GET /api/tareas` - Listar tareas con filtros
- `POST /api/tareas` - Crear tarea
- `PUT /api/tareas/:id` - Actualizar tarea
- `DELETE /api/tareas/:id` - Eliminar tarea
- `PATCH /api/tareas/:id/completar` - Marcar completada

### Categorías
- `GET /api/categorias` - Listar categorías
- `POST /api/categorias` - Crear categoría
- `PUT /api/categorias/:id` - Actualizar categoría
- `DELETE /api/categorias/:id` - Eliminar categoría

### Etiquetas
- `GET /api/etiquetas` - Listar etiquetas
- `POST /api/etiquetas` - Crear etiqueta

## 🗄️ Base de Datos

### Estructura
- **usuarios** - Cuentas de usuario
- **categorias** - Categorías de tareas
- **tareas** - Tareas principales
- **etiquetas** - Etiquetas/tags
- **tarea_etiquetas** - Relación muchos-a-muchos

### Migraciones
Las migraciones se ejecutan automáticamente en orden numérico:
1. `001_create_usuarios.sql`
2. `002_create_categorias.sql`
3. `003_create_tareas.sql`
4. `004_create_etiquetas.sql`
5. `005_create_tarea_etiquetas.sql`

## 🔧 Configuración

### Variables de Entorno
Ver `.env.example` para todas las configuraciones disponibles.

### Docker Compose
Los servicios incluidos:
- **postgres**: PostgreSQL 16
- **redis**: Redis 7 
- **backend**: API Node.js
- **pgadmin**: Administrador de DB (opcional)

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests específicos
npm test auth.test.js

# Coverage report
npm run test:coverage
```

## 📝 Logging

Los logs se escriben en:
- `logs/error.log` - Solo errores
- `logs/combined.log` - Todos los logs
- Consola - Desarrollo

## 🔒 Seguridad

- Autenticación JWT con expiración
- Rate limiting por IP
- Validación de entrada con Joi
- Headers de seguridad con Helmet
- Hash de contraseñas con bcrypt
- Consultas parametrizadas (SQL injection protection)

## 📦 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/         # Configuración
│   ├── controllers/    # Controladores de rutas
│   ├── middleware/     # Middleware personalizado
│   ├── models/         # Modelos de datos
│   ├── routes/         # Definición de rutas
│   ├── services/       # Lógica de negocio
│   ├── scripts/        # Scripts de utilidad
│   └── app.js          # Aplicación principal
├── migrations/         # Migraciones SQL
├── logs/              # Archivos de log
├── uploads/           # Archivos subidos
├── docker-compose.yml
└── Dockerfile
```

## 🚀 Despliegue

### Producción
1. Configurar variables de entorno de producción
2. Ejecutar migraciones
3. Usar `npm start` o PM2
4. Configurar reverse proxy (nginx)
5. Configurar SSL/TLS

### Docker
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🐛 Troubleshooting

### Errores comunes:
- **Puerto en uso**: Cambiar `PORT` en `.env`
- **DB connection failed**: Verificar servicios Docker
- **Migration errors**: Verificar permisos de DB
- **Redis connection**: Verificar configuración Redis

### Logs útiles:
```bash
# Ver logs del backend
docker-compose logs -f backend

# Ver logs de la base de datos
docker-compose logs -f postgres
```

## 🤝 Contribución

1. Fork del proyecto
2. Crear branch: `git checkout -b feature/nueva-caracteristica`
3. Commit: `git commit -m 'feat: agregar nueva característica'`
4. Push: `git push origin feature/nueva-caracteristica`
5. Pull Request

## 📄 Licencia

MIT License - ver archivo LICENSE para detalles.
