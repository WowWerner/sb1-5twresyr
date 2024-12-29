-- Drop existing policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "allow_all_authenticated" ON users;
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

-- Create separate policies for different operations
CREATE POLICY "users_read"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "bim_admin_all"
  ON users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'bim_admin'
    )
  );

-- Recreate index for better query performance
DROP INDEX IF EXISTS idx_users_auth;
CREATE INDEX idx_users_auth_lookup 
ON users(email, password, role);

-- Ensure admin user exists
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