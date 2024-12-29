/*
  # Fix Authentication Policies

  1. Changes
    - Drop existing problematic policies
    - Create new focused authentication policies
    - Add proper indexes for performance
*/

-- Drop existing policies
DROP POLICY IF EXISTS "authenticate_users" ON users;
DROP POLICY IF EXISTS "manage_own_user" ON users;
DROP POLICY IF EXISTS "admin_manage_users" ON users;

-- Create new focused policies
CREATE POLICY "users_read_policy"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "bim_admin_manage_all"
  ON users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'bim_admin'
    )
  );

-- Create or update indexes
CREATE INDEX IF NOT EXISTS idx_users_email_role ON users(email, role);
CREATE INDEX IF NOT EXISTS idx_users_auth ON users(id, role);