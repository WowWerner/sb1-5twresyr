/*
  # Fix Investor Profiles Schema

  1. Changes
    - Make user_id nullable to support transition
    - Ensure investor_user_id is properly constrained
    - Add migration function to handle existing data
*/

-- First make user_id nullable
ALTER TABLE investor_profiles 
  ALTER COLUMN user_id DROP NOT NULL;

-- Ensure investor_user_id is set up correctly
DO $$ BEGIN
  -- Add column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'investor_profiles' 
    AND column_name = 'investor_user_id'
  ) THEN
    ALTER TABLE investor_profiles 
    ADD COLUMN investor_user_id uuid REFERENCES investor_users(id);
  END IF;
END $$;

-- Create function to handle investor creation
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
  -- Create investor user
  INSERT INTO investor_users (
    email,
    password,
    full_name,
    status
  )
  VALUES (
    p_email,
    p_password,
    p_full_name,
    'active'
  )
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