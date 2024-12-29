/*
  # Add BIM Admin User

  1. Changes
    - Insert BIM admin user with credentials
*/

INSERT INTO users (email, password, role, full_name)
VALUES (
  'admin@bellatrix.com',
  'admin123',
  'bim_admin',
  'BIM Administrator'
) ON CONFLICT (email) DO NOTHING;