-- Migration 003: Create tareas table
-- Description: Main tasks table with all task-related information
-- Date: 2025-08-13

BEGIN;

-- Create custom ENUM type for priority
CREATE TYPE prioridad_enum AS ENUM ('baja', 'media', 'alta');

-- Create tareas table
CREATE TABLE IF NOT EXISTS tareas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    categoria_id INTEGER,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    completada BOOLEAN DEFAULT false,
    prioridad prioridad_enum DEFAULT 'media',
    fecha_vencimiento DATE,
    completada_en TIMESTAMP WITH TIME ZONE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key Constraints
    CONSTRAINT fk_tareas_usuario 
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_tareas_categoria 
        FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL,
    
    -- Business Logic Constraints
    CONSTRAINT tareas_titulo_length 
        CHECK (char_length(titulo) >= 1 AND char_length(titulo) <= 255),
    CONSTRAINT tareas_fecha_vencimiento_future 
        CHECK (fecha_vencimiento IS NULL OR fecha_vencimiento >= CURRENT_DATE),
    CONSTRAINT tareas_completada_logic 
        CHECK (
            (completada = false AND completada_en IS NULL) OR 
            (completada = true AND completada_en IS NOT NULL)
        )
);

-- Create indexes for performance and common queries
CREATE INDEX IF NOT EXISTS idx_tareas_usuario_id ON tareas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_tareas_categoria_id ON tareas(categoria_id);
CREATE INDEX IF NOT EXISTS idx_tareas_completada ON tareas(completada);
CREATE INDEX IF NOT EXISTS idx_tareas_prioridad ON tareas(prioridad);
CREATE INDEX IF NOT EXISTS idx_tareas_fecha_vencimiento ON tareas(fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_tareas_creado_en ON tareas(creado_en);

-- Composite indexes for common filter combinations
CREATE INDEX IF NOT EXISTS idx_tareas_usuario_completada 
    ON tareas(usuario_id, completada);
CREATE INDEX IF NOT EXISTS idx_tareas_usuario_completada_fecha 
    ON tareas(usuario_id, completada, fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_tareas_usuario_categoria 
    ON tareas(usuario_id, categoria_id);

-- Full-text search index for titulo and descripcion
CREATE INDEX IF NOT EXISTS idx_tareas_busqueda 
    ON tareas USING gin(to_tsvector('spanish', titulo || ' ' || COALESCE(descripcion, '')));

-- Create trigger for tareas table
CREATE TRIGGER update_tareas_actualizado_en 
    BEFORE UPDATE ON tareas 
    FOR EACH ROW 
    EXECUTE FUNCTION update_actualizado_en_column();

-- Create function to automatically set completada_en when task is completed
CREATE OR REPLACE FUNCTION set_completada_en()
RETURNS TRIGGER AS $$
BEGIN
    -- If task is being marked as completed
    IF NEW.completada = true AND OLD.completada = false THEN
        NEW.completada_en = CURRENT_TIMESTAMP;
    -- If task is being marked as incomplete
    ELSIF NEW.completada = false AND OLD.completada = true THEN
        NEW.completada_en = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic completada_en management
CREATE TRIGGER set_tareas_completada_en 
    BEFORE UPDATE ON tareas 
    FOR EACH ROW 
    EXECUTE FUNCTION set_completada_en();

-- Add comments for documentation
COMMENT ON TABLE tareas IS 'Main tasks table containing all task information';
COMMENT ON COLUMN tareas.id IS 'Primary key, auto-incrementing task ID';
COMMENT ON COLUMN tareas.usuario_id IS 'Foreign key to usuarios table';
COMMENT ON COLUMN tareas.categoria_id IS 'Foreign key to categorias table (optional)';
COMMENT ON COLUMN tareas.titulo IS 'Task title, required field';
COMMENT ON COLUMN tareas.descripcion IS 'Optional detailed task description';
COMMENT ON COLUMN tareas.completada IS 'Task completion status';
COMMENT ON COLUMN tareas.prioridad IS 'Task priority level: baja, media, alta';
COMMENT ON COLUMN tareas.fecha_vencimiento IS 'Optional due date for the task';
COMMENT ON COLUMN tareas.completada_en IS 'Timestamp when task was completed';

COMMIT;
