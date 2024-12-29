-- Drop existing policies
DROP POLICY IF EXISTS "users_read_policy" ON users;
DROP POLICY IF EXISTS "users_insert_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;
DROP POLICY IF EXISTS "users_delete_policy" ON users;

-- Create simplified authentication policies
CREATE POLICY "auth_read_policy"
  ON users FOR SELECT
  TO authenticated
  USING (true);

-- Allow BIM admins to create users
CREATE POLICY "auth_insert_policy"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'bim_admin'
    )
  );

-- Allow BIM admins to update any user, and users to update their own last_login
CREATE POLICY "auth_update_policy"
  ON users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'bim_admin'
    )
    OR id = auth.uid()
  );

-- Allow only BIM admins to delete users
CREATE POLICY "auth_delete_policy"
  ON users FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'bim_admin'
    )
  );

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_users_auth;
DROP INDEX IF EXISTS idx_users_admin;

-- Create new indexes with IF NOT EXISTS
CREATE INDEX IF NOT EXISTS idx_users_auth ON users(email, password, role);
CREATE INDEX IF NOT EXISTS idx_users_admin ON users(id, role);

-- Ensure test users exist with correct permissions
INSERT INTO users (email, password, role, full_name)
VALUES 
  ('admin@bellatrix.com', 'admin123', 'bim_admin', 'BIM Administrator'),
  ('bsf@bellatrix.com', 'bsf123', 'bsf', 'BSF User'),
  ('payment@bellatrix.com', 'payment123', 'payment_officer', 'Payment Officer'),
  ('ic@bellatrix.com', 'ic123', 'ic', 'Investment Committee'),
  ('investor@bellatrix.com', 'investor123', 'investor', 'Investor')
ON CONFLICT (email) DO UPDATE 
SET 
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name;