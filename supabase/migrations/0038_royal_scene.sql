-- Drop existing policies
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_insert_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;
DROP POLICY IF EXISTS "users_delete_policy" ON users;

-- Create a single policy for authentication
CREATE POLICY "auth_policy"
  ON users
  FOR ALL
  USING (true)
  WITH CHECK (true);

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