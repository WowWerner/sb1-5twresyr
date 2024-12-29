-- Drop existing policies
DROP POLICY IF EXISTS "investor_users_all_access" ON investor_users;
DROP POLICY IF EXISTS "investor_profiles_all_access" ON investor_profiles;

-- Create function to check BIM admin role
CREATE OR REPLACE FUNCTION is_bim_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'bim_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE investor_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for investor_users
CREATE POLICY "investor_users_select"
  ON investor_users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "investor_users_insert"
  ON investor_users FOR INSERT
  TO authenticated
  WITH CHECK (is_bim_admin());

CREATE POLICY "investor_users_update"
  ON investor_users FOR UPDATE
  TO authenticated
  USING (is_bim_admin());

CREATE POLICY "investor_users_delete"
  ON investor_users FOR DELETE
  TO authenticated
  USING (is_bim_admin());

-- Create policies for investor_profiles
CREATE POLICY "investor_profiles_select"
  ON investor_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "investor_profiles_insert"
  ON investor_profiles FOR INSERT
  TO authenticated
  WITH CHECK (is_bim_admin());

CREATE POLICY "investor_profiles_update"
  ON investor_profiles FOR UPDATE
  TO authenticated
  USING (is_bim_admin());

CREATE POLICY "investor_profiles_delete"
  ON investor_profiles FOR DELETE
  TO authenticated
  USING (is_bim_admin());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_investor_users_email ON investor_users(email);
CREATE INDEX IF NOT EXISTS idx_investor_profiles_user ON investor_profiles(investor_user_id);