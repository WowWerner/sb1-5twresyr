-- Drop existing policies on investor_profiles
DROP POLICY IF EXISTS "investor_profiles_select" ON investor_profiles;
DROP POLICY IF EXISTS "investor_profiles_insert" ON investor_profiles;
DROP POLICY IF EXISTS "investor_profiles_update" ON investor_profiles;
DROP POLICY IF EXISTS "investor_profiles_delete" ON investor_profiles;

-- Create new simplified policies for investor_profiles
CREATE POLICY "investor_profiles_access"
  ON investor_profiles
  FOR ALL
  USING (
    -- Allow BIM admins full access
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'bim_admin'
    )
    -- Allow investors to access their own profiles
    OR user_id = auth.uid()
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_investor_profiles_user ON investor_profiles(user_id);

-- Enable RLS on investor_profiles if not already enabled
ALTER TABLE investor_profiles ENABLE ROW LEVEL SECURITY;