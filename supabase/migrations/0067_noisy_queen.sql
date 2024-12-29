-- Enable RLS for deposit_requests if not already enabled
ALTER TABLE deposit_requests ENABLE ROW LEVEL SECURITY;

-- Ensure deposit_requests table exists with correct structure
CREATE TABLE IF NOT EXISTS deposit_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES investor_profiles(id) NOT NULL,
  amount decimal(15,2) NOT NULL,
  source_of_funds text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_deposit_requests_profile ON deposit_requests(profile_id);

-- Drop any existing policies
DROP POLICY IF EXISTS "deposit_requests_view" ON deposit_requests;
DROP POLICY IF EXISTS "deposit_requests_create" ON deposit_requests;

-- Create policies for deposit requests
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