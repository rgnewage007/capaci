-- Extensión UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('admin', 'instructor', 'student')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    profile_image_url VARCHAR(500),
    phone_number VARCHAR(20),
    department VARCHAR(100),
    position VARCHAR(100),
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Insertar usuario admin por defecto (password: admin123)
INSERT INTO users (email, first_name, last_name, password_hash, role)
VALUES (
    'admin@learninghub.com', 
    'Administrador', 
    'Sistema', 
    '$2a$12$r8ARx5Ua8NlO1c6zR7qV.OL4vJ9cW8kY5rT2nS3pL6mQ1vB7yN4dC', 
    'admin'
)
ON CONFLICT (email) DO NOTHING;

-- Índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);