/*
  # Initial Schema Setup for Bellatrix Investment Managers

  1. New Tables
    - `users`
      - Stores user information and role-based access
    - `rff_applications`
      - Stores Request for Funds (RFF) applications
    
  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access
*/

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('bsf', 'bim_admin', 'payment_officer', 'ic', 'investor');

-- Create enum for RFF priority levels
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high');

-- Create enum for RFF approval status
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'declined');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  role user_role NOT NULL,
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz
);

-- Create RFF applications table
CREATE TABLE IF NOT EXISTS rff_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rff_number text UNIQUE NOT NULL,
  client_name text NOT NULL,
  client_contact text NOT NULL,
  loan_facility_number text NOT NULL,
  loan_amount decimal(15,2) NOT NULL,
  interest_rate decimal(5,2) NOT NULL,
  bim_interest decimal(5,2) NOT NULL,
  bsf_interest decimal(5,2) NOT NULL,
  settlement_date date NOT NULL,
  off_taker text NOT NULL,
  off_taker_sector text NOT NULL,
  priority priority_level NOT NULL,
  submitted_by uuid REFERENCES users(id) NOT NULL,
  approval_status approval_status DEFAULT 'pending',
  is_funded boolean DEFAULT false,
  is_settled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create function to generate RFF number
CREATE OR REPLACE FUNCTION generate_rff_number()
RETURNS trigger AS $$
DECLARE
  next_number integer;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(rff_number FROM 'RFF_(\d+)') AS integer)), 0) + 1
  INTO next_number
  FROM rff_applications;
  
  NEW.rff_number := 'RFF_' || LPAD(next_number::text, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for RFF number generation
CREATE TRIGGER set_rff_number
  BEFORE INSERT ON rff_applications
  FOR EACH ROW
  EXECUTE FUNCTION generate_rff_number();

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rff_applications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "BSF users can create RFF applications"
  ON rff_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'bsf'
    )
  );

CREATE POLICY "BSF users can view own RFF applications"
  ON rff_applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'bsf'
    )
    AND submitted_by = auth.uid()
  );

-- Insert dummy users
INSERT INTO users (email, password, role, full_name) VALUES
('bsf@bellatrix.com', 'bsf123', 'bsf', 'BSF User'),
('bim@bellatrix.com', 'bim123', 'bim_admin', 'BIM Admin'),
('payment@bellatrix.com', 'payment123', 'payment_officer', 'Payment Officer'),
('ic@bellatrix.com', 'ic123', 'ic', 'Investment Committee'),
('investor@bellatrix.com', 'investor123', 'investor', 'Investor');