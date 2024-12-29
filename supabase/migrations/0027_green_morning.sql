-- Drop existing problematic policies and functions
DROP POLICY IF EXISTS "allow_public_read_users" ON users;
DROP POLICY IF EXISTS "allow_bim_admin_manage_users" ON users;
DROP FUNCTION IF EXISTS is_bim_admin();

-- Create simplified policies for users table
CREATE POLICY "users_read_policy"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "users_write_policy"
  ON users 
  USING (
    CASE 
      -- Allow BIM admins to manage all users
      WHEN role = 'bim_admin' THEN true
      -- Allow users to manage their own data
      WHEN auth.uid() = id THEN true
      ELSE false
    END
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Ensure test users exist
INSERT INTO users (email, password, role, full_name)
VALUES 
  ('admin@bellatrix.com', 'admin123', 'bim_admin', 'BIM Administrator'),
  ('bsf@bellatrix.com', 'bsf123', 'bsf', 'BSF User'),
  ('payment@bellatrix.com', 'payment123', 'payment_officer', 'Payment Officer'),
  ('ic@bellatrix.com', 'ic123', 'ic', 'Investment Committee'),
  ('investor@bellatrix.com', 'investor123', 'investor', 'Investor')
ON CONFLICT (email) DO NOTHING;