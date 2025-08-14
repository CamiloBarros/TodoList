-- Migration 005: Create task_tags junction table
-- Description: Many-to-many relationship between tasks and tags
-- Date: 2025-08-13

BEGIN;

-- Create task_tags junction table
CREATE TABLE IF NOT EXISTS task_tags (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key Constraints
    CONSTRAINT fk_task_tags_task 
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    CONSTRAINT fk_task_tags_tag 
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicate tag assignments
    CONSTRAINT uk_task_tags 
        UNIQUE (task_id, tag_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_tags_task_id ON task_tags(task_id);
CREATE INDEX IF NOT EXISTS idx_task_tags_tag_id ON task_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_task_tags_created_at ON task_tags(created_at);

-- Add comments for documentation
COMMENT ON TABLE task_tags IS 'Junction table for many-to-many relationship between tasks and tags';
COMMENT ON COLUMN task_tags.id IS 'Primary key, auto-incrementing junction ID';
COMMENT ON COLUMN task_tags.task_id IS 'Foreign key to tasks table';
COMMENT ON COLUMN task_tags.tag_id IS 'Foreign key to tags table';

COMMIT;
