-- Migration 002: Create categorias table
-- Description: Categories for organizing tasks
-- Date: 2025-08-13

BEGIN;

-- Create categorias table
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key Constraints
    CONSTRAINT fk_categorias_usuario 
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    
    -- Business Logic Constraints
    CONSTRAINT categorias_nombre_length 
        CHECK (char_length(nombre) >= 1 AND char_length(nombre) <= 100),
    CONSTRAINT categorias_color_format 
        CHECK (color ~* '^#[0-9A-Fa-f]{6}$'),
    
    -- Unique constraint per user
    CONSTRAINT uk_categorias_usuario_nombre 
        UNIQUE (usuario_id, nombre)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_categorias_usuario_id ON categorias(usuario_id);
CREATE INDEX IF NOT EXISTS idx_categorias_nombre ON categorias(nombre);
CREATE INDEX IF NOT EXISTS idx_categorias_creado_en ON categorias(creado_en);

-- Create trigger for categorias table
CREATE TRIGGER update_categorias_actualizado_en 
    BEFORE UPDATE ON categorias 
    FOR EACH ROW 
    EXECUTE FUNCTION update_actualizado_en_column();

-- Add comments for documentation
COMMENT ON TABLE categorias IS 'User-defined categories for organizing tasks';
COMMENT ON COLUMN categorias.id IS 'Primary key, auto-incrementing category ID';
COMMENT ON COLUMN categorias.usuario_id IS 'Foreign key to usuarios table';
COMMENT ON COLUMN categorias.nombre IS 'Category name, unique per user';
COMMENT ON COLUMN categorias.descripcion IS 'Optional category description';
COMMENT ON COLUMN categorias.color IS 'Hex color code for visual identification';

COMMIT;
