/*
  # Add BIM Admin User
  
  1. Changes
    - Add BIM admin user with proper credentials
    - Ensure idempotent insertion
*/

-- Delete any existing admin user first to ensure clean state
DELETE FROM users WHERE email = 'admin@bellatrix.com';

-- Insert BIM admin user
INSERT INTO users (
  email,
  password,
  role,
  full_name,
  created_at
) VALUES (
  'admin@bellatrix.com',
  'admin123',
  'bim_admin',
  'BIM Administrator',
  now()
);