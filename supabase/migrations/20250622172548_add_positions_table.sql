CREATE TABLE IF NOT EXISTS positions (
  id serial PRIMARY KEY,
  name varchar(100) NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now()
);
