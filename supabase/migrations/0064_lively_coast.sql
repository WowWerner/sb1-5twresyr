-- Create policies for investor_users authentication
CREATE POLICY "investor_users_auth"
  ON investor_users FOR SELECT
  USING (true);

CREATE POLICY "investor_users_update_login"
  ON investor_users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Create index for investor login performance
CREATE INDEX IF NOT EXISTS idx_investor_users_auth 
ON investor_users(email, password, status);

-- Ensure RLS is enabled
ALTER TABLE investor_users ENABLE ROW LEVEL SECURITY;