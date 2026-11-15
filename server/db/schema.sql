DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);