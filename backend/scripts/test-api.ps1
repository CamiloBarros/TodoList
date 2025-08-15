# ========================================
# Script de PowerShell para probar la API TodoList
# ========================================

# Configuración base
$baseUrl = "http://localhost:3000/api"
$token = ""
$userId = ""

# Headers base
$headers = @{
    "Content-Type" = "application/json"
    "Accept" = "application/json"
}

# Función para hacer requests con manejo de errores
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Uri,
        [hashtable]$Headers = @{},
        [string]$Body = "",
        [string]$Description = ""
    )
    
    Write-Host "`n🔍 Testing: $Description" -ForegroundColor Cyan
    Write-Host "📡 $Method $Uri" -ForegroundColor Gray
    
    if ($Body) {
        Write-Host "📝 Body: $Body" -ForegroundColor Gray
    }
    
    try {
        $response = Invoke-RestMethod -Uri $Uri -Method $Method -Headers $Headers -Body $Body -ErrorAction Stop
        Write-Host "✅ Success:" -ForegroundColor Green
        $response | ConvertTo-Json -Depth 5 | Write-Host
        return $response
    }
    catch {
        Write-Host "❌ Error:" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode
            Write-Host "Status Code: $statusCode" -ForegroundColor Red
        }
        return $null
    }
}

# Función para añadir token a headers
function Add-AuthHeader {
    param([string]$Token)
    
    if ($Token) {
        $script:headers["Authorization"] = "Bearer $Token"
        Write-Host "🔐 Authorization header added" -ForegroundColor Yellow
    }
}

Write-Host "🚀 Iniciando pruebas de la API TodoList" -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta

# 1. HEALTH CHECK
Write-Host "`n📊 1. HEALTH CHECK" -ForegroundColor Blue
$healthResponse = Invoke-ApiRequest -Method "GET" -Uri "http://localhost:3000/health" -Description "Health Check"

# 2. AUTENTICACIÓN
Write-Host "`n🔐 2. AUTHENTICATION TESTS" -ForegroundColor Blue

# 2.1 Registro de usuario
$registerBody = @{
    name = "Test User $(Get-Random)"
    email = "test$(Get-Random)@example.com"
    password = "TestPassword123"
} | ConvertTo-Json

$registerResponse = Invoke-ApiRequest -Method "POST" -Uri "$baseUrl/auth/register" -Headers $headers -Body $registerBody -Description "Register User"

if ($registerResponse) {
    $script:token = $registerResponse.data.token
    $script:userId = $registerResponse.data.user.id
    Add-AuthHeader -Token $script:token
    Write-Host "🎯 User registered successfully. Token and userId saved." -ForegroundColor Green
}

# 2.2 Login (opcional - usando el mismo usuario registrado)
$loginBody = @{
    email = ($registerBody | ConvertFrom-Json).email
    password = ($registerBody | ConvertFrom-Json).password
} | ConvertTo-Json

$loginResponse = Invoke-ApiRequest -Method "POST" -Uri "$baseUrl/auth/login" -Headers $headers -Body $loginBody -Description "Login User"

# 2.3 Obtener perfil
if ($script:token) {
    $profileResponse = Invoke-ApiRequest -Method "GET" -Uri "$baseUrl/auth/profile" -Headers $script:headers -Description "Get User Profile"
}

# 3. CATEGORÍAS
Write-Host "`n📁 3. CATEGORIES TESTS" -ForegroundColor Blue

# 3.1 Crear categoría
$categoryBody = @{
    name = "Trabajo"
    description = "Tareas relacionadas con el trabajo"
    color = "#3B82F6"
} | ConvertTo-Json

$categoryResponse = Invoke-ApiRequest -Method "POST" -Uri "$baseUrl/categories" -Headers $script:headers -Body $categoryBody -Description "Create Category"

$categoryId = ""
if ($categoryResponse) {
    $categoryId = $categoryResponse.data.id
}

# 3.2 Obtener todas las categorías
$categoriesResponse = Invoke-ApiRequest -Method "GET" -Uri "$baseUrl/categories" -Headers $script:headers -Description "Get All Categories"

# 3.3 Actualizar categoría
if ($categoryId) {
    $updateCategoryBody = @{
        name = "Trabajo Actualizado"
        description = "Descripción actualizada"
        color = "#EF4444"
    } | ConvertTo-Json
    
    $updateCategoryResponse = Invoke-ApiRequest -Method "PUT" -Uri "$baseUrl/categories/$categoryId" -Headers $script:headers -Body $updateCategoryBody -Description "Update Category"
}

# 4. ETIQUETAS
Write-Host "`n🏷️ 4. TAGS TESTS" -ForegroundColor Blue

# 4.1 Crear etiqueta
$tagBody = @{
    name = "urgente"
    color = "#EF4444"
} | ConvertTo-Json

$tagResponse = Invoke-ApiRequest -Method "POST" -Uri "$baseUrl/tags" -Headers $script:headers -Body $tagBody -Description "Create Tag"

$tagId = ""
if ($tagResponse) {
    $tagId = $tagResponse.data.id
}

# 4.2 Obtener todas las etiquetas
$tagsResponse = Invoke-ApiRequest -Method "GET" -Uri "$baseUrl/tags" -Headers $script:headers -Description "Get All Tags"

# 5. TAREAS
Write-Host "`n📝 5. TASKS TESTS" -ForegroundColor Blue

# 5.1 Crear tarea
$taskBody = @{
    title = "Tarea de prueba"
    description = "Esta es una tarea de prueba creada por el script"
    priority = "high"
    due_date = "2025-08-20"
}

if ($categoryId) {
    $taskBody.category_id = [int]$categoryId
}

if ($tagId) {
    $taskBody.tags = @([int]$tagId)
}

$taskBodyJson = $taskBody | ConvertTo-Json

$taskResponse = Invoke-ApiRequest -Method "POST" -Uri "$baseUrl/tasks" -Headers $script:headers -Body $taskBodyJson -Description "Create Task"

$taskId = ""
if ($taskResponse) {
    $taskId = $taskResponse.data.id
}

# 5.2 Obtener todas las tareas
$tasksResponse = Invoke-ApiRequest -Method "GET" -Uri "$baseUrl/tasks" -Headers $script:headers -Description "Get All Tasks"

# 5.3 Obtener tareas con filtros
$tasksFilteredResponse = Invoke-ApiRequest -Method "GET" -Uri "$baseUrl/tasks?completed=false&priority=high" -Headers $script:headers -Description "Get Filtered Tasks (pending + high priority)"

# 5.4 Actualizar tarea
if ($taskId) {
    $updateTaskBody = @{
        title = "Tarea actualizada"
        description = "Descripción actualizada por el script"
        priority = "medium"
        completed = $false
    } | ConvertTo-Json
    
    $updateTaskResponse = Invoke-ApiRequest -Method "PUT" -Uri "$baseUrl/tasks/$taskId" -Headers $script:headers -Body $updateTaskBody -Description "Update Task"
}

# 5.5 Marcar tarea como completada
if ($taskId) {
    $completeTaskBody = @{
        completed = $true
    } | ConvertTo-Json
    
    $completeTaskResponse = Invoke-ApiRequest -Method "PATCH" -Uri "$baseUrl/tasks/$taskId/complete" -Headers $script:headers -Body $completeTaskBody -Description "Toggle Task Completion"
}

# 5.6 Obtener estadísticas de tareas
$statsResponse = Invoke-ApiRequest -Method "GET" -Uri "$baseUrl/tasks/statistics" -Headers $script:headers -Description "Get Task Statistics"

# 6. PRUEBAS DE BÚSQUEDA Y FILTROS
Write-Host "`n🔍 6. SEARCH AND FILTER TESTS" -ForegroundColor Blue

# 6.1 Búsqueda por texto
$searchResponse = Invoke-ApiRequest -Method "GET" -Uri "$baseUrl/tasks?search=prueba" -Headers $script:headers -Description "Search Tasks by Text"

# 6.2 Filtro por etiqueta
if ($tagId) {
    $tagFilterResponse = Invoke-ApiRequest -Method "GET" -Uri "$baseUrl/tasks?tag_id=$tagId" -Headers $script:headers -Description "Filter Tasks by Tag"
}

# 6.3 Filtro por categoría
if ($categoryId) {
    $categoryFilterResponse = Invoke-ApiRequest -Method "GET" -Uri "$baseUrl/tasks?category_id=$categoryId" -Headers $script:headers -Description "Filter Tasks by Category"
}

# 7. PRUEBAS DE ELIMINACIÓN (opcional - comentado para preservar datos)
Write-Host "`n🗑️ 7. DELETION TESTS (COMMENTED - UNCOMMENT TO TEST)" -ForegroundColor Blue
Write-Host "# Uncomment the lines below to test deletion endpoints:" -ForegroundColor Gray
Write-Host "# Delete Task: DELETE $baseUrl/tasks/$taskId" -ForegroundColor Gray
Write-Host "# Delete Category: DELETE $baseUrl/categories/$categoryId" -ForegroundColor Gray
Write-Host "# Delete Tag: DELETE $baseUrl/tags/$tagId" -ForegroundColor Gray

<#
# Uncomment to test deletion
if ($taskId) {
    $deleteTaskResponse = Invoke-ApiRequest -Method "DELETE" -Uri "$baseUrl/tasks/$taskId" -Headers $script:headers -Description "Delete Task"
}

if ($categoryId) {
    $deleteCategoryResponse = Invoke-ApiRequest -Method "DELETE" -Uri "$baseUrl/categories/$categoryId" -Headers $script:headers -Description "Delete Category"
}

if ($tagId) {
    $deleteTagResponse = Invoke-ApiRequest -Method "DELETE" -Uri "$baseUrl/tags/$tagId" -Headers $script:headers -Description "Delete Tag"
}
#>

# RESUMEN
Write-Host "`n📊 SUMMARY" -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta
Write-Host "✅ Health Check: $(if($healthResponse) { 'PASSED' } else { 'FAILED' })" -ForegroundColor $(if($healthResponse) { 'Green' } else { 'Red' })
Write-Host "✅ User Registration: $(if($registerResponse) { 'PASSED' } else { 'FAILED' })" -ForegroundColor $(if($registerResponse) { 'Green' } else { 'Red' })
Write-Host "✅ User Login: $(if($loginResponse) { 'PASSED' } else { 'FAILED' })" -ForegroundColor $(if($loginResponse) { 'Green' } else { 'Red' })
Write-Host "✅ User Profile: $(if($profileResponse) { 'PASSED' } else { 'FAILED' })" -ForegroundColor $(if($profileResponse) { 'Green' } else { 'Red' })
Write-Host "✅ Category Creation: $(if($categoryResponse) { 'PASSED' } else { 'FAILED' })" -ForegroundColor $(if($categoryResponse) { 'Green' } else { 'Red' })
Write-Host "✅ Category Listing: $(if($categoriesResponse) { 'PASSED' } else { 'FAILED' })" -ForegroundColor $(if($categoriesResponse) { 'Green' } else { 'Red' })
Write-Host "✅ Tag Creation: $(if($tagResponse) { 'PASSED' } else { 'FAILED' })" -ForegroundColor $(if($tagResponse) { 'Green' } else { 'Red' })
Write-Host "✅ Tag Listing: $(if($tagsResponse) { 'PASSED' } else { 'FAILED' })" -ForegroundColor $(if($tagsResponse) { 'Green' } else { 'Red' })
Write-Host "✅ Task Creation: $(if($taskResponse) { 'PASSED' } else { 'FAILED' })" -ForegroundColor $(if($taskResponse) { 'Green' } else { 'Red' })
Write-Host "✅ Task Listing: $(if($tasksResponse) { 'PASSED' } else { 'FAILED' })" -ForegroundColor $(if($tasksResponse) { 'Green' } else { 'Red' })
Write-Host "✅ Task Statistics: $(if($statsResponse) { 'PASSED' } else { 'FAILED' })" -ForegroundColor $(if($statsResponse) { 'Green' } else { 'Red' })

if ($script:token) {
    Write-Host "`n🔑 Generated Token: $($script:token.Substring(0, 50))..." -ForegroundColor Yellow
    Write-Host "👤 User ID: $script:userId" -ForegroundColor Yellow
}

Write-Host "`n✨ API Testing completed!" -ForegroundColor Magenta
