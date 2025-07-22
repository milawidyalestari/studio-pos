-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id serial PRIMARY KEY,
  name varchar(50) NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone DEFAULT now()
); 