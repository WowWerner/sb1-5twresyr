-- Drop existing policies
DROP POLICY IF EXISTS "auth_policy" ON users;
DROP POLICY IF EXISTS "users_read_policy" ON users;
DROP POLICY IF EXISTS "users_write_policy" ON users;

-- Create simplified authentication policies
CREATE POLICY "users_auth_policy"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "users_update_policy"
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

-- Create index for better login performance
CREATE INDEX IF NOT EXISTS idx_users_login 
ON users(email, password, role);

-- Ensure test users exist with correct credentials
INSERT INTO users (email, password, role, full_name)
VALUES 
  ('admin@bellatrix.com', 'admin123', 'bim_admin', 'BIM Administrator'),
  ('bsf@bellatrix.com', 'bsf123', 'bsf', 'BSF User'),
  ('payment@bellatrix.com', 'payment123', 'payment_officer', 'Payment Officer'),
  ('ic@bellatrix.com', 'ic123', 'ic', 'Investment Committee'),
  ('investor@bellatrix.com', 'investor123', 'investor', 'Investor')
ON CONFLICT (email) 
DO UPDATE SET 
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name;