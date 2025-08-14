# Diagrama de Componentes - Todo List Application

## Arquitectura General del Sistema

```mermaid
graph TB
    subgraph "Cliente (Browser)"
        subgraph "Frontend - React 19"
            UI[User Interface]
            RC[React Components]
            RH[React Hooks]
            CTX[Context API]
            RT[React Router]
        end
    end

    subgraph "Servidor de Aplicación"
        subgraph "Backend - Node.js/Express"
            API[API Gateway]
            AUTH[Auth Middleware]
            CTRL[Controllers]
            SRV[Services]
            VALID[Validators]
            MW[Middlewares]
        end
    end

    subgraph "Base de Datos"
        DB[(PostgreSQL)]
        CACHE[(Redis Cache)]
    end

    subgraph "Infraestructura"
        DOCKER[Docker Compose]
        ENV[Environment Config]
        LOG[Logging Service]
    end

    %% Conexiones principales
    UI --> API
    RC --> RH
    RH --> CTX
    CTX --> RT

    API --> AUTH
    AUTH --> CTRL
    CTRL --> SRV
    SRV --> DB
    SRV --> CACHE

    MW --> VALID
    MW --> LOG

    DOCKER --> DB
    DOCKER --> CACHE
    ENV --> API
```

## Detalle de Componentes Frontend (React 19)

```mermaid
graph TB
    subgraph "App Component"
        APP[App.jsx]
        ROUTER[Router Setup]
        PROVIDERS[Context Providers]
    end

    subgraph "Layout Components"
        LAYOUT[Layout.jsx]
        HEADER[Header.jsx]
        SIDEBAR[Sidebar.jsx]
        FOOTER[Footer.jsx]
    end

    subgraph "Auth Components"
        LOGIN[FormularioLogin.jsx]
        REGISTER[FormularioRegistro.jsx]
        PROFILE[PerfilUsuario.jsx]
    end

    subgraph "Task Components"
        TASKLIST[ListaTareas.jsx]
        TASKITEM[ItemTarea.jsx]
        TASKFORM[FormularioTarea.jsx]
        TASKFILTER[FiltroTareas.jsx]
        TASKSEARCH[BusquedaTareas.jsx]
    end

    subgraph "Category Components"
        CATLIST[ListaCategorias.jsx]
        CATFORM[FormularioCategoria.jsx]
        CATSEL[SelectorCategoria.jsx]
    end

    subgraph "Tag Components"
        TAGLIST[ListaEtiquetas.jsx]
        TAGFORM[FormularioEtiqueta.jsx]
        TAGSEL[SelectorEtiquetas.jsx]
    end

    subgraph "Common Components"
        LOADING[Cargando.jsx]
        ERROR[MensajeError.jsx]
        MODAL[Modal.jsx]
        BUTTON[Button.jsx]
        INPUT[Input.jsx]
    end

    subgraph "Custom Hooks"
        USEAUTH[useAuth.js]
        USETASKS[useTareas.js]
        USECAT[useCategorias.js]
        USETAGS[useEtiquetas.js]
        USEAPI[useApi.js]
        USELOCAL[useLocalStorage.js]
    end

    subgraph "Context & State"
        AUTHCTX[AuthContext.jsx]
        THEMECTX[ThemeContext.jsx]
        TASKCTX[TaskContext.jsx]
    end

    subgraph "Services"
        APISERVICE[api.js]
        AUTHAPI[authApi.js]
        TASKAPI[tareasApi.js]
        CATAPI[categoriasApi.js]
    end

    %% Relaciones
    APP --> PROVIDERS
    PROVIDERS --> AUTHCTX
    PROVIDERS --> THEMECTX
    PROVIDERS --> TASKCTX

    LAYOUT --> HEADER
    LAYOUT --> SIDEBAR
    LAYOUT --> FOOTER

    TASKLIST --> TASKITEM
    TASKLIST --> TASKFILTER
    TASKLIST --> TASKSEARCH

    TASKFORM --> CATSEL
    TASKFORM --> TAGSEL

    LOGIN --> USEAUTH
    REGISTER --> USEAUTH
    TASKLIST --> USETASKS
    CATLIST --> USECAT

    USEAUTH --> AUTHAPI
    USETASKS --> TASKAPI
    USECAT --> CATAPI

    AUTHAPI --> APISERVICE
    TASKAPI --> APISERVICE
    CATAPI --> APISERVICE
```

