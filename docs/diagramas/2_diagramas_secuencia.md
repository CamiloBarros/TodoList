# Diagramas de Secuencia - Todo List Application

## 1. Flujo de Autenticación de Usuario

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend (React)
    participant B as Backend (Express)
    participant DB as PostgreSQL
    participant JWT as JWT Service

    Note over U,JWT: Proceso de Registro
    U->>F: Completa formulario de registro
    F->>F: Valida datos del formulario
    F->>B: POST /api/auth/registro
    B->>B: Valida datos con Joi
    B->>DB: Verifica si email existe
    DB-->>B: Resultado de consulta
    alt Email ya existe
        B-->>F: 409 Conflict
        F-->>U: Muestra error
    else Email disponible
        B->>B: Hash password con bcrypt
        B->>DB: INSERT nuevo usuario
        DB-->>B: Usuario creado
        B->>JWT: Genera token JWT
        JWT-->>B: Token generado
        B-->>F: 201 Created + token
        F->>F: Guarda token en localStorage
        F-->>U: Redirige a dashboard
    end

    Note over U,JWT: Proceso de Login
    U->>F: Completa formulario de login
    F->>F: Valida datos del formulario
    F->>B: POST /api/auth/login
    B->>B: Valida credenciales
    B->>DB: SELECT usuario por email
    DB-->>B: Datos del usuario
    alt Usuario no encontrado
        B-->>F: 401 Unauthorized
        F-->>U: Muestra error
    else Usuario encontrado
        B->>B: Compara password con bcrypt
        alt Password incorrecto
            B-->>F: 401 Unauthorized
            F-->>U: Muestra error
        else Password correcto
            B->>JWT: Genera token JWT
            JWT-->>B: Token generado
            B-->>F: 200 OK + token + datos usuario
            F->>F: Guarda token en localStorage
            F->>F: Actualiza contexto de auth
            F-->>U: Redirige a dashboard
        end
    end
```

## 2. Gestión CRUD de Tareas

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend (React)
    participant B as Backend (Express)
    participant A as Auth Middleware
    participant DB as PostgreSQL

    Note over U,DB: Crear Nueva Tarea
    U->>F: Completa formulario de tarea
    F->>F: Valida datos localmente
    F->>B: POST /api/tareas (+ JWT Header)
    B->>A: Verifica JWT token
    A->>A: Decodifica y valida token
    alt Token inválido
        A-->>F: 401 Unauthorized
        F-->>U: Redirige a login
    else Token válido
        A->>B: Continúa con usuario_id
        B->>B: Valida datos con Joi
        B->>DB: INSERT nueva tarea
        DB-->>B: Tarea creada con ID
        B->>DB: SELECT tarea completa (con categoría/etiquetas)
        DB-->>B: Datos completos de tarea
        B-->>F: 201 Created + tarea
        F->>F: Actualiza estado local
        F-->>U: Muestra tarea en lista
    end

    Note over U,DB: Listar Tareas con Filtros
    U->>F: Aplica filtros en UI
    F->>F: Construye query parameters
    F->>B: GET /api/tareas?filtros (+ JWT Header)
    B->>A: Verifica JWT token
    A->>B: Token válido, continúa
    B->>B: Procesa parámetros de filtro
    B->>DB: SELECT tareas con JOINs y WHERE
    DB-->>B: Lista de tareas filtradas
    B-->>F: 200 OK + tareas
    F->>F: Actualiza estado de tareas
    F-->>U: Muestra lista filtrada

    Note over U,DB: Actualizar Estado de Tarea
    U->>F: Click en checkbox completar
    F->>F: Actualización optimista
    F->>B: PATCH /api/tareas/:id/completar (+ JWT Header)
    B->>A: Verifica JWT token
    A->>B: Token válido, continúa
    B->>DB: SELECT tarea para verificar ownership
    DB-->>B: Datos de tarea
    alt Tarea no pertenece al usuario
        B-->>F: 403 Forbidden
        F->>F: Revierte cambio optimista
        F-->>U: Muestra error
    else Tarea pertenece al usuario
        B->>DB: UPDATE tarea SET completada, completada_en
        DB-->>B: Tarea actualizada
        B-->>F: 200 OK + tarea actualizada
        F->>F: Confirma cambio optimista
        F-->>U: Muestra estado actualizado
    end

    Note over U,DB: Eliminar Tarea
    U->>F: Click en botón eliminar
    F->>F: Muestra confirmación
    U->>F: Confirma eliminación
    F->>F: Actualización optimista (oculta tarea)
    F->>B: DELETE /api/tareas/:id (+ JWT Header)
    B->>A: Verifica JWT token
    A->>B: Token válido, continúa
    B->>DB: SELECT tarea para verificar ownership
    DB-->>B: Datos de tarea
    alt Tarea no pertenece al usuario
        B-->>F: 403 Forbidden
        F->>F: Revierte cambio optimista (muestra tarea)
        F-->>U: Muestra error de permisos
    else Tarea pertenece al usuario
        B->>DB: DELETE FROM tarea_etiquetas WHERE tarea_id
        B->>DB: DELETE FROM tareas WHERE id
        DB-->>B: Tarea eliminada
        B-->>F: 204 No Content
        F->>F: Confirma eliminación optimista
        F-->>U: Tarea removida de la lista
    end
```

