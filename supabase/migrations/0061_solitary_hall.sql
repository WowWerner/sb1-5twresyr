-- Drop existing policies
DROP POLICY IF EXISTS "investor_users_access" ON investor_users;
DROP POLICY IF EXISTS "investor_profiles_access" ON investor_profiles;

-- Enable RLS
ALTER TABLE investor_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_profiles ENABLE ROW LEVEL SECURITY;

-- Create simplified policies for investor_users
CREATE POLICY "investor_users_access"
  ON investor_users
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create simplified policies for investor_profiles
CREATE POLICY "investor_profiles_access"
  ON investor_profiles
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_investor_users_email ON investor_users(email);
CREATE INDEX IF NOT EXISTS idx_investor_profiles_user ON investor_profiles(investor_user_id);