## Detalle de Componentes Backend (Node.js/Express)

```mermaid
graph TB
    subgraph "Entry Point"
        SERVER[server.js]
        APP[app.js]
    end

    subgraph "Routing Layer"
        ROUTES[Routes Index]
        AUTHROUTES[auth.js]
        TASKROUTES[tareas.js]
        CATROUTES[categorias.js]
        TAGROUTES[etiquetas.js]
    end

    subgraph "Middleware Layer"
        AUTHMW[authMiddleware.js]
        ERRORMW[errorHandler.js]
        VALIDMW[validation.js]
        LIMITMW[rateLimiter.js]
        LOGMW[logger.js]
        CORSMW[cors.js]
        HELMW[helmet.js]
    end

    subgraph "Controller Layer"
        AUTHCTRL[authController.js]
        TASKCTRL[tareasController.js]
        CATCTRL[categoriasController.js]
        TAGCTRL[etiquetasController.js]
        STATCTRL[estadisticasController.js]
    end

    subgraph "Service Layer"
        AUTHSRV[authService.js]
        TASKSRV[tareasService.js]
        CATSRV[categoriasService.js]
        TAGSRV[etiquetasService.js]
        EMAILSRV[emailService.js]
        CACHESRV[cacheService.js]
    end

    subgraph "Data Layer"
        USERMODEL[Usuario.js]
        TASKMODEL[Tarea.js]
        CATMODEL[Categoria.js]
        TAGMODEL[Etiqueta.js]
    end

    subgraph "Database Layer"
        DBCONFIG[database.js]
        MIGRATIONS[migrations/]
        SEEDS[seeds/]
    end

    subgraph "Utilities"
        JWTUTIL[jwt.js]
        BCRYPTUTIL[bcrypt.js]
        VALIDATORS[validators.js]
        HELPERS[helpers.js]
    end

    subgraph "Configuration"
        ENVCONFIG[env.js]
        APPCONFIG[config.js]
    end

    %% Flujo de datos
    SERVER --> APP
    APP --> ROUTES

    ROUTES --> AUTHROUTES
    ROUTES --> TASKROUTES
    ROUTES --> CATROUTES
    ROUTES --> TAGROUTES

    AUTHROUTES --> AUTHMW
    TASKROUTES --> AUTHMW
    CATROUTES --> AUTHMW
    TAGROUTES --> AUTHMW

    AUTHMW --> AUTHCTRL
    TASKROUTES --> TASKCTRL
    CATROUTES --> CATCTRL
    TAGROUTES --> TAGCTRL

    AUTHCTRL --> AUTHSRV
    TASKCTRL --> TASKSRV
    CATCTRL --> CATSRV
    TAGCTRL --> TAGSRV

    AUTHSRV --> USERMODEL
    TASKSRV --> TASKMODEL
    CATSRV --> CATMODEL
    TAGSRV --> TAGMODEL

    USERMODEL --> DBCONFIG
    TASKMODEL --> DBCONFIG
    CATMODEL --> DBCONFIG
    TAGMODEL --> DBCONFIG

    AUTHSRV --> JWTUTIL
    AUTHSRV --> BCRYPTUTIL
    TASKSRV --> CACHESRV
```

## Arquitectura de Datos y Flujo

