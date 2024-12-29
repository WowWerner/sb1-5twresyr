-- Drop existing policies if any
DROP POLICY IF EXISTS "deposit_requests_view" ON deposit_requests;
DROP POLICY IF EXISTS "deposit_requests_create" ON deposit_requests;
DROP POLICY IF EXISTS "deposit_requests_policy" ON deposit_requests;

-- Enable RLS
ALTER TABLE deposit_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for deposit requests
CREATE POLICY "deposit_requests_select"
  ON deposit_requests FOR SELECT
  TO authenticated
  USING (
    -- Allow investors to view their own requests
    EXISTS (
      SELECT 1 FROM investor_profiles ip
      WHERE ip.id = deposit_requests.profile_id
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

CREATE POLICY "deposit_requests_insert"
  ON deposit_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow investors to create requests for their own profile
    EXISTS (
      SELECT 1 FROM investor_profiles ip
      WHERE ip.id = profile_id
      AND ip.investor_user_id = auth.uid()
    )
  );

CREATE POLICY "deposit_requests_update"
  ON deposit_requests FOR UPDATE
  TO authenticated
  USING (
    -- Only BIM admins can update deposit requests
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'bim_admin'
    )
  );

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_deposit_requests_profile_status 
ON deposit_requests(profile_id, status);