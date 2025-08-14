-- Migration 006: Add updated_at column to tags table
-- Description: Add missing updated_at column and trigger to existing tags table
-- Date: 2025-08-14

BEGIN;

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tags' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE tags ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        
        -- Update existing records to have the same timestamp as created_at
        UPDATE tags SET updated_at = created_at WHERE updated_at IS NULL;
    END IF;
END $$;

-- Create function to update updated_at timestamp if it doesn't exist
CREATE OR REPLACE FUNCTION update_timestamp()
    RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists and recreate it
DROP TRIGGER IF EXISTS trigger_tags_updated_at ON tags;

CREATE TRIGGER trigger_tags_updated_at
    BEFORE UPDATE ON tags
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Add comment for the new column
COMMENT ON COLUMN tags.updated_at IS 'Timestamp when the tag was last updated';

COMMIT;
