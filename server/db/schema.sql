DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE CHECK (email = LOWER(email)),
    password_hash TEXT NOT NULL,
    role text NOT NULL CHECK (ROLE IN ('STUDENT', 'ORGANIZER', 'ADMIN')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    code INTEGER,
    code_expiry_time TIMESTAMPTZ,
    verified BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);