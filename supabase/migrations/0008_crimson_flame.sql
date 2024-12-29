/*
  # Investor Dashboard Tables

  1. New Tables
    - `deposit_requests`
      - Stores investor deposit requests
    - `account_interest`
      - Tracks realized interest per account
    
  2. Security
    - Enable RLS on all tables
    - Add policies for investor access
*/

-- Create deposit requests table
CREATE TABLE IF NOT EXISTS deposit_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES investor_profiles(id) NOT NULL,
  amount decimal(15,2) NOT NULL,
  source_of_funds text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create account interest table
CREATE TABLE IF NOT EXISTS account_interest (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES investor_accounts(id) NOT NULL,
  interest_amount decimal(15,2) NOT NULL,
  interest_rate decimal(5,2) NOT NULL,
  date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE deposit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_interest ENABLE ROW LEVEL SECURITY;

-- Create policies for investor access
CREATE POLICY "Investors can view own deposit requests"
  ON deposit_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM investor_profiles ip
      WHERE ip.id = deposit_requests.profile_id
      AND ip.user_id = auth.uid()
    )
  );

CREATE POLICY "Investors can create deposit requests"
  ON deposit_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM investor_profiles ip
      WHERE ip.id = deposit_requests.profile_id
      AND ip.user_id = auth.uid()
    )
  );

CREATE POLICY "Investors can view own account interest"
  ON account_interest
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM investor_accounts ia
      JOIN investor_profiles ip ON ip.id = ia.profile_id
      WHERE ia.id = account_interest.account_id
      AND ip.user_id = auth.uid()
    )
  );