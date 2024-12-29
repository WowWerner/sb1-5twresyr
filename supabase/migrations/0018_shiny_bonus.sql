/*
  # Fix RLS Policies

  1. Changes
    - Drop existing policies
    - Create new policies with unique names
    - Update user management permissions
    
  2. Security
    - Maintain proper access control
    - Ensure data integrity
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access to users" ON users;
DROP POLICY IF EXISTS "Allow last_login updates" ON users;
DROP POLICY IF EXISTS "BIM admins can create users" ON users;
DROP POLICY IF EXISTS "BIM admins can manage users" ON users;
DROP POLICY IF EXISTS "Users can read all users" ON users;
DROP POLICY IF EXISTS "Users can update their own last_login" ON users;

-- Create new policies for users table
CREATE POLICY "users_read_all_2023"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "bim_admin_manage_users_2023"
  ON users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'bim_admin'
    )
  );

CREATE POLICY "users_update_own_login_2023"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Drop and recreate investor profile policies
DROP POLICY IF EXISTS "Investors can view own profile" ON investor_profiles;
DROP POLICY IF EXISTS "BIM admins can manage investor profiles" ON investor_profiles;

CREATE POLICY "investor_view_own_profile_2023"
  ON investor_profiles
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'bim_admin'
    )
  );

CREATE POLICY "bim_admin_manage_profiles_2023"
  ON investor_profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'bim_admin'
    )
  );

-- Drop and recreate investor account policies
DROP POLICY IF EXISTS "Investors can view own accounts" ON investor_accounts;
DROP POLICY IF EXISTS "BIM admins can manage investor accounts" ON investor_accounts;

CREATE POLICY "investor_view_own_accounts_2023"
  ON investor_accounts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM investor_profiles ip
      WHERE ip.id = profile_id
      AND ip.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'bim_admin'
    )
  );

CREATE POLICY "bim_admin_manage_accounts_2023"
  ON investor_accounts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'bim_admin'
    )
  );

-- Drop and recreate deposit request policies
DROP POLICY IF EXISTS "Investors can manage own deposit requests" ON deposit_requests;

CREATE POLICY "investor_manage_deposits_2023"
  ON deposit_requests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM investor_profiles ip
      WHERE ip.id = profile_id
      AND ip.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'bim_admin'
    )
  );

-- Drop and recreate withdrawal request policies
DROP POLICY IF EXISTS "Investors can manage own withdrawal requests" ON withdrawal_requests;

CREATE POLICY "investor_manage_withdrawals_2023"
  ON withdrawal_requests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM investor_profiles ip
      WHERE ip.id = profile_id
      AND ip.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'bim_admin'
    )
  );