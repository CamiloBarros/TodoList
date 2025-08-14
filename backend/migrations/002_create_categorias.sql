-- Migration 002: Create categories table
-- Description: Categories for organizing tasks
-- Date: 2025-08-13

BEGIN;

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key Constraints
    CONSTRAINT fk_categories_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Business Logic Constraints
    CONSTRAINT categories_name_length 
        CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
    CONSTRAINT categories_color_format 
        CHECK (color ~* '^#[0-9A-Fa-f]{6}$'),
    
    -- Unique constraint per user
    CONSTRAINT uk_categories_user_name 
        UNIQUE (user_id, name)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_created_at ON categories(created_at);

-- Create trigger for categories table
CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE categories IS 'User-defined categories for organizing tasks';
COMMENT ON COLUMN categories.id IS 'Primary key, auto-incrementing category ID';
COMMENT ON COLUMN categories.user_id IS 'Foreign key to users table';
COMMENT ON COLUMN categories.name IS 'Category name, unique per user';
COMMENT ON COLUMN categories.description IS 'Optional category description';
COMMENT ON COLUMN categories.color IS 'Hex color code for visual identification';

COMMIT;
