/*
  # Update BIM Admin Investor Management Policies

  1. Security Updates
    - Add policies for BIM admins to manage investor users
    - Add policies for creating investor profiles and accounts
    
  2. Changes
    - Add policies for BIM admin to create and manage investor users
    - Ensure proper access control for investor management
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "BIM admins can create users" ON users;
DROP POLICY IF EXISTS "BIM admins can manage investor profiles" ON investor_profiles;
DROP POLICY IF EXISTS "BIM admins can manage investor accounts" ON investor_accounts;

-- Create policy for BIM admins to create and manage users
CREATE POLICY "BIM admins can create users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'bim_admin'
    )
  );

-- Update policy for investor profiles management
CREATE POLICY "BIM admins can manage investor profiles"
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

-- Update policy for investor accounts management
CREATE POLICY "BIM admins can manage investor accounts"
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