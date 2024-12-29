/*
  # Add Management and Performance Fee Tables

  1. New Tables
    - `management_fees`
      - Stores monthly management fee records
    - `performance_fees`
      - Stores performance fee records for over-performing accounts

  2. Security
    - Enable RLS on new tables
    - Add policies for BIM admin access
*/

-- Create management fees table
CREATE TABLE management_fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES investor_accounts(id) NOT NULL,
  amount decimal(15,2) NOT NULL,
  fee_amount decimal(15,2) NOT NULL,
  month text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create performance fees table
CREATE TABLE performance_fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES investor_accounts(id) NOT NULL,
  amount decimal(15,2) NOT NULL,
  over_performance_percentage decimal(5,2) NOT NULL,
  account_balance decimal(15,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE management_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_fees ENABLE ROW LEVEL SECURITY;

-- Create policies for BIM admin access
CREATE POLICY "BIM admins can manage management fees"
  ON management_fees
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'bim_admin'
    )
  );

CREATE POLICY "BIM admins can manage performance fees"
  ON performance_fees
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'bim_admin'
    )
  );

-- Add total_realised_interest column to investor_accounts
ALTER TABLE investor_accounts 
ADD COLUMN IF NOT EXISTS total_realised_interest decimal(5,2) DEFAULT 0;