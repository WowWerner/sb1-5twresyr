/*
  # Fix Users Table RLS Policies
  
  1. Changes
    - Remove recursive policies that were causing infinite recursion
    - Simplify user access policies
    - Add proper authentication checks
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "users_public_read" ON users;
DROP POLICY IF EXISTS "users_manage_own" ON users;
DROP POLICY IF EXISTS "bim_admin_manage_all" ON users;

-- Create new simplified policies
CREATE POLICY "allow_read_users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "allow_update_own_user"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "allow_bim_admin_full_access"
  ON users FOR ALL 
  TO authenticated
  USING (
    role = 'bim_admin'
  );