/*
  # Create Test Investor Data
  
  1. Create investor profile for test investor
  2. Create test investment account
*/

DO $$ 
DECLARE
  investor_user_id uuid;
  investor_profile_id uuid;
BEGIN
  -- Get the investor user ID
  SELECT id INTO investor_user_id
  FROM users 
  WHERE email = 'investor@bellatrix.com';

  -- Only proceed if we found the user
  IF investor_user_id IS NOT NULL THEN
    -- First check if profile already exists
    SELECT id INTO investor_profile_id
    FROM investor_profiles
    WHERE user_id = investor_user_id;
    
    -- Create profile only if it doesn't exist
    IF investor_profile_id IS NULL THEN
      INSERT INTO investor_profiles (
        user_id,
        full_name,
        id_number,
        date_of_birth,
        phone_number,
        physical_address,
        postal_address,
        occupation,
        employer,
        source_of_funds,
        risk_appetite
      )
      VALUES (
        investor_user_id,
        'Test Investor',
        'INV_' || substring(md5(random()::text), 1, 8),
        '1990-01-01',
        '+264 81 123 4567',
        '123 Test Street, Windhoek',
        'P.O. Box 1234, Windhoek',
        'Software Developer',
        'Tech Company',
        'Employment Income',
        'medium'
      )
      RETURNING id INTO investor_profile_id;
    END IF;

    -- Create test investment account if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM investor_accounts 
      WHERE profile_id = investor_profile_id
    ) THEN
      INSERT INTO investor_accounts (
        profile_id,
        account_name,
        account_number,
        total_invested,
        total_withdrawn,
        current_balance,
        total_realised_interest
      )
      VALUES (
        investor_profile_id,
        'Test Investment Account',
        'ACC_' || substring(md5(random()::text), 1, 8),
        100000.00,
        0.00,
        105000.00,
        5.00
      );
    END IF;
  END IF;
END $$;