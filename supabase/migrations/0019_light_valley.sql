/*
  # Fix RLS Policies and User Management

  1. Changes
    - Drop conflicting policies
    - Create new unified policies
    - Add missing indexes
    - Fix user management permissions
    
  2. Security
    - Maintain proper access control
    - Ensure data integrity
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "users_read_all_2023" ON users;
DROP POLICY IF EXISTS "bim_admin_manage_users_2023" ON users;
DROP POLICY IF EXISTS "users_update_own_login_2023" ON users;
DROP POLICY IF EXISTS "investor_view_own_profile_2023" ON investor_profiles;
DROP POLICY IF EXISTS "bim_admin_manage_profiles_2023" ON investor_profiles;
DROP POLICY IF EXISTS "investor_view_own_accounts_2023" ON investor_accounts;
DROP POLICY IF EXISTS "bim_admin_manage_accounts_2023" ON investor_accounts;
DROP POLICY IF EXISTS "investor_manage_deposits_2023" ON deposit_requests;
DROP POLICY IF EXISTS "investor_manage_withdrawals_2023" ON withdrawal_requests;

-- Create unified policies for users table
CREATE POLICY "users_public_read"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "users_manage_own"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "bim_admin_manage_all"
  ON users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'bim_admin'
    )
  );

-- Create policies for investor profiles
CREATE POLICY "investor_profiles_access"
  ON investor_profiles FOR ALL
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'bim_admin'
    )
  );

-- Create policies for investor accounts
CREATE POLICY "investor_accounts_access"
  ON investor_accounts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM investor_profiles ip
      WHERE ip.id = profile_id
      AND (
        ip.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM users u
          WHERE u.id = auth.uid()
          AND u.role = 'bim_admin'
        )
      )
    )
  );

-- Create policies for deposit requests
CREATE POLICY "deposit_requests_access"
  ON deposit_requests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM investor_profiles ip
      WHERE ip.id = profile_id
      AND (
        ip.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM users u
          WHERE u.id = auth.uid()
          AND u.role = 'bim_admin'
        )
      )
    )
  );

-- Create policies for withdrawal requests
CREATE POLICY "withdrawal_requests_access"
  ON withdrawal_requests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM investor_profiles ip
      WHERE ip.id = profile_id
      AND (
        ip.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM users u
          WHERE u.id = auth.uid()
          AND u.role = 'bim_admin'
        )
      )
    )
  );

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_investor_profiles_user_id ON investor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_investor_accounts_profile_id ON investor_accounts(profile_id);
CREATE INDEX IF NOT EXISTS idx_deposit_requests_profile_id ON deposit_requests(profile_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_profile_id ON withdrawal_requests(profile_id);

-- Ensure BIM admin user exists
INSERT INTO users (email, password, role, full_name)
VALUES ('admin@bellatrix.com', 'admin123', 'bim_admin', 'BIM Administrator')
ON CONFLICT (email) DO NOTHING;