-- Drop existing policies
DROP POLICY IF EXISTS "users_select" ON users;
DROP POLICY IF EXISTS "users_insert" ON users;
DROP POLICY IF EXISTS "users_update" ON users;
DROP POLICY IF EXISTS "users_delete" ON users;

-- Create simplified policies for authentication
CREATE POLICY "allow_read_all_users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "allow_bim_admin_all"
  ON users FOR ALL
  TO authenticated
  USING (
    role = 'bim_admin'
  );

CREATE POLICY "allow_update_own"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_users_email_role ON users(email, role);

-- Ensure test users exist
INSERT INTO users (email, password, role, full_name)
VALUES 
  ('admin@bellatrix.com', 'admin123', 'bim_admin', 'BIM Administrator'),
  ('bsf@bellatrix.com', 'bsf123', 'bsf', 'BSF User'),
  ('payment@bellatrix.com', 'payment123', 'payment_officer', 'Payment Officer'),
  ('ic@bellatrix.com', 'ic123', 'ic', 'Investment Committee'),
  ('investor@bellatrix.com', 'investor123', 'investor', 'Investor')
ON CONFLICT (email) DO NOTHING;