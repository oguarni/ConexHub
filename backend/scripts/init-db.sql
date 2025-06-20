-- Initialize B2B Marketplace Database
-- This script is executed when the PostgreSQL container first starts

-- Create the database if it doesn't exist
-- (Note: This will be created by docker-compose environment variables)

-- Set timezone
SET timezone = 'UTC';

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Basic optimizations
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000;

-- Basic indexes that might be needed
-- (The actual table creation will be handled by Sequelize migrations)

-- Done
SELECT 'Database initialization completed' AS status;