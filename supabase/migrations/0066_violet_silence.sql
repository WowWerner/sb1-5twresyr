/*
  # Update policies to use investor_user_id
  
  1. Changes
    - Update all policies to reference investor_user_id instead of user_id
    - Drop old policies that reference user_id
    - Create new policies using investor_user_id
  
  2. Notes
    - Ensures consistent use of investor_user_id across all policies
    - Maintains same security model but uses correct foreign key relationships
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Investors can view own deposit requests" ON deposit_requests;
DROP POLICY IF EXISTS "Investors can create deposit requests" ON deposit_requests;
DROP POLICY IF EXISTS "Investors can view own account interest" ON account_interest;
DROP POLICY IF EXISTS "Investors can view own withdrawal requests" ON withdrawal_requests;
DROP POLICY IF EXISTS "Investors can create withdrawal requests" ON withdrawal_requests;
DROP POLICY IF EXISTS "investor_accounts_access" ON investor_accounts;
DROP POLICY IF EXISTS "deposit_requests_access" ON deposit_requests;
DROP POLICY IF EXISTS "withdrawal_requests_access" ON withdrawal_requests;

-- Create updated policies for deposit requests
CREATE POLICY "deposit_requests_view"
  ON deposit_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM investor_profiles ip
      WHERE ip.id = deposit_requests.profile_id
      AND ip.investor_user_id = auth.uid()
    )
  );

CREATE POLICY "deposit_requests_create"
  ON deposit_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM investor_profiles ip
      WHERE ip.id = deposit_requests.profile_id
      AND ip.investor_user_id = auth.uid()
    )
  );

-- Create updated policy for account interest
CREATE POLICY "account_interest_view"
  ON account_interest
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM investor_accounts ia
      JOIN investor_profiles ip ON ip.id = ia.profile_id
      WHERE ia.id = account_interest.account_id
      AND ip.investor_user_id = auth.uid()
    )
  );

-- Create updated policies for withdrawal requests
CREATE POLICY "withdrawal_requests_view"
  ON withdrawal_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM investor_profiles ip
      WHERE ip.id = withdrawal_requests.profile_id
      AND ip.investor_user_id = auth.uid()
    )
  );

CREATE POLICY "withdrawal_requests_create"
  ON withdrawal_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM investor_profiles ip
      WHERE ip.id = withdrawal_requests.profile_id
      AND ip.investor_user_id = auth.uid()
    )
  );

-- Create updated policy for investor accounts
CREATE POLICY "investor_accounts_access"
  ON investor_accounts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM investor_profiles ip
      WHERE ip.id = investor_accounts.profile_id
      AND ip.investor_user_id = auth.uid()
    )
  );