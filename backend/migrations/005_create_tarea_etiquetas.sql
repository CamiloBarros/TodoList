-- Migration 005: Create tarea_etiquetas junction table
-- Description: Many-to-many relationship between tasks and tags
-- Date: 2025-08-13

BEGIN;

-- Create tarea_etiquetas junction table
CREATE TABLE IF NOT EXISTS tarea_etiquetas (
    id SERIAL PRIMARY KEY,
    tarea_id INTEGER NOT NULL,
    etiqueta_id INTEGER NOT NULL,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key Constraints
    CONSTRAINT fk_tarea_etiquetas_tarea 
        FOREIGN KEY (tarea_id) REFERENCES tareas(id) ON DELETE CASCADE,
    CONSTRAINT fk_tarea_etiquetas_etiqueta 
        FOREIGN KEY (etiqueta_id) REFERENCES etiquetas(id) ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicate tag assignments
    CONSTRAINT uk_tarea_etiquetas 
        UNIQUE (tarea_id, etiqueta_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tarea_etiquetas_tarea_id ON tarea_etiquetas(tarea_id);
CREATE INDEX IF NOT EXISTS idx_tarea_etiquetas_etiqueta_id ON tarea_etiquetas(etiqueta_id);
CREATE INDEX IF NOT EXISTS idx_tarea_etiquetas_creado_en ON tarea_etiquetas(creado_en);

-- Add comments for documentation
COMMENT ON TABLE tarea_etiquetas IS 'Junction table for many-to-many relationship between tasks and tags';
COMMENT ON COLUMN tarea_etiquetas.id IS 'Primary key, auto-incrementing junction ID';
COMMENT ON COLUMN tarea_etiquetas.tarea_id IS 'Foreign key to tareas table';
COMMENT ON COLUMN tarea_etiquetas.etiqueta_id IS 'Foreign key to etiquetas table';

COMMIT;
