/*
  # Add Account Creation for Approved Deposits

  1. New Functions
    - Function to generate account name from investor name
    - Function to handle deposit approval and account creation
    
  2. Changes
    - Add trigger for deposit request approval
*/

-- Function to generate account name
CREATE OR REPLACE FUNCTION generate_account_name(investor_name text)
RETURNS text AS $$
DECLARE
  base_name text;
  next_number integer;
  final_name text;
BEGIN
  -- Take first 3 letters of each word, uppercase
  base_name := regexp_replace(
    regexp_replace(
      upper(investor_name),
      '(\w{3})\w*\s*',
      '\1_',
      'g'
    ),
    '_+$',
    ''
  );
  
  -- Find the next available number
  SELECT COALESCE(
    MAX(CAST(
      regexp_replace(account_name, '^' || base_name || '_(\d+)$', '\1') AS integer
    )) + 1,
    1
  )
  INTO next_number
  FROM investor_accounts
  WHERE account_name ~ ('^' || base_name || '_\d+$');
  
  final_name := base_name || '_' || LPAD(next_number::text, 2, '0');
  RETURN final_name;
END;
$$ LANGUAGE plpgsql;

-- Function to handle deposit approval
CREATE OR REPLACE FUNCTION handle_deposit_approval()
RETURNS TRIGGER AS $$
DECLARE
  v_profile_id uuid;
  v_investor_name text;
  v_account_name text;
BEGIN
  -- Only proceed if status changed to approved
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Get profile info
    SELECT id, full_name INTO v_profile_id, v_investor_name
    FROM investor_profiles
    WHERE id = NEW.profile_id;
    
    -- Generate account name
    v_account_name := generate_account_name(v_investor_name);
    
    -- Create investment account
    INSERT INTO investor_accounts (
      profile_id,
      account_name,
      account_number,
      total_invested,
      total_withdrawn,
      current_balance,
      total_realised_interest
    ) VALUES (
      v_profile_id,
      v_account_name,
      'ACC_' || substring(md5(random()::text), 1, 8),
      NEW.amount,
      0,
      NEW.amount,
      0
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for deposit approval
DROP TRIGGER IF EXISTS deposit_approval_trigger ON deposit_requests;
CREATE TRIGGER deposit_approval_trigger
  AFTER UPDATE OF status ON deposit_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_deposit_approval();