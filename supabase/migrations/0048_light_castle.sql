-- Drop all existing policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "enable_auth" ON users;
  DROP POLICY IF EXISTS "users_read" ON users;
  DROP POLICY IF EXISTS "users_update_own" ON users;
  DROP POLICY IF EXISTS "bim_admin_all" ON users;
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

-- Create a single policy for authentication
CREATE POLICY "auth_policy"
  ON users
  FOR ALL
  TO public -- Changed to public to allow unauthenticated login queries
  USING (true)
  WITH CHECK (true);

-- Drop and recreate optimized index
DROP INDEX IF EXISTS idx_users_auth_lookup;
CREATE INDEX idx_users_auth_lookup ON users(email, password, role);

-- Ensure admin user exists with correct credentials
DELETE FROM users WHERE email = 'admin@bellatrix.com';
INSERT INTO users (
  email,
  password,
  role,
  full_name,
  created_at
) VALUES (
  'admin@bellatrix.com',
  'admin123',
  'bim_admin',
  'BIM Administrator',
  now()
);