-- Drop existing policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "users_read" ON users;
  DROP POLICY IF EXISTS "users_update_own" ON users;
  DROP POLICY IF EXISTS "bim_admin_all" ON users;
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

-- Create single simplified policy for authentication
CREATE POLICY "enable_auth"
  ON users FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Recreate admin user with correct credentials
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