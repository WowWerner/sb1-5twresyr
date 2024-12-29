/*
  # Add Withdrawal Requests Schema

  1. New Tables
    - `withdrawal_requests`
      - Stores withdrawal requests from investors
      - Includes urgency levels and status tracking
      - Generates withdrawal IDs for approved requests

  2. Security
    - Enable RLS
    - Add policies for investor access
*/

-- Create withdrawal requests table
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  withdrawal_id text UNIQUE,
  profile_id uuid REFERENCES investor_profiles(id) NOT NULL,
  account_id uuid REFERENCES investor_accounts(id) NOT NULL,
  amount decimal(15,2) NOT NULL,
  urgency_level text NOT NULL CHECK (urgency_level IN ('not_urgent', 'urgent', 'very_urgent')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined', 'processing', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create function to generate withdrawal ID
CREATE OR REPLACE FUNCTION generate_withdrawal_id()
RETURNS trigger AS $$
DECLARE
  investor_name text;
  next_number integer;
BEGIN
  -- Get first three letters of investor name
  SELECT SUBSTRING(full_name FROM 1 FOR 3) INTO investor_name
  FROM investor_profiles
  WHERE id = NEW.profile_id;
  
  -- Get next sequential number
  SELECT COALESCE(MAX(CAST(SUBSTRING(withdrawal_id FROM 'WTHDRW_[A-Z]{3}(\d+)') AS integer)), 0) + 1
  INTO next_number
  FROM withdrawal_requests
  WHERE withdrawal_id LIKE 'WTHDRW_' || UPPER(investor_name) || '%';
  
  NEW.withdrawal_id := 'WTHDRW_' || UPPER(investor_name) || next_number;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for withdrawal ID generation
CREATE TRIGGER set_withdrawal_id
  BEFORE INSERT ON withdrawal_requests
  FOR EACH ROW
  WHEN (NEW.status = 'approved')
  EXECUTE FUNCTION generate_withdrawal_id();

-- Enable RLS
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for investor access
CREATE POLICY "Investors can view own withdrawal requests"
  ON withdrawal_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM investor_profiles ip
      WHERE ip.id = withdrawal_requests.profile_id
      AND ip.user_id = auth.uid()
    )
  );

CREATE POLICY "Investors can create withdrawal requests"
  ON withdrawal_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM investor_profiles ip
      WHERE ip.id = withdrawal_requests.profile_id
      AND ip.user_id = auth.uid()
    )
  );