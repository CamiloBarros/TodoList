-- Migration 003: Create tasks table
-- Description: Main tasks table with all task-related information
-- Date: 2025-08-13

BEGIN;

-- Create custom ENUM type for priority
CREATE TYPE priority_enum AS ENUM ('low', 'medium', 'high');

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    category_id INTEGER,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT false,
    priority priority_enum DEFAULT 'medium',
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key Constraints
    CONSTRAINT fk_tasks_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_tasks_category 
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    
    -- Business Logic Constraints
    CONSTRAINT tasks_title_length 
        CHECK (char_length(title) >= 1 AND char_length(title) <= 255),
    CONSTRAINT tasks_due_date_future 
        CHECK (due_date IS NULL OR due_date >= CURRENT_DATE),
    CONSTRAINT tasks_completed_logic 
        CHECK (
            (completed = false AND completed_at IS NULL) OR 
            (completed = true AND completed_at IS NOT NULL)
        )
);

-- Create indexes for performance and common queries
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_category_id ON tasks(category_id);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);

-- Composite indexes for common filter combinations
CREATE INDEX IF NOT EXISTS idx_tasks_user_completed 
    ON tasks(user_id, completed);
CREATE INDEX IF NOT EXISTS idx_tasks_user_completed_date 
    ON tasks(user_id, completed, due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_user_category 
    ON tasks(user_id, category_id);

-- Full-text search index for title and description
CREATE INDEX IF NOT EXISTS idx_tasks_search 
    ON tasks USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Create trigger for tasks table
CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON tasks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically set completed_at when task is completed
CREATE OR REPLACE FUNCTION set_completed_at()
RETURNS TRIGGER AS $$
BEGIN
    -- If task is being marked as completed
    IF NEW.completed = true AND OLD.completed = false THEN
        NEW.completed_at = CURRENT_TIMESTAMP;
    -- If task is being marked as incomplete
    ELSIF NEW.completed = false AND OLD.completed = true THEN
        NEW.completed_at = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic completed_at management
CREATE TRIGGER set_tasks_completed_at 
    BEFORE UPDATE ON tasks 
    FOR EACH ROW 
    EXECUTE FUNCTION set_completed_at();

-- Add comments for documentation
COMMENT ON TABLE tasks IS 'Main tasks table containing all task information';
COMMENT ON COLUMN tasks.id IS 'Primary key, auto-incrementing task ID';
COMMENT ON COLUMN tasks.user_id IS 'Foreign key to users table';
COMMENT ON COLUMN tasks.category_id IS 'Foreign key to categories table (optional)';
COMMENT ON COLUMN tasks.title IS 'Task title, required field';
COMMENT ON COLUMN tasks.description IS 'Optional detailed task description';
COMMENT ON COLUMN tasks.completed IS 'Task completion status';
COMMENT ON COLUMN tasks.priority IS 'Task priority level: low, medium, high';
COMMENT ON COLUMN tasks.due_date IS 'Optional due date for the task';
COMMENT ON COLUMN tasks.completed_at IS 'Timestamp when task was completed';

COMMIT;
