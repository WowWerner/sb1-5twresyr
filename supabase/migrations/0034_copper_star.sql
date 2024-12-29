/*
  # Fix BIM Admin Policies

  1. Changes
    - Drop existing policies
    - Create proper BIM admin policies
    - Add proper RLS for user management
    - Ensure proper cascading delete support
*/

-- First drop existing policies
DROP POLICY IF EXISTS "allow_auth" ON users;
DROP POLICY IF EXISTS "allow_updates" ON users;

-- Create comprehensive policies for users table
CREATE POLICY "users_read_policy"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "users_insert_policy"
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
    -- Allow BIM admins to update any user
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'bim_admin'
    )
    -- Allow users to update their own data
    OR id = auth.uid()
  );

CREATE POLICY "users_delete_policy"
  ON users FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'bim_admin'
    )
  );

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

-- Add cascade delete support for investor profiles
ALTER TABLE investor_profiles
DROP CONSTRAINT IF EXISTS investor_profiles_user_id_fkey,
ADD CONSTRAINT investor_profiles_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES users(id)
  ON DELETE CASCADE;

-- Add cascade delete support for investor accounts
ALTER TABLE investor_accounts
DROP CONSTRAINT IF EXISTS investor_accounts_profile_id_fkey,
ADD CONSTRAINT investor_accounts_profile_id_fkey
  FOREIGN KEY (profile_id)
  REFERENCES investor_profiles(id)
  ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_role_lookup ON users(id, role);
CREATE INDEX IF NOT EXISTS idx_users_email_lookup ON users(email);

-- Ensure BIM admin exists
INSERT INTO users (email, password, role, full_name)
VALUES ('admin@bellatrix.com', 'admin123', 'bim_admin', 'BIM Administrator')
ON CONFLICT (email) DO UPDATE 
SET role = 'bim_admin';