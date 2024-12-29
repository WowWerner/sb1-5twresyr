/*
  # Fix RLS Policies for Investor Management
  
  1. Drop existing policies
  2. Create simplified policies that properly handle BIM admin access
  3. Update security definer function
*/

-- Drop existing policies
DROP POLICY IF EXISTS "investor_users_policy" ON investor_users;
DROP POLICY IF EXISTS "investor_profiles_policy" ON investor_profiles;

-- Create function to check BIM admin role
CREATE OR REPLACE FUNCTION check_bim_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'bim_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE investor_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_profiles ENABLE ROW LEVEL SECURITY;

-- Create simplified policies for investor_users
CREATE POLICY "investor_users_select"
  ON investor_users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "investor_users_insert"
  ON investor_users FOR INSERT
  TO authenticated
  WITH CHECK (check_bim_admin());

CREATE POLICY "investor_users_update"
  ON investor_users FOR UPDATE
  TO authenticated
  USING (check_bim_admin());

CREATE POLICY "investor_users_delete"
  ON investor_users FOR DELETE
  TO authenticated
  USING (check_bim_admin());

-- Create simplified policies for investor_profiles
CREATE POLICY "investor_profiles_select"
  ON investor_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "investor_profiles_insert"
  ON investor_profiles FOR INSERT
  TO authenticated
  WITH CHECK (check_bim_admin());

CREATE POLICY "investor_profiles_update"
  ON investor_profiles FOR UPDATE
  TO authenticated
  USING (check_bim_admin());

CREATE POLICY "investor_profiles_delete"
  ON investor_profiles FOR DELETE
  TO authenticated
  USING (check_bim_admin());

-- Update create_investor function to use security definer
CREATE OR REPLACE FUNCTION create_investor(
  p_email text,
  p_password text,
  p_full_name text,
  p_profile jsonb
) RETURNS uuid
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  v_investor_user_id uuid;
BEGIN
  -- Verify caller is BIM admin
  IF NOT check_bim_admin() THEN
    RAISE EXCEPTION 'Only BIM administrators can create investors';
  END IF;

  -- Create investor user
  INSERT INTO investor_users (email, password, full_name, status)
  VALUES (p_email, p_password, p_full_name, 'active')
  RETURNING id INTO v_investor_user_id;

  -- Create investor profile
  INSERT INTO investor_profiles (
    investor_user_id,
    full_name,
    id_number,
    date_of_birth,
    phone_number,
    physical_address,
    postal_address,
    occupation,
    employer,
    source_of_funds,
    risk_appetite,
    status
  )
  VALUES (
    v_investor_user_id,
    p_profile->>'full_name',
    p_profile->>'id_number',
    (p_profile->>'date_of_birth')::date,
    p_profile->>'phone_number',
    p_profile->>'physical_address',
    p_profile->>'postal_address',
    p_profile->>'occupation',
    p_profile->>'employer',
    p_profile->>'source_of_funds',
    p_profile->>'risk_appetite',
    'active'
  );

  RETURN v_investor_user_id;
END;
$$;