-- Drop existing policies
DROP POLICY IF EXISTS "auth_read_policy" ON users;
DROP POLICY IF EXISTS "auth_insert_policy" ON users;
DROP POLICY IF EXISTS "auth_update_policy" ON users;
DROP POLICY IF EXISTS "auth_delete_policy" ON users;

-- Create simplified authentication policies
CREATE POLICY "users_auth_policy"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "users_admin_policy"
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
DROP INDEX IF EXISTS idx_users_auth;
DROP INDEX IF EXISTS idx_users_admin;
CREATE INDEX IF NOT EXISTS idx_users_lookup ON users(email, role);
CREATE INDEX IF NOT EXISTS idx_users_auth ON users(email, password);

-- Ensure test users exist
DELETE FROM users WHERE email IN (
  'admin@bellatrix.com',
  'bsf@bellatrix.com',
  'payment@bellatrix.com',
  'ic@bellatrix.com',
  'investor@bellatrix.com'
);

INSERT INTO users (email, password, role, full_name)
VALUES 
  ('admin@bellatrix.com', 'admin123', 'bim_admin', 'BIM Administrator'),
  ('bsf@bellatrix.com', 'bsf123', 'bsf', 'BSF User'),
  ('payment@bellatrix.com', 'payment123', 'payment_officer', 'Payment Officer'),
  ('ic@bellatrix.com', 'ic123', 'ic', 'Investment Committee'),
  ('investor@bellatrix.com', 'investor123', 'investor', 'Investor');