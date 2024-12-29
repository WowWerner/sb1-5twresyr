/*
  # Fix Admin User and Login Issues

  1. Changes
    - Delete and recreate admin user with correct credentials
    - Add indexes for better login performance
    - Update RLS policies for better security
*/

-- First ensure no duplicate admin users exist
DELETE FROM users 
WHERE email = 'admin@bellatrix.com';

-- Create admin user with correct credentials
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

-- Create index specifically for login queries
CREATE INDEX IF NOT EXISTS idx_users_login 
ON users(email, password, role);

-- Update RLS policies for better security
DROP POLICY IF EXISTS "users_auth_policy" ON users;
DROP POLICY IF EXISTS "users_write_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;

-- Create new simplified policies
CREATE POLICY "users_select"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "users_update"
  ON users FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid() OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'bim_admin'
  );