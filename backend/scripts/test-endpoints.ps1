# ========================================
# Script de PowerShell para pruebas específicas de endpoints
# ========================================

param(
    [string]$Endpoint = "all",
    [string]$Token = "",
    [string]$BaseUrl = "http://localhost:3000/api"
)

# Variables globales
$script:headers = @{
    "Content-Type" = "application/json"
    "Accept" = "application/json"
}

if ($Token) {
    $script:headers["Authorization"] = "Bearer $Token"
}

# Función helper para requests
function Invoke-TestRequest {
    param(
        [string]$Method,
        [string]$Uri,
        [string]$Body = "",
        [string]$Description = ""
    )
    
    Write-Host "`n🔍 $Description" -ForegroundColor Cyan
    Write-Host "📡 $Method $Uri" -ForegroundColor Gray
    
    try {
        if ($Body) {
            $response = Invoke-RestMethod -Uri $Uri -Method $Method -Headers $script:headers -Body $Body
        } else {
            $response = Invoke-RestMethod -Uri $Uri -Method $Method -Headers $script:headers
        }
        
        Write-Host "✅ SUCCESS" -ForegroundColor Green
        $response | ConvertTo-Json -Depth 3
        return $response
    }
    catch {
        Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Función para probar autenticación
function Test-AuthEndpoints {
    Write-Host "`n🔐 TESTING AUTHENTICATION ENDPOINTS" -ForegroundColor Blue
    Write-Host "=================================================" -ForegroundColor Blue
    
    # Register
    $registerData = @{
        name = "API Test User"
        email = "apitest$(Get-Random)@example.com"
        password = "TestPassword123"
    } | ConvertTo-Json
    
    $registerResponse = Invoke-TestRequest -Method "POST" -Uri "$BaseUrl/auth/register" -Body $registerData -Description "POST /api/auth/register - Register User"
    
    if ($registerResponse) {
        $script:token = $registerResponse.data.token
        $script:headers["Authorization"] = "Bearer $($script:token)"
        
        # Login
        $loginData = @{
            email = ($registerData | ConvertFrom-Json).email
            password = ($registerData | ConvertFrom-Json).password
        } | ConvertTo-Json
        
        Invoke-TestRequest -Method "POST" -Uri "$BaseUrl/auth/login" -Body $loginData -Description "POST /api/auth/login - Login User"
        
        # Profile
        Invoke-TestRequest -Method "GET" -Uri "$BaseUrl/auth/profile" -Description "GET /api/auth/profile - Get User Profile"
    }
}

# Función para probar tareas
function Test-TaskEndpoints {
    Write-Host "`n📝 TESTING TASK ENDPOINTS" -ForegroundColor Blue
    Write-Host "===================================" -ForegroundColor Blue
    
    # Get all tasks
    $tasksResponse = Invoke-TestRequest -Method "GET" -Uri "$BaseUrl/tasks" -Description "GET /api/tasks - Get All Tasks"
    
    # Create task
    $taskData = @{
        title = "Test Task $(Get-Random)"
        description = "This is a test task created via API"
        priority = "high"
        due_date = "2025-08-20"
    } | ConvertTo-Json
    
    $createTaskResponse = Invoke-TestRequest -Method "POST" -Uri "$BaseUrl/tasks" -Body $taskData -Description "POST /api/tasks - Create Task"
    
    if ($createTaskResponse) {
        $taskId = $createTaskResponse.data.id
        
        # Get specific task
        Invoke-TestRequest -Method "GET" -Uri "$BaseUrl/tasks/$taskId" -Description "GET /api/tasks/:id - Get Specific Task"
        
        # Update task
        $updateData = @{
            title = "Updated Test Task"
            description = "Updated description"
            priority = "medium"
        } | ConvertTo-Json
        
        Invoke-TestRequest -Method "PUT" -Uri "$BaseUrl/tasks/$taskId" -Body $updateData -Description "PUT /api/tasks/:id - Update Task"
        
        # Toggle completion
        $completeData = @{
            completed = $true
        } | ConvertTo-Json
        
        Invoke-TestRequest -Method "PATCH" -Uri "$BaseUrl/tasks/$taskId/complete" -Body $completeData -Description "PATCH /api/tasks/:id/complete - Toggle Task Completion"
        
        # Get statistics
        Invoke-TestRequest -Method "GET" -Uri "$BaseUrl/tasks/statistics" -Description "GET /api/tasks/statistics - Get Task Statistics"
    }
}

# Función para probar categorías
function Test-CategoryEndpoints {
    Write-Host "`n📁 TESTING CATEGORY ENDPOINTS" -ForegroundColor Blue
    Write-Host "=======================================" -ForegroundColor Blue
    
    # Get all categories
    Invoke-TestRequest -Method "GET" -Uri "$BaseUrl/categories" -Description "GET /api/categories - Get All Categories"
    
    # Create category
    $categoryData = @{
        name = "Test Category $(Get-Random)"
        description = "Test category created via API"
        color = "#3B82F6"
    } | ConvertTo-Json
    
    $createCategoryResponse = Invoke-TestRequest -Method "POST" -Uri "$BaseUrl/categories" -Body $categoryData -Description "POST /api/categories - Create Category"
    
    if ($createCategoryResponse) {
        $categoryId = $createCategoryResponse.data.id
        
        # Get specific category
        Invoke-TestRequest -Method "GET" -Uri "$BaseUrl/categories/$categoryId" -Description "GET /api/categories/:id - Get Specific Category"
        
        # Update category
        $updateData = @{
            name = "Updated Test Category"
            description = "Updated description"
            color = "#EF4444"
        } | ConvertTo-Json
        
        Invoke-TestRequest -Method "PUT" -Uri "$BaseUrl/categories/$categoryId" -Body $updateData -Description "PUT /api/categories/:id - Update Category"
        
        # Get category statistics
        Invoke-TestRequest -Method "GET" -Uri "$BaseUrl/categories/$categoryId/statistics" -Description "GET /api/categories/:id/statistics - Get Category Statistics"
    }
}

# Función para probar etiquetas
function Test-TagEndpoints {
    Write-Host "`n🏷️ TESTING TAG ENDPOINTS" -ForegroundColor Blue
    Write-Host "===============================" -ForegroundColor Blue
    
    # Get all tags
    Invoke-TestRequest -Method "GET" -Uri "$BaseUrl/tags" -Description "GET /api/tags - Get All Tags"
    
    # Create tag
    $tagData = @{
        name = "test-tag-$(Get-Random)"
        color = "#10B981"
    } | ConvertTo-Json
    
    $createTagResponse = Invoke-TestRequest -Method "POST" -Uri "$BaseUrl/tags" -Body $tagData -Description "POST /api/tags - Create Tag"
    
    if ($createTagResponse) {
        $tagId = $createTagResponse.data.id
        
        # Get specific tag
        Invoke-TestRequest -Method "GET" -Uri "$BaseUrl/tags/$tagId" -Description "GET /api/tags/:id - Get Specific Tag"
        
        # Update tag
        $updateData = @{
            name = "updated-test-tag"
            color = "#F59E0B"
        } | ConvertTo-Json
        
        Invoke-TestRequest -Method "PUT" -Uri "$BaseUrl/tags/$tagId" -Body $updateData -Description "PUT /api/tags/:id - Update Tag"
        
        # Get most used tags
        Invoke-TestRequest -Method "GET" -Uri "$BaseUrl/tags/most-used" -Description "GET /api/tags/most-used - Get Most Used Tags"
        
        # Get tag statistics
        Invoke-TestRequest -Method "GET" -Uri "$BaseUrl/tags/$tagId/statistics" -Description "GET /api/tags/:id/statistics - Get Tag Statistics"
    }
}

# Función para probar filtros
function Test-FilterEndpoints {
    Write-Host "`n🔍 TESTING FILTER ENDPOINTS" -ForegroundColor Blue
    Write-Host "====================================" -ForegroundColor Blue
    
    # Test various filters
    Invoke-TestRequest -Method "GET" -Uri "$BaseUrl/tasks?completed=false" -Description "GET /api/tasks?completed=false - Filter by Completion Status"
    Invoke-TestRequest -Method "GET" -Uri "$BaseUrl/tasks?priority=high" -Description "GET /api/tasks?priority=high - Filter by Priority"
    Invoke-TestRequest -Method "GET" -Uri "$BaseUrl/tasks?search=test" -Description "GET /api/tasks?search=test - Search Tasks"
    Invoke-TestRequest -Method "GET" -Uri "$BaseUrl/tasks?sort_by=created_at&sort_direction=desc" -Description "GET /api/tasks?sort_by=created_at&sort_direction=desc - Sort Tasks"
    Invoke-TestRequest -Method "GET" -Uri "$BaseUrl/tasks?page=1&limit=5" -Description "GET /api/tasks?page=1&limit=5 - Pagination"
}

# Función principal
function Start-EndpointTests {
    Write-Host "🚀 STARTING API ENDPOINT TESTS" -ForegroundColor Magenta
    Write-Host "Base URL: $BaseUrl" -ForegroundColor Yellow
    Write-Host "Testing: $Endpoint" -ForegroundColor Yellow
    Write-Host "============================================" -ForegroundColor Magenta
    
    # Health check first
    Write-Host "`n📊 HEALTH CHECK" -ForegroundColor Blue
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:3000/health"
        Write-Host "✅ Server is healthy" -ForegroundColor Green
        $health | ConvertTo-Json
    }
    catch {
        Write-Host "❌ Server health check failed" -ForegroundColor Red
        return
    }
    
    switch ($Endpoint.ToLower()) {
        "auth" { Test-AuthEndpoints }
        "tasks" { 
            if (-not $Token) {
                Write-Host "⚠️ No token provided. Running auth first..." -ForegroundColor Yellow
                Test-AuthEndpoints
            }
            Test-TaskEndpoints 
        }
        "categories" { 
            if (-not $Token) {
                Write-Host "⚠️ No token provided. Running auth first..." -ForegroundColor Yellow
                Test-AuthEndpoints
            }
            Test-CategoryEndpoints 
        }
        "tags" { 
            if (-not $Token) {
                Write-Host "⚠️ No token provided. Running auth first..." -ForegroundColor Yellow
                Test-AuthEndpoints
            }
            Test-TagEndpoints 
        }
        "filters" { 
            if (-not $Token) {
                Write-Host "⚠️ No token provided. Running auth first..." -ForegroundColor Yellow
                Test-AuthEndpoints
            }
            Test-FilterEndpoints 
        }
        "all" { 
            Test-AuthEndpoints
            Test-TaskEndpoints
            Test-CategoryEndpoints
            Test-TagEndpoints
            Test-FilterEndpoints
        }
        default { 
            Write-Host "❌ Unknown endpoint: $Endpoint" -ForegroundColor Red
            Write-Host "Available options: auth, tasks, categories, tags, filters, all" -ForegroundColor Yellow
        }
    }
    
    Write-Host "`n✨ Testing completed!" -ForegroundColor Magenta
}

# Ejecutar tests
Start-EndpointTests