```mermaid
graph LR
    subgraph "Frontend State Management"
        LS[Local State]
        GS[Global State - Context]
        CS[Component State]
        LS_STORAGE[localStorage]
    end

    subgraph "API Communication"
        HTTP[HTTP Client - Axios]
        INT[Interceptors]
        CACHE_CLIENT[Client Cache]
    end

    subgraph "Backend Processing"
        VALIDATION[Request Validation]
        BUSINESS[Business Logic]
        DATA_ACCESS[Data Access Layer]
    end

    subgraph "Data Persistence"
        PG[PostgreSQL]
        REDIS[Redis Cache]
        FILES[File Storage]
    end

    %% Flujo de datos
    CS --> GS
    GS --> LS
    LS --> LS_STORAGE

    GS --> HTTP
    HTTP --> INT
    INT --> CACHE_CLIENT

    HTTP --> VALIDATION
    VALIDATION --> BUSINESS
    BUSINESS --> DATA_ACCESS

    DATA_ACCESS --> PG
    DATA_ACCESS --> REDIS
    BUSINESS --> FILES

    %% Flujo de respuesta
    PG --> DATA_ACCESS
    REDIS --> DATA_ACCESS
    DATA_ACCESS --> BUSINESS
    BUSINESS --> HTTP
    HTTP --> GS
```

## Patrones de Arquitectura Implementados

### 🏗️ **Frontend Patterns**

1. **Component Composition Pattern**

   - Componentes reutilizables y modulares
   - Props drilling evitado con Context API
   - Higher-Order Components para funcionalidad compartida

2. **Custom Hooks Pattern**

   - Lógica de negocio separada de la UI
   - Reutilización de estado y efectos
   - Testing más fácil

3. **Context + Reducer Pattern**

   - Estado global predecible
   - Acciones tipadas
   - Performance optimizada con useMemo

4. **Service Layer Pattern**
   - API calls centralizadas
   - Interceptors para auth y errores
   - Transformación de datos consistente

### 🚀 **Backend Patterns**

1. **MVC Pattern (Modificado)**

   - Controllers: Manejo de requests/responses
   - Services: Lógica de negocio
   - Models: Acceso a datos

2. **Middleware Pattern**

   - Cross-cutting concerns
   - Pipeline de procesamiento
   - Composabilidad

3. **Repository Pattern**

   - Abstracción de acceso a datos
   - Queries reutilizables
   - Testing mockeable

4. **Dependency Injection**
   - Servicios desacoplados
   - Configuración centralizada
   - Testing unitario facilitado

### 🔄 **Integration Patterns**

1. **API Gateway Pattern**

   - Punto único de entrada
   - Rate limiting centralizado
   - Logging y monitoring

2. **Circuit Breaker Pattern**

   - Resilencia ante fallos
   - Fallback strategies
   - Monitoring de health

3. **Cache-Aside Pattern**
   - Performance optimizada
   - Datos frecuentes en memoria
   - Invalidación inteligente

## Tecnologías y Librerías por Capa

### 📱 **Frontend Stack**

```json
{
  "core": ["react@19", "react-dom@19"],
  "routing": ["react-router-dom@6"],
  "http": ["axios@1.7"],
  "build": ["vite@5.4", "@vitejs/plugin-react@4.3"],
  "testing": ["vitest@2.0", "@testing-library/react@16"],
  "styling": ["css-modules", "postcss"]
}
```

### 🚀 **Backend Stack**

```json
{
  "core": ["express@4.19", "node@20"],
  "database": ["pg@8.12", "pg-pool"],
  "auth": ["jsonwebtoken@9.0", "bcryptjs@2.4"],
  "validation": ["joi@17.13"],
  "security": ["helmet@7.1", "cors@2.8", "express-rate-limit@7.4"],
  "utils": ["morgan@1.10", "dotenv@16.4"],
  "testing": ["jest@29.7", "supertest@7.0"]
}
```

### 🗄️ **Database & Infrastructure**

```json
{
  "database": ["postgresql@16-alpine"],
  "cache": ["redis@7-alpine"],
  "container": ["docker", "docker-compose"],
  "monitoring": ["morgan", "winston"]
}
```

## Consideraciones de Escalabilidad

### 📈 **Performance Optimizations**

- **Frontend**: Code splitting, lazy loading, memoization
- **Backend**: Connection pooling, query optimization, caching
- **Database**: Proper indexing, query analysis, partitioning

### 🔄 **Horizontal Scaling Ready**

- Stateless backend services
- Database connection pooling
- External session storage (Redis)
- Load balancer ready

### 🛡️ **Security Layers**

- Input validation at multiple levels
- SQL injection prevention
- XSS protection
- CSRF tokens
- Rate limiting per user/IP