## 3. Gestión de Categorías y Etiquetas

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend (React)
    participant B as Backend (Express)
    participant DB as PostgreSQL

    Note over U,DB: Crear Categoría
    U->>F: Abre modal de nueva categoría
    F->>F: Muestra formulario
    U->>F: Completa nombre y color
    F->>B: POST /api/categorias (+ JWT Header)
    B->>B: Valida JWT y datos
    B->>DB: INSERT nueva categoría
    DB-->>B: Categoría creada
    B-->>F: 201 Created + categoría
    F->>F: Actualiza lista de categorías
    F->>F: Cierra modal
    F-->>U: Categoría disponible en selector

    Note over U,DB: Crear Etiqueta
    U->>F: Abre formulario de nueva etiqueta
    F->>F: Muestra formulario con nombre y color
    U->>F: Completa datos de etiqueta
    F->>B: POST /api/etiquetas (+ JWT Header)
    B->>B: Valida JWT y datos
    B->>DB: SELECT etiqueta existente (verificar duplicado)
    DB-->>B: Resultado de verificación
    alt Etiqueta ya existe para el usuario
        B-->>F: 409 Conflict
        F-->>U: Muestra error de duplicado
    else Etiqueta nueva
        B->>DB: INSERT nueva etiqueta
        DB-->>B: Etiqueta creada
        B-->>F: 201 Created + etiqueta
        F->>F: Actualiza lista de etiquetas
        F-->>U: Etiqueta disponible para usar
    end

    Note over U,DB: Asignar Categoría a Tarea
    U->>F: Edita tarea existente
    F->>B: GET /api/categorias (cargar disponibles)
    B->>DB: SELECT categorías del usuario
    DB-->>B: Lista de categorías
    B-->>F: 200 OK + categorías
    F-->>U: Muestra selector de categoría
    U->>F: Selecciona categoría
    F->>B: PUT /api/tareas/:id (incluye categoria_id)
    B->>B: Valida JWT y datos
    B->>DB: UPDATE tarea SET categoria_id
    DB-->>B: Tarea actualizada
    B->>DB: SELECT tarea completa con categoría
    DB-->>B: Tarea con categoría
    B-->>F: 200 OK + tarea actualizada
    F->>F: Actualiza estado local
    F-->>U: Muestra categoría en tarea

    Note over U,DB: Asignar Etiquetas a Tarea
    U->>F: Edita tarea existente
    F->>B: GET /api/etiquetas (cargar disponibles)
    B->>DB: SELECT etiquetas del usuario
    DB-->>B: Lista de etiquetas
    B-->>F: 200 OK + etiquetas
    F-->>U: Muestra selector de etiquetas múltiples
    U->>F: Selecciona etiquetas múltiples
    F->>B: PUT /api/tareas/:id (incluye array de etiquetas)
    B->>B: Valida JWT y datos
    B->>DB: BEGIN TRANSACTION
    B->>DB: UPDATE tarea (otros campos)
    B->>DB: DELETE FROM tarea_etiquetas WHERE tarea_id
    B->>DB: INSERT INTO tarea_etiquetas (múltiples registros)
    B->>DB: COMMIT TRANSACTION
    DB-->>B: Transacción exitosa
    B->>DB: SELECT tarea completa con etiquetas
    DB-->>B: Tarea con etiquetas
    B-->>F: 200 OK + tarea actualizada
    F->>F: Actualiza estado local
    F-->>U: Muestra etiquetas en tarea
```

## 4. Búsqueda y Filtrado Avanzado

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend (React)
    participant B as Backend (Express)
    participant DB as PostgreSQL
    participant C as Cache Service

    Note over U,C: Búsqueda en Tiempo Real
    U->>F: Escribe en campo de búsqueda
    F->>F: Debounce (300ms)
    F->>F: Construye query compleja
    Note right of F: Filtros: texto, categoría,<br/>prioridad, estado, fechas
    F->>B: GET /api/tareas?search=texto&categoria=1&prioridad=alta
    B->>B: Valida JWT
    B->>B: Construye clave de cache con parámetros
    Note right of B: cacheKey = tareas:userId:search:params
    B->>C: Verifica cache de búsqueda
    alt Cache hit (búsqueda reciente)
        C-->>B: Resultados cacheados
        B-->>F: 200 OK + tareas filtradas (from cache)
    else Cache miss
        B->>B: Construye query SQL dinámico
        Note right of B: WHERE titulo ILIKE %texto%<br/>AND categoria_id = 1<br/>AND prioridad = 'alta'
        B->>DB: Ejecuta query optimizado
        DB-->>B: Resultados de búsqueda
        B->>C: Cachea resultados (2 min para búsquedas)
        B-->>F: 200 OK + tareas filtradas
    end
    F->>F: Actualiza lista con animaciones
    F-->>U: Muestra resultados instantáneos

    Note over U,C: Carga de Dashboard con Estadísticas
    U->>F: Navega a dashboard
    F->>B: GET /api/tareas/estadisticas
    B->>B: Valida JWT
    B->>C: Verifica cache de estadísticas
    alt Cache hit
        C-->>B: Datos cacheados
        B-->>F: 200 OK + estadísticas
    else Cache miss
        B->>DB: Query complejo de estadísticas
        Note right of DB: COUNT tareas completadas,<br/>pendientes, por categoría,<br/>por prioridad, etc.
        DB-->>B: Resultados de estadísticas
        B->>C: Cachea por 15 minutos
        B-->>F: 200 OK + estadísticas
    end
    F->>F: Renderiza gráficos y métricas
    F-->>U: Dashboard interactivo
```

## 5. Manejo de Errores y Estados de Carga

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend (React)
    participant B as Backend (Express)
    participant DB as PostgreSQL

    Note over U,DB: Flujo con Error de Red
    U->>F: Intenta crear tarea
    F->>F: Muestra loading spinner
    F->>B: POST /api/tareas
    Note over F,B: Network Error
    B--xF: Conexión fallida
    F->>F: Detecta error de red
    F->>F: Muestra mensaje de error
    F->>F: Habilita botón "Reintentar"
    F-->>U: "Error de conexión. Reintentar?"
    U->>F: Click en reintentar
    F->>B: POST /api/tareas (reintento)
    B->>DB: INSERT tarea
    DB-->>B: Tarea creada
    B-->>F: 201 Created
    F->>F: Oculta error, muestra éxito
    F-->>U: Tarea creada exitosamente

    Note over U,DB: Flujo con Error de Validación
    U->>F: Envía formulario incompleto
    F->>F: Validación local pasa
    F->>B: POST /api/tareas
    B->>B: Validación con Joi falla
    B-->>F: 400 Bad Request + errores detallados
    F->>F: Procesa errores del servidor
    F->>F: Muestra errores en campos específicos
    F-->>U: Errores de validación en formulario
    U->>F: Corrige errores
    F->>F: Validación local en tiempo real
    F-->>U: Feedback inmediato de corrección

    Note over U,DB: Token Expirado
    U->>F: Acción cualquiera
    F->>B: Request con JWT expirado
    B->>B: Middleware detecta token expirado
    B-->>F: 401 Unauthorized
    F->>F: Detecta 401
    F->>F: Limpia localStorage
    F->>F: Actualiza contexto auth
    F->>F: Redirige a login
    F-->>U: Página de login con mensaje
```

## Notas de Implementación

### 🔄 **Patrones de Estado**

- **Optimistic Updates**: Para mejor UX en operaciones frecuentes
- **Loading States**: Spinners y skeleton screens
- **Error Boundaries**: Manejo robusto de errores en React

### 🚀 **Optimizaciones**

- **Debouncing**: Para búsquedas en tiempo real
- **Caching Strategy**:
  - **Búsquedas**: Cache corto (2 min) por alta variabilidad de filtros
  - **Estadísticas**: Cache largo (15 min) por datos más estables
  - **Categorías/Etiquetas**: Cache medio (5 min) por cambios moderados
- **Pagination**: Para listas grandes de tareas

### 🔒 **Seguridad**

- **JWT Validation**: En cada request protegido
- **Ownership Verification**: Usuario solo ve sus datos
- **Rate Limiting**: Previene abuso de API
- **Transaction Safety**: Operaciones complejas en transacciones

### 📱 **UX Considerations**

- **Feedback Inmediato**: Confirmaciones y errores claros
- **Estados Intermedios**: Loading y transiciones suaves
- **Recuperación de Errores**: Opciones de reintento y fallback
- **Confirmaciones**: Para operaciones destructivas (eliminar)

### 💾 **Cache Strategy Justification**

**¿Por qué verificar cache antes de ejecutar búsquedas?**

- **Performance**: Evita consultas costosas repetidas
- **User Experience**: Respuesta instantánea para búsquedas recurrentes
- **Server Load**: Reduce carga en base de datos
- **TTL Diferenciado**:
  - Búsquedas: 2 min (filtros cambian frecuentemente)
  - Estadísticas: 15 min (datos agregados más estables)
  - Listas básicas: 5 min (balance entre frescura y performance)
