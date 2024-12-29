-- Drop existing policies
DROP POLICY IF EXISTS "investor_users_select" ON investor_users;
DROP POLICY IF EXISTS "investor_users_insert" ON investor_users;
DROP POLICY IF EXISTS "investor_users_update" ON investor_users;
DROP POLICY IF EXISTS "investor_users_delete" ON investor_users;
DROP POLICY IF EXISTS "investor_profiles_select" ON investor_profiles;
DROP POLICY IF EXISTS "investor_profiles_insert" ON investor_profiles;
DROP POLICY IF EXISTS "investor_profiles_update" ON investor_profiles;
DROP POLICY IF EXISTS "investor_profiles_delete" ON investor_profiles;

-- Enable RLS
ALTER TABLE investor_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_profiles ENABLE ROW LEVEL SECURITY;

-- Create simplified policies that allow BIM admins full access
CREATE POLICY "investor_users_access"
  ON investor_users
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'bim_admin'
    )
  );

CREATE POLICY "investor_profiles_access"
  ON investor_profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'bim_admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_investor_users_email ON investor_users(email);
CREATE INDEX IF NOT EXISTS idx_investor_profiles_user ON investor_profiles(investor_user_id);