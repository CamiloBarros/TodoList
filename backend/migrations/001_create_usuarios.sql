-- Migration 001: Create usuarios table
-- Description: Base user table for authentication and user management
-- Date: 2025-08-13

BEGIN;

-- Create usuarios table
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT true,
    
    -- Constraints
    CONSTRAINT usuarios_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT usuarios_nombre_length CHECK (char_length(nombre) >= 2 AND char_length(nombre) <= 255)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON usuarios(activo);
CREATE INDEX IF NOT EXISTS idx_usuarios_creado_en ON usuarios(creado_en);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_actualizado_en_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for usuarios table
CREATE TRIGGER update_usuarios_actualizado_en 
    BEFORE UPDATE ON usuarios 
    FOR EACH ROW 
    EXECUTE FUNCTION update_actualizado_en_column();

-- Add comments for documentation
COMMENT ON TABLE usuarios IS 'User accounts for authentication and user management';
COMMENT ON COLUMN usuarios.id IS 'Primary key, auto-incrementing user ID';
COMMENT ON COLUMN usuarios.email IS 'Unique email address for login';
COMMENT ON COLUMN usuarios.nombre IS 'Full name of the user';
COMMENT ON COLUMN usuarios.password_hash IS 'Bcrypt hashed password';
COMMENT ON COLUMN usuarios.activo IS 'Soft delete flag - false means user is deactivated';

COMMIT;
