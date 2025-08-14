-- Migration 006: Add actualizado_en column to etiquetas table
-- Description: Add missing actualizado_en column and trigger to existing etiquetas table
-- Date: 2025-08-14

BEGIN;

-- Add actualizado_en column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'etiquetas' AND column_name = 'actualizado_en'
    ) THEN
        ALTER TABLE etiquetas ADD COLUMN actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        
        -- Update existing records to have the same timestamp as creado_en
        UPDATE etiquetas SET actualizado_en = creado_en WHERE actualizado_en IS NULL;
    END IF;
END $$;

-- Create function to update actualizado_en timestamp if it doesn't exist
CREATE OR REPLACE FUNCTION actualizar_timestamp()
    RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists and recreate it
DROP TRIGGER IF EXISTS trigger_etiquetas_actualizado_en ON etiquetas;

CREATE TRIGGER trigger_etiquetas_actualizado_en
    BEFORE UPDATE ON etiquetas
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp();

-- Add comment for the new column
COMMENT ON COLUMN etiquetas.actualizado_en IS 'Timestamp when the tag was last updated';

COMMIT;
