-- Migration 004: Create tags table
-- Description: Tags/labels for flexible task categorization
-- Date: 2025-08-13

BEGIN;

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) DEFAULT '#6B7280',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key Constraints
    CONSTRAINT fk_tags_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Business Logic Constraints
    CONSTRAINT tags_name_length 
        CHECK (char_length(name) >= 1 AND char_length(name) <= 50),
    CONSTRAINT tags_color_format 
        CHECK (color ~* '^#[0-9A-Fa-f]{6}$'),
    
    -- Unique constraint per user
    CONSTRAINT uk_tags_user_name 
        UNIQUE (user_id, name)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
CREATE INDEX IF NOT EXISTS idx_tags_created_at ON tags(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
    RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_tags_updated_at
    BEFORE UPDATE ON tags
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Add comments for documentation
COMMENT ON TABLE tags IS 'User-defined tags for flexible task categorization';
COMMENT ON COLUMN tags.id IS 'Primary key, auto-incrementing tag ID';
COMMENT ON COLUMN tags.user_id IS 'Foreign key to users table';
COMMENT ON COLUMN tags.name IS 'Tag name, unique per user';
COMMENT ON COLUMN tags.color IS 'Hex color code for visual identification';
COMMENT ON COLUMN tags.created_at IS 'Timestamp when the tag was created';
COMMENT ON COLUMN tags.updated_at IS 'Timestamp when the tag was last updated';

COMMIT;
