/*
  # Update Transaction Table Relationships

  1. Changes
    - Add indexes for better query performance
    - Update RLS policies for transactions
*/

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_type ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- Drop existing policy
DROP POLICY IF EXISTS "BIM admins can manage transactions" ON transactions;

-- Create new policy with better security
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