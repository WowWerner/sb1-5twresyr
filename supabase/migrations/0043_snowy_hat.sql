/*
  # Fix Authentication and Admin User Setup

  1. Changes
    - Drop existing policies
    - Create new simplified authentication policy
    - Ensure admin user exists with correct credentials
    - Add login performance index
*/

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "users_select" ON users;
  DROP POLICY IF EXISTS "users_update" ON users;
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

-- Create new simplified policy for authentication
DO $$ BEGIN
  DROP POLICY IF EXISTS "enable_all_access" ON users;
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

CREATE POLICY "enable_all_access"
  ON users
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create index for login performance
CREATE INDEX IF NOT EXISTS idx_users_auth_lookup 
ON users(email, password, role);

-- Ensure admin user exists
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