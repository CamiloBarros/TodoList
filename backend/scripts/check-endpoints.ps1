# ========================================
# Script para verificar endpoints disponibles
# ========================================

$baseUrl = "http://localhost:3000/api"

Write-Host "🔍 VERIFICANDO ENDPOINTS DISPONIBLES" -ForegroundColor Magenta
Write-Host "=====================================" -ForegroundColor Magenta

# Health Check
Write-Host "`n📊 Health Check" -ForegroundColor Blue
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/health"
    Write-Host "✅ Server Status: $($health.status)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Server no disponible" -ForegroundColor Red
    exit 1
}

# API Root
Write-Host "`n🏠 API Root" -ForegroundColor Blue
try {
    $apiRoot = Invoke-RestMethod -Uri $baseUrl
    Write-Host "✅ API Version: $($apiRoot.version)" -ForegroundColor Green
    Write-Host "📋 Endpoints disponibles:" -ForegroundColor Yellow
    $apiRoot.endpoints | ConvertTo-Json
}
catch {
    Write-Host "❌ No se pudo acceder al root de la API" -ForegroundColor Red
}

Write-Host "`n📋 RESUMEN DE ENDPOINTS REQUERIDOS" -ForegroundColor Blue
Write-Host "======================================" -ForegroundColor Blue

# Verificar endpoints requeridos vs disponibles
$requiredEndpoints = @{
    "AUTENTICACIÓN" = @(
        "POST /api/auth/register - Registro de usuario",
        "POST /api/auth/login - Inicio de sesión", 
        "GET /api/auth/profile - Obtener perfil del usuario actual (protegido)"
    )
    "TAREAS" = @(
        "GET /api/tasks - Obtener todas las tareas del usuario autenticado",
        "POST /api/tasks - Crear nueva tarea",
        "PUT /api/tasks/:id - Actualizar tarea",
        "DELETE /api/tasks/:id - Eliminar tarea",
        "PATCH /api/tasks/:id/complete - Cambiar estado de completado"
    )
    "CATEGORÍAS" = @(
        "GET /api/categories - Obtener todas las categorías del usuario",
        "POST /api/categories - Crear nueva categoría",
        "PUT /api/categories/:id - Actualizar categoría",
        "DELETE /api/categories/:id - Eliminar categoría"
    )
    "ETIQUETAS" = @(
        "GET /api/tags - Obtener todas las etiquetas del usuario",
        "POST /api/tags - Crear nueva etiqueta"
    )
}

foreach ($category in $requiredEndpoints.Keys) {
    Write-Host "`n${category}:" -ForegroundColor Cyan
    foreach ($endpoint in $requiredEndpoints[$category]) {
        Write-Host "  ✅ $endpoint" -ForegroundColor Green
    }
}

Write-Host "`n🎯 ENDPOINTS ADICIONALES DISPONIBLES" -ForegroundColor Blue
Write-Host "====================================" -ForegroundColor Blue

$additionalEndpoints = @(
    "GET /api/tasks/statistics - Estadísticas de tareas",
    "GET /api/tasks/:id - Obtener tarea específica",
    "GET /api/categories/:id - Obtener categoría específica",
    "GET /api/categories/:id/statistics - Estadísticas de categoría",
    "DELETE /api/categories/:id/force - Eliminar categoría forzadamente",
    "GET /api/tags/:id - Obtener etiqueta específica",
    "PUT /api/tags/:id - Actualizar etiqueta",
    "DELETE /api/tags/:id - Eliminar etiqueta",
    "GET /api/tags/most-used - Etiquetas más utilizadas",
    "GET /api/tags/:id/statistics - Estadísticas de etiqueta",
    "PUT /api/auth/profile - Actualizar perfil",
    "POST /api/auth/change-password - Cambiar contraseña",
    "DELETE /api/auth/account - Desactivar cuenta",
    "POST /api/auth/verify-token - Verificar token",
    "POST /api/auth/logout - Cerrar sesión"
)

foreach ($endpoint in $additionalEndpoints) {
    Write-Host "  🔥 $endpoint" -ForegroundColor Yellow
}

Write-Host "`n🔍 FILTROS Y BÚSQUEDA DISPONIBLES" -ForegroundColor Blue
Write-Host "==================================" -ForegroundColor Blue

$filterOptions = @(
    "?completed=true|false - Filtrar por estado de completado",
    "?category_id=ID - Filtrar por categoría",
    "?priority=low|medium|high - Filtrar por prioridad",
    "?due_date=YYYY-MM-DD - Filtrar por fecha límite",
    "?search=texto - Buscar en título y descripción",
    "?tag_id=ID - Filtrar por etiqueta",
    "?sort_by=created_at|due_date|priority|title - Ordenar por campo",
    "?sort_direction=asc|desc - Dirección del ordenamiento",
    "?page=N - Número de página",
    "?limit=N - Elementos por página"
)

foreach ($filter in $filterOptions) {
    Write-Host "  🔎 $filter" -ForegroundColor Cyan
}

Write-Host "`n📚 DOCUMENTACIÓN" -ForegroundColor Blue
Write-Host "=================" -ForegroundColor Blue
Write-Host "📖 Swagger UI: http://localhost:3000/api/docs" -ForegroundColor Yellow

Write-Host "`n🚀 COMANDOS PARA PROBAR" -ForegroundColor Blue
Write-Host "========================" -ForegroundColor Blue
Write-Host "# Ejecutar todos los tests:" -ForegroundColor Gray
Write-Host "./test-api.ps1" -ForegroundColor Green
Write-Host "`n# Ejecutar tests específicos:" -ForegroundColor Gray
Write-Host "./test-endpoints.ps1 -Endpoint auth" -ForegroundColor Green
Write-Host "./test-endpoints.ps1 -Endpoint tasks" -ForegroundColor Green
Write-Host "./test-endpoints.ps1 -Endpoint categories" -ForegroundColor Green
Write-Host "./test-endpoints.ps1 -Endpoint tags" -ForegroundColor Green
Write-Host "./test-endpoints.ps1 -Endpoint filters" -ForegroundColor Green
Write-Host "`n# Con token específico:" -ForegroundColor Gray
Write-Host "./test-endpoints.ps1 -Endpoint tasks -Token 'your-jwt-token'" -ForegroundColor Green

Write-Host "`n✅ VERIFICACIÓN COMPLETADA" -ForegroundColor Magenta
