/*
  # Fix Users Table and Policies

  1. Changes
    - Drop and recreate users table with proper structure
    - Update RLS policies for better security
    - Ensure dummy users are properly inserted

  2. Security
    - Enable RLS
    - Add policies for proper authentication
*/

-- Recreate users table
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  role user_role NOT NULL,
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable update for users based on id"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Insert dummy users
INSERT INTO users (email, password, role, full_name) VALUES
('bsf@bellatrix.com', 'bsf123', 'bsf', 'BSF User'),
('bim@bellatrix.com', 'bim123', 'bim_admin', 'BIM Admin'),
('payment@bellatrix.com', 'payment123', 'payment_officer', 'Payment Officer'),
('ic@bellatrix.com', 'ic123', 'ic', 'Investment Committee'),
('investor@bellatrix.com', 'investor123', 'investor', 'Investor')
ON CONFLICT (email) DO NOTHING;