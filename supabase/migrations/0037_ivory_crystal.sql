-- Drop existing policies
DROP POLICY IF EXISTS "users_auth_policy" ON users;
DROP POLICY IF EXISTS "users_admin_policy" ON users;

-- Create simplified authentication policies
CREATE POLICY "users_select_policy"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "users_insert_policy"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'bim_admin'
    )
  );

CREATE POLICY "users_update_policy"
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

CREATE POLICY "users_delete_policy"
  ON users FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'bim_admin'
    )
  );

-- Recreate test users
DELETE FROM users WHERE email IN (
  'admin@bellatrix.com',
  'bsf@bellatrix.com',
  'bim@bellatrix.com',
  'payment@bellatrix.com',
  'ic@bellatrix.com',
  'investor@bellatrix.com'
);

INSERT INTO users (email, password, role, full_name)
VALUES 
  ('admin@bellatrix.com', 'admin123', 'bim_admin', 'BIM Administrator'),
  ('bsf@bellatrix.com', 'bsf123', 'bsf', 'BSF User'),
  ('bim@bellatrix.com', 'bim123', 'bim_admin', 'BIM Admin'),
  ('payment@bellatrix.com', 'payment123', 'payment_officer', 'Payment Officer'),
  ('ic@bellatrix.com', 'ic123', 'ic', 'Investment Committee'),
  ('investor@bellatrix.com', 'investor123', 'investor', 'Investor');