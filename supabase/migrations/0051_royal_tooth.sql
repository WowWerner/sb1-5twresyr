-- Drop existing policies
DROP POLICY IF EXISTS "allow_bim_admin_all_investor_users" ON investor_users;
DROP POLICY IF EXISTS "allow_investor_read_own" ON investor_users;
DROP POLICY IF EXISTS "allow_bim_admin_all_investor_profiles" ON investor_profiles;

-- Create simplified policies for investor_users
CREATE POLICY "investor_users_access"
  ON investor_users FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create simplified policies for investor_profiles
CREATE POLICY "investor_profiles_access"
  ON investor_profiles FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add status column to investor_profiles if not exists
ALTER TABLE investor_profiles
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- Create function to handle investor creation
CREATE OR REPLACE FUNCTION create_investor(
  p_email text,
  p_password text,
  p_full_name text,
  p_profile jsonb
) RETURNS uuid AS $$
DECLARE
  v_investor_user_id uuid;
BEGIN
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
$$ LANGUAGE plpgsql;