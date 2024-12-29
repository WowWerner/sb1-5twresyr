-- Drop existing policies
DROP POLICY IF EXISTS "investor_users_read" ON investor_users;
DROP POLICY IF EXISTS "investor_users_insert" ON investor_users;
DROP POLICY IF EXISTS "investor_users_update" ON investor_users;
DROP POLICY IF EXISTS "investor_profiles_access" ON investor_profiles;

-- Create investor_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS investor_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  full_name text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at timestamptz DEFAULT now(),
  last_login timestamptz
);

-- Add investor_user_id to investor_profiles if it doesn't exist
ALTER TABLE investor_profiles
DROP CONSTRAINT IF EXISTS investor_profiles_user_id_fkey,
ADD COLUMN IF NOT EXISTS investor_user_id uuid REFERENCES investor_users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('active', 'pending_review', 'approved', 'rejected'));

-- Enable RLS
ALTER TABLE investor_users ENABLE ROW LEVEL SECURITY;

-- Create new policies with proper checks
CREATE POLICY "allow_bim_admin_all_investor_users"
  ON investor_users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'bim_admin'
    )
  );

CREATE POLICY "allow_investor_read_own"
  ON investor_users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "allow_bim_admin_all_investor_profiles"
  ON investor_profiles FOR ALL
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
CREATE INDEX IF NOT EXISTS idx_investor_profiles_status ON investor_profiles(status);