/*
  # Add Deposit Request Notifications

  1. New Tables
    - `deposit_notifications` - Stores notifications for BIM admins about new deposit requests
    
  2. Security
    - Enable RLS
    - Add policies for BIM admin access
*/

-- Create deposit notifications table
CREATE TABLE IF NOT EXISTS deposit_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deposit_request_id uuid REFERENCES deposit_requests(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'processed')),
  reviewed_by uuid REFERENCES users(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE deposit_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for BIM admin access
CREATE POLICY "bim_admin_deposit_notifications_access"
  ON deposit_notifications
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'bim_admin'
    )
  );

-- Create trigger to automatically create notifications
CREATE OR REPLACE FUNCTION create_deposit_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO deposit_notifications (deposit_request_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER deposit_request_notification
  AFTER INSERT ON deposit_requests
  FOR EACH ROW
  EXECUTE FUNCTION create_deposit_notification();