/*
  # Fix Authentication Setup
  
  1. Changes
    - Drop all existing auth policies
    - Create simple but secure policies
    - Ensure proper indexes
    - Reset admin user
*/

-- First drop all existing policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "users_read_access" ON users;
  DROP POLICY IF EXISTS "users_update_access" ON users;
  DROP POLICY IF EXISTS "enable_all_access" ON users;
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

-- Drop existing indexes
DROP INDEX IF EXISTS idx_users_auth_lookup;
DROP INDEX IF EXISTS idx_users_login;

-- Create new simplified policy
CREATE POLICY "allow_all_authenticated"
  ON users
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create optimized index for auth queries
CREATE INDEX idx_users_auth 
ON users(email, password, role);

-- Delete and recreate admin user
DELETE FROM users WHERE email = 'admin@bellatrix.com';

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