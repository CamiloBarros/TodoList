# Script para traducir variables principales (conservador)

# Mapeos de variables importantes (solo variables internas, no DB)
$variableMappings = @{
    'FiltrosTareas' = 'TaskFilters'
    'TareaCreacion' = 'TaskCreation'
    'TareaActualizacion' = 'TaskUpdate'
    'CategoriaCreacion' = 'CategoryCreation'
    'EtiquetaCreacion' = 'TagCreation'
    'UsuarioCreacion' = 'UserCreation'
    'UsuarioLogin' = 'UserLogin'
    'UsuarioPublico' = 'PublicUser'
    'resultado' = 'result'
    'filtros' = 'filters'
    'tareaId' = 'taskId'
    'categoriaId' = 'categoryId'
    'etiquetaId' = 'tagId'
    'usuarioId' = 'userId'
}

# Solo archivos de lógica, no DB
$baseDir = "C:\Users\USUARIO\DevProjects\TodoList\backend\src"
$files = @(
    "$baseDir\types\index.ts",
    "$baseDir\controllers\tasksController.ts",
    "$baseDir\controllers\categoriesController.ts",
    "$baseDir\controllers\tagsController.ts",
    "$baseDir\controllers\authController.ts",
    "$baseDir\services\tasksService.ts",
    "$baseDir\services\categoriesService.ts",
    "$baseDir\services\tagsService.ts",
    "$baseDir\services\authService.ts"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Procesando: $file"
        $content = Get-Content $file -Raw
        
        foreach ($mapping in $variableMappings.GetEnumerator()) {
            $spanishName = $mapping.Key
            $englishName = $mapping.Value
            
            # Solo reemplazar en contextos específicos para evitar romper DB
            $content = $content -replace "interface $spanishName", "interface $englishName"
            $content = $content -replace "export interface $spanishName", "export interface $englishName"
            $content = $content -replace ": $spanishName", ": $englishName"
            $content = $content -replace "<$spanishName>", "<$englishName>"
            $content = $content -replace "const $spanishName", "const $englishName"
            $content = $content -replace "let $spanishName", "let $englishName"
        }
        
        Set-Content $file $content -Encoding UTF8
        Write-Host "✓ Completado: $file"
    }
}

Write-Host "`n✅ Traducción de variables importantes completada"
