-- Drop existing problematic policies
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;
DROP POLICY IF EXISTS "authenticate_users" ON users;

-- Create comprehensive policies for users table
CREATE POLICY "allow_public_read_users"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "allow_bim_admin_manage_users"
  ON users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'bim_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'bim_admin'
    )
  );

-- Create function to check if user is BIM admin
CREATE OR REPLACE FUNCTION is_bim_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'bim_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;