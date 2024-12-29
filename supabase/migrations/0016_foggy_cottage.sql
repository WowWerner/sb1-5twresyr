/*
  # Update Payment Officer and IC Policies

  1. Changes
    - Drop existing policies to avoid conflicts
    - Recreate policies with proper access controls
    - Add validation function for RFF status updates
    
  2. Security
    - Payment Officer policies for notifications and proofs
    - IC policies for RFF application management
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "po_view_notifications" ON payment_notifications;
DROP POLICY IF EXISTS "po_update_notifications" ON payment_notifications;
DROP POLICY IF EXISTS "po_manage_proofs" ON payment_proofs;
DROP POLICY IF EXISTS "po_view_transactions" ON transactions;
DROP POLICY IF EXISTS "ic_view_applications" ON rff_applications;
DROP POLICY IF EXISTS "ic_update_applications" ON rff_applications;

-- Create policies for payment officer access
CREATE POLICY "po_view_notifications_new"
  ON payment_notifications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'payment_officer'
    )
  );

CREATE POLICY "po_update_notifications_new"
  ON payment_notifications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'payment_officer'
    )
  );

CREATE POLICY "po_manage_proofs_new"
  ON payment_proofs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'payment_officer'
    )
  );

CREATE POLICY "po_view_transactions_new"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'payment_officer'
    )
  );

-- Create policies for IC access
CREATE POLICY "ic_view_applications_new"
  ON rff_applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'ic'
    )
  );

CREATE POLICY "ic_update_applications_new"
  ON rff_applications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'ic'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'ic'
    )
  );

-- Create function to validate RFF status updates
CREATE OR REPLACE FUNCTION check_rff_status_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow status changes from pending to approved/declined
  IF NEW.approval_status NOT IN ('approved', 'declined') THEN
    RAISE EXCEPTION 'Invalid status. Can only update to approved or declined.';
  END IF;
  
  IF TG_OP = 'UPDATE' AND NEW.approval_status != OLD.approval_status THEN
    IF OLD.approval_status != 'pending' THEN
      RAISE EXCEPTION 'Can only update status of pending applications.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for RFF status validation
DROP TRIGGER IF EXISTS validate_rff_status ON rff_applications;
CREATE TRIGGER validate_rff_status
  BEFORE UPDATE OF approval_status ON rff_applications
  FOR EACH ROW
  EXECUTE FUNCTION check_rff_status_update();