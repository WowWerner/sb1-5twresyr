-- Drop existing policies
DROP POLICY IF EXISTS "auth_policy" ON users;
DROP POLICY IF EXISTS "investor_profiles_access" ON investor_profiles;

-- Create simplified user authentication policies
CREATE POLICY "users_auth_policy"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "users_write_policy"
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

-- Create simplified investor profiles policies
CREATE POLICY "investor_profiles_read"
  ON investor_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "investor_profiles_write"
  ON investor_profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow BIM admins to create profiles
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'bim_admin'
    )
    -- Allow users to create their own profile
    OR user_id = auth.uid()
  );

CREATE POLICY "investor_profiles_modify"
  ON investor_profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'bim_admin'
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "investor_profiles_delete"
  ON investor_profiles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'bim_admin'
    )
  );

-- Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_profiles ENABLE ROW LEVEL SECURITY;

-- Recreate indexes
DROP INDEX IF EXISTS idx_users_lookup;
DROP INDEX IF EXISTS idx_users_auth;
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_investor_profiles_user ON investor_profiles(user_id);

-- Ensure test users exist
INSERT INTO users (email, password, role, full_name)
VALUES 
  ('admin@bellatrix.com', 'admin123', 'bim_admin', 'BIM Administrator'),
  ('bsf@bellatrix.com', 'bsf123', 'bsf', 'BSF User'),
  ('bim@bellatrix.com', 'bim123', 'bim_admin', 'BIM Admin'),
  ('payment@bellatrix.com', 'payment123', 'payment_officer', 'Payment Officer'),
  ('ic@bellatrix.com', 'ic123', 'ic', 'Investment Committee'),
  ('investor@bellatrix.com', 'investor123', 'investor', 'Investor')
ON CONFLICT (email) DO UPDATE 
SET 
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name;