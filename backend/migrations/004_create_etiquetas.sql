-- Migration 004: Create etiquetas table
-- Description: Tags/labels for flexible task categorization
-- Date: 2025-08-13

BEGIN;

-- Create etiquetas table
CREATE TABLE IF NOT EXISTS etiquetas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    color VARCHAR(7) DEFAULT '#6B7280',
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key Constraints
    CONSTRAINT fk_etiquetas_usuario 
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    
    -- Business Logic Constraints
    CONSTRAINT etiquetas_nombre_length 
        CHECK (char_length(nombre) >= 1 AND char_length(nombre) <= 50),
    CONSTRAINT etiquetas_color_format 
        CHECK (color ~* '^#[0-9A-Fa-f]{6}$'),
    
    -- Unique constraint per user
    CONSTRAINT uk_etiquetas_usuario_nombre 
        UNIQUE (usuario_id, nombre)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_etiquetas_usuario_id ON etiquetas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_etiquetas_nombre ON etiquetas(nombre);
CREATE INDEX IF NOT EXISTS idx_etiquetas_creado_en ON etiquetas(creado_en);

-- Add comments for documentation
COMMENT ON TABLE etiquetas IS 'User-defined tags for flexible task categorization';
COMMENT ON COLUMN etiquetas.id IS 'Primary key, auto-incrementing tag ID';
COMMENT ON COLUMN etiquetas.usuario_id IS 'Foreign key to usuarios table';
COMMENT ON COLUMN etiquetas.nombre IS 'Tag name, unique per user';
COMMENT ON COLUMN etiquetas.color IS 'Hex color code for visual identification';

COMMIT;
