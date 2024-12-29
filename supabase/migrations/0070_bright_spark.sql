/*
  # Fix Withdrawal Requests Visibility

  1. Create withdrawal notifications table
  2. Set up RLS policies
  3. Create automatic notification trigger
*/

-- Create withdrawal notifications table
CREATE TABLE IF NOT EXISTS withdrawal_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  withdrawal_id uuid REFERENCES withdrawal_requests(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'processed')),
  reviewed_by uuid REFERENCES users(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE withdrawal_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for withdrawal notifications
CREATE POLICY "bim_admin_withdrawal_notifications_access"
  ON withdrawal_notifications
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'bim_admin'
    )
  );

-- Create policies for withdrawal requests
CREATE POLICY "withdrawal_requests_select"
  ON withdrawal_requests FOR SELECT
  TO authenticated
  USING (
    -- Allow investors to view their own requests
    EXISTS (
      SELECT 1 FROM investor_profiles ip
      WHERE ip.id = withdrawal_requests.profile_id
      AND ip.investor_user_id = auth.uid()
    )
    OR
    -- Allow BIM admins to view all requests
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'bim_admin'
    )
  );

CREATE POLICY "withdrawal_requests_insert"
  ON withdrawal_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow investors to create requests for their own profile
    EXISTS (
      SELECT 1 FROM investor_profiles ip
      WHERE ip.id = profile_id
      AND ip.investor_user_id = auth.uid()
    )
  );

CREATE POLICY "withdrawal_requests_update"
  ON withdrawal_requests FOR UPDATE
  TO authenticated
  USING (
    -- Only BIM admins can update withdrawal requests
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'bim_admin'
    )
  );

-- Create trigger to automatically create notifications
CREATE OR REPLACE FUNCTION create_withdrawal_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO withdrawal_notifications (withdrawal_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER withdrawal_request_notification
  AFTER INSERT ON withdrawal_requests
  FOR EACH ROW
  EXECUTE FUNCTION create_withdrawal_notification();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_profile_status 
ON withdrawal_requests(profile_id, status);

CREATE INDEX IF NOT EXISTS idx_withdrawal_notifications_status 
ON withdrawal_notifications(status);