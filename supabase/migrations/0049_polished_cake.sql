/*
  # Update Investor Profile and User Relationships

  1. Changes
    - Add investor_users table for dedicated investor authentication
    - Update investor_profiles to reference investor_users
    - Add proper indexes and foreign key relationships
    - Create RLS policies for secure access
*/

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "investor_users_read" ON investor_users;
  DROP POLICY IF EXISTS "investor_users_insert" ON investor_users;
  DROP POLICY IF EXISTS "investor_users_update" ON investor_users;
  DROP POLICY IF EXISTS "investor_profiles_access" ON investor_profiles;
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

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
DO $$ BEGIN
  ALTER TABLE investor_profiles
  ADD COLUMN investor_user_id uuid REFERENCES investor_users(id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

-- Enable RLS
ALTER TABLE investor_users ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "investor_users_read"
  ON investor_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'bim_admin'
    )
    OR id = auth.uid()
  );

CREATE POLICY "investor_users_insert"
  ON investor_users FOR INSERT
  TO authenticated
  WITH CHECK (
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
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'bim_admin'
    )
    OR id = auth.uid()
  );

CREATE POLICY "investor_profiles_access"
  ON investor_profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'bim_admin'
    )
    OR investor_user_id = auth.uid()
  );

-- Create or replace indexes
DROP INDEX IF EXISTS idx_investor_users_email;
DROP INDEX IF EXISTS idx_investor_profiles_user;

CREATE INDEX idx_investor_users_email ON investor_users(email);
CREATE INDEX idx_investor_profiles_user ON investor_profiles(investor_user_id);