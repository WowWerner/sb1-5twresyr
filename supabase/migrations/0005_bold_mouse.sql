/*
  # Add Investor Management Tables

  1. New Tables
    - `investor_profiles`
      - Stores KYC information for investors
    - `investor_accounts`
      - Stores individual investment accounts under investor profiles
    - `funding_requests`
      - Tracks investor funding requests
    - `transactions`
      - Records all funding and withdrawal transactions

  2. Security
    - Enable RLS on all tables
    - Add policies for BIM admin access
*/

-- Create investor profiles table
CREATE TABLE investor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  full_name text NOT NULL,
  id_number text UNIQUE NOT NULL,
  date_of_birth date NOT NULL,
  phone_number text NOT NULL,
  physical_address text NOT NULL,
  postal_address text,
  occupation text NOT NULL,
  employer text,
  source_of_funds text NOT NULL,
  risk_appetite text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create investor accounts table
CREATE TABLE investor_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES investor_profiles(id) NOT NULL,
  account_name text NOT NULL,
  account_number text UNIQUE NOT NULL,
  total_invested decimal(15,2) DEFAULT 0,
  total_withdrawn decimal(15,2) DEFAULT 0,
  current_balance decimal(15,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create funding requests table
CREATE TABLE funding_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES investor_profiles(id) NOT NULL,
  amount decimal(15,2) NOT NULL,
  status text DEFAULT 'pending',
  validated_at timestamptz,
  validated_by uuid REFERENCES users(id),
  transaction_id text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES investor_accounts(id) NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('funding', 'withdrawal')),
  amount decimal(15,2) NOT NULL,
  transaction_id text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Function to generate transaction ID
CREATE OR REPLACE FUNCTION generate_transaction_id()
RETURNS trigger AS $$
DECLARE
  next_number integer;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_id FROM 'TRNS_INVST_(\d+)') AS integer)), 0) + 1
  INTO next_number
  FROM transactions;
  
  NEW.transaction_id := 'TRNS_INVST_' || LPAD(next_number::text, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for transaction ID generation
CREATE TRIGGER set_transaction_id
  BEFORE INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION generate_transaction_id();

-- Enable RLS
ALTER TABLE investor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE funding_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for BIM admin access
CREATE POLICY "BIM admins can manage investor profiles"
  ON investor_profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'bim_admin'
    )
  );

CREATE POLICY "BIM admins can manage investor accounts"
  ON investor_accounts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'bim_admin'
    )
  );

CREATE POLICY "BIM admins can manage funding requests"
  ON funding_requests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'bim_admin'
    )
  );

CREATE POLICY "BIM admins can manage transactions"
  ON transactions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'bim_admin'
    )
  );