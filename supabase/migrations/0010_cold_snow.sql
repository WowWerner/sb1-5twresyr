/*
  # Add RFF Relationship to Transactions

  1. Changes
    - Add rff_id column to transactions table to link with RFF applications
    - Drop existing policy if it exists to avoid conflicts
    - Create updated policy for BIM admin access

  2. Security
    - Ensure RLS is enabled
    - Update BIM admin access policy
*/

-- Add RFF relationship to transactions
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS rff_id uuid REFERENCES rff_applications(id);

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "BIM admins can manage transactions" ON transactions;

-- Create updated policy for BIM admin access
CREATE POLICY "BIM admins can manage transactions"
  ON transactions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'bim_admin'
    )
  );