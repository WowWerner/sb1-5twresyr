/*
  # Improve Authentication Policies and Indexes

  1. Changes
    - Drop existing policies
    - Create optimized authentication policies
    - Add composite index for faster login queries
    - Ensure admin user exists
*/

-- Drop existing policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "enable_all_access" ON users;
  DROP POLICY IF EXISTS "users_select" ON users;
  DROP POLICY IF EXISTS "users_update" ON users;
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

-- Create new authentication policies
CREATE POLICY "users_read_access"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "users_update_access"
  ON users FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'bim_admin'
    )
  );

-- Drop existing indexes
DROP INDEX IF EXISTS idx_users_auth_lookup;
DROP INDEX IF EXISTS idx_users_login;

-- Create optimized index for login queries
CREATE INDEX idx_users_auth_lookup 
ON users(email, password, role) 
WHERE role = 'bim_admin';

-- Ensure admin user exists with correct credentials
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
)
ON CONFLICT (email) 
DO UPDATE SET 
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name;