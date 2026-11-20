INSERT INTO allowed_role_emails (email, role) VALUES
('m.samee.30765@khi.iba.edu.pk', 'ADMIN'),
('organizer@khi.iba.edu.pk', 'ORGANIZER'),
('admin@khi.iba.edu.pk', 'ADMIN');

INSERT INTO users (name, email, password_hash, role, is_verified) VALUES
('Verified Student', 'student@khi.iba.edu.pk', '$2b$10$dummyhashfortestingonly1234567890123456789012', 'STUDENT', TRUE);