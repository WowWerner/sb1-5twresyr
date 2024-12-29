-- First delete existing data in reverse dependency order
DELETE FROM investor_accounts;
DELETE FROM investor_profiles;
DELETE FROM users WHERE role = 'investor';

-- Create new investor_users table
CREATE TABLE investor_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  full_name text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at timestamptz DEFAULT now(),
  last_login timestamptz
);

-- Update investor_profiles to reference new investor_users table
ALTER TABLE investor_profiles 
  DROP CONSTRAINT investor_profiles_user_id_fkey,
  ADD COLUMN investor_user_id uuid REFERENCES investor_users(id) ON DELETE CASCADE,
  ADD COLUMN status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending_review', 'approved', 'rejected'));

-- Enable RLS on investor_users
ALTER TABLE investor_users ENABLE ROW LEVEL SECURITY;

-- Create policies for investor_users
CREATE POLICY "investor_users_read"
  ON investor_users FOR SELECT
  TO authenticated
  USING (
    -- Allow BIM admins to read all
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'bim_admin'
    )
    -- Allow investors to read own data
    OR id = auth.uid()
  );

CREATE POLICY "investor_users_insert"
  ON investor_users FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Only BIM admins can create investor users
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'bim_admin'
    )
  );

CREATE POLICY "investor_users_update"
  ON investor_users FOR UPDATE
  TO authenticated
  USING (
    -- BIM admins can update any investor
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'bim_admin'
    )
    -- Investors can update their own basic info
    OR id = auth.uid()
  );

CREATE POLICY "investor_users_delete"
  ON investor_users FOR DELETE
  TO authenticated
  USING (
    -- Only BIM admins can delete investors
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'bim_admin'
    )
  );

-- Update investor profiles policies
DROP POLICY IF EXISTS "investor_profiles_read" ON investor_profiles;
DROP POLICY IF EXISTS "investor_profiles_write" ON investor_profiles;
DROP POLICY IF EXISTS "investor_profiles_modify" ON investor_profiles;
DROP POLICY IF EXISTS "investor_profiles_delete" ON investor_profiles;

CREATE POLICY "investor_profiles_access"
  ON investor_profiles FOR ALL
  TO authenticated
  USING (
    -- BIM admins have full access
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'bim_admin'
    )
    -- Investors can access their own profile
    OR investor_user_id = auth.uid()
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_investor_users_email ON investor_users(email);
CREATE INDEX IF NOT EXISTS idx_investor_profiles_user ON investor_profiles(investor_user_id);
CREATE INDEX IF NOT EXISTS idx_investor_profiles_status ON investor_profiles(status);