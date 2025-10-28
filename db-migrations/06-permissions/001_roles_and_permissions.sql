-- =====================================================
-- MIGRATION: Roles and Permissions System
-- Version: 006.001
-- Date: 2025-07-10
-- Description: Sistem roles dan permissions lengkap
-- =====================================================

-- =====================================================
-- ROLES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ROLE PERMISSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS role_permissions (
    id SERIAL PRIMARY KEY,
    role VARCHAR(50) NOT NULL,
    menu VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    allowed BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(role, menu, action)
);

-- =====================================================
-- FOREIGN KEY CONSTRAINTS
-- =====================================================
ALTER TABLE role_permissions 
ADD CONSTRAINT fk_role_permissions_role 
FOREIGN KEY (role) REFERENCES roles(name) 
ON DELETE CASCADE;

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role);
CREATE INDEX IF NOT EXISTS idx_role_permissions_menu ON role_permissions(menu);
CREATE INDEX IF NOT EXISTS idx_role_permissions_action ON role_permissions(action);

-- =====================================================
-- ADD AUTH FIELDS TO EMPLOYEES
-- =====================================================
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'Viewer',
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Add foreign key for employee role
ALTER TABLE employees 
ADD CONSTRAINT fk_employees_role 
FOREIGN KEY (role) REFERENCES roles(name) 
ON DELETE SET NULL;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE roles IS 'Tabel untuk mengelola role/jabatan pengguna';
COMMENT ON TABLE role_permissions IS 'Tabel untuk mengelola hak akses per role';
COMMENT ON COLUMN employees.username IS 'Username untuk login sistem';
COMMENT ON COLUMN employees.password_hash IS 'Hash password untuk keamanan';
COMMENT ON COLUMN employees.role IS 'Role/jabatan employee untuk sistem permission';











