-- Drop existing policies
DROP POLICY IF EXISTS "users_read_policy" ON users;
DROP POLICY IF EXISTS "users_write_policy" ON users;

-- Create new policies for users table
CREATE POLICY "users_select"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "users_insert"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'bim_admin'
    )
  );

CREATE POLICY "users_update"
  ON users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'bim_admin'
    )
    OR id = auth.uid()
  );

CREATE POLICY "users_delete"
  ON users FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'bim_admin'
    )
  );

-- Create policies for investor_profiles table
DROP POLICY IF EXISTS "investor_profiles_access" ON investor_profiles;

CREATE POLICY "investor_profiles_select"
  ON investor_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "investor_profiles_insert"
  ON investor_profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'bim_admin'
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "investor_profiles_update"
  ON investor_profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'bim_admin'
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "investor_profiles_delete"
  ON investor_profiles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'bim_admin'
    )
  );