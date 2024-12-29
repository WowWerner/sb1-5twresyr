/*
  # Setup Auth Users and Policies
  
  1. Changes
    - Create auth-related policies
    - Update user management policies
    - Add function to handle user authentication
*/

-- Create function to check user role
CREATE OR REPLACE FUNCTION check_user_role(checking_role user_role)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = checking_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;

-- Create new policies
CREATE POLICY "allow_user_select"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "allow_user_update"
  ON users FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid() OR
    check_user_role('bim_admin')
  );

CREATE POLICY "allow_user_insert"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    check_user_role('bim_admin')
  );

CREATE POLICY "allow_user_delete"
  ON users FOR DELETE
  TO authenticated
  USING (
    check_user_role('bim_admin')
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email_role ON users(email, role);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Ensure all existing users have proper role-based access
UPDATE users 
SET role = CASE 
  WHEN email LIKE '%admin%' THEN 'bim_admin'
  WHEN email LIKE '%bsf%' THEN 'bsf'
  WHEN email LIKE '%payment%' THEN 'payment_officer'
  WHEN email LIKE '%ic%' THEN 'ic'
  WHEN email LIKE '%investor%' THEN 'investor'
  ELSE role
END
WHERE role IS NULL;