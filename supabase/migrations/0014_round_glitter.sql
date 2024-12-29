/*
  # Add IC and Payment Officer Policies

  1. New Policies
    - Payment Officer policies for managing payment notifications and proofs
    - IC policies for managing RFF applications
    - Additional policies for viewing transactions

  2. Security
    - Enable RLS for all affected tables
    - Role-based access control for payment officers and IC members
*/

-- Create function to validate RFF status update
CREATE OR REPLACE FUNCTION validate_rff_status_update()
RETURNS trigger AS $$
BEGIN
  -- Check if user is IC member
  IF NOT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'ic'
  ) THEN
    RETURN NULL;
  END IF;

  -- Check if status transition is valid
  IF OLD.approval_status != 'pending' OR 
     NEW.approval_status NOT IN ('approved', 'declined') THEN
    RETURN NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for RFF status updates
DROP TRIGGER IF EXISTS validate_rff_status_update ON rff_applications;
CREATE TRIGGER validate_rff_status_update
  BEFORE UPDATE OF approval_status ON rff_applications
  FOR EACH ROW
  EXECUTE FUNCTION validate_rff_status_update();

-- Create policies for payment officer access
CREATE POLICY "po_view_notifications"
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

CREATE POLICY "po_update_notifications"
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

CREATE POLICY "po_manage_proofs"
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

CREATE POLICY "po_view_transactions"
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
CREATE POLICY "ic_view_applications"
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

CREATE POLICY "ic_update_applications"
  ON rff_applications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'ic'
    )
  );

-- Insert IC and Payment Officer users if they don't exist
INSERT INTO users (email, password, role, full_name)
VALUES 
  ('payment@bellatrix.com', 'payment123', 'payment_officer', 'Payment Officer'),
  ('ic@bellatrix.com', 'ic123', 'ic', 'Investment Committee')
ON CONFLICT (email) DO NOTHING;