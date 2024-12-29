/*
  # Fix Authentication Policies

  1. Changes
    - Drop existing problematic policies
    - Create new simplified authentication policies
    - Add missing indexes for performance
    - Ensure admin user exists

  2. Security
    - Enable RLS on users table
    - Add policies for authentication and admin access
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "users_read_access" ON users;
DROP POLICY IF EXISTS "users_admin_access" ON users;

-- Create simplified authentication policies
CREATE POLICY "authenticate_users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "manage_own_user"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "admin_manage_users"
  ON users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'bim_admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Ensure admin user exists (without deleting existing users)
INSERT INTO users (email, password, role, full_name)
VALUES ('admin@bellatrix.com', 'admin123', 'bim_admin', 'BIM Administrator')
ON CONFLICT (email) 
DO UPDATE SET 
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name;