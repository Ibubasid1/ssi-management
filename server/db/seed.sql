INSERT INTO users (name, email, password_hash, role, verified, code, code_expiry_time) VALUES
('System Admin', 'admin@ssi.edu.pk', '$2b$10$rwW7ycgk27kDGdsvoVl5hewLFHOXnCZGJRxWxWLtw4aTlSOlANrU6', 'ADMIN', true, NULL, NULL),
('Event Organizer ', 'organizer@ssi.edu.pk', '$2b$10$qhGM9XH.oCe.prmOspJOTufPPAmi1LItD1AIeGPU0jAAwZGEJHxSO', 'ORGANIZER', true, NULL, NULL),
('Test Student', 'student@ssi.edu.pk', '$2b$10$gGZilzLJE6FRKEJn.uktQ.vND3V3E3L4a1mp6TnZNUCI8bbePCKSa', 'STUDENT', true, NULL, NULL),
('Pending Student', 'pending@ssi.edu.pk', '$2b$10$gGZilzLJE6FRKEJn.uktQ.vND3V3E3L4a1mp6TnZNUCI8bbePCKSa', 'STUDENT', false, 123456, NOW() + interval '10 years');