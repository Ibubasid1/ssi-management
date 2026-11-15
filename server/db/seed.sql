INSERT INTO users (name, email, code, code_expiry_time) VALUES
('Test User', 'test@example.com', 123456, NOW() + interval '7 days');