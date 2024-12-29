/*
  # Fix Investor Portal Access

  1. New Policies
    - Add policies for investor accounts
    - Add policies for deposit requests
    - Add policies for investor profiles
    
  2. Changes
    - Update existing policies for better access control
    - Add indexes for performance
*/

-- Drop existing policies
DROP POLICY IF EXISTS "investor_accounts_view" ON investor_accounts;
DROP POLICY IF EXISTS "deposit_requests_view" ON deposit_requests;

-- Create policies for investor accounts
CREATE POLICY "investor_accounts_access"
  ON investor_accounts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM investor_profiles ip
      WHERE ip.id = investor_accounts.profile_id
      AND (
        ip.investor_user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM users
          WHERE id = auth.uid()
          AND role = 'bim_admin'
        )
      )
    )
  );

-- Create policies for deposit requests
CREATE POLICY "deposit_requests_access"
  ON deposit_requests FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM investor_profiles ip
      WHERE ip.id = deposit_requests.profile_id
      AND (
        ip.investor_user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM users
          WHERE id = auth.uid()
          AND role = 'bim_admin'
        )
      )
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_investor_accounts_profile_balance 
ON investor_accounts(profile_id, current_balance);

CREATE INDEX IF NOT EXISTS idx_deposit_requests_profile_status 
ON deposit_requests(profile_id, status);