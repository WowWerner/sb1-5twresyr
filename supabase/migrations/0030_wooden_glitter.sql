/*
  # Fix User Management and Authentication

  1. Changes
    - Drop existing policies
    - Create new authentication policies
    - Handle cascading deletes properly
    - Ensure test users exist

  2. Security
    - Enable RLS on users table
    - Add policies for authentication and admin access
*/

-- First delete any existing investor accounts
DELETE FROM investor_accounts
WHERE profile_id IN (
  SELECT ip.id
  FROM investor_profiles ip
  JOIN users u ON ip.user_id = u.id
  WHERE u.email IN (
    'admin@bellatrix.com',
    'bsf@bellatrix.com',
    'payment@bellatrix.com',
    'ic@bellatrix.com',
    'investor@bellatrix.com'
  )
);

-- Then delete investor profiles
DELETE FROM investor_profiles
WHERE user_id IN (
  SELECT id FROM users
  WHERE email IN (
    'admin@bellatrix.com',
    'bsf@bellatrix.com',
    'payment@bellatrix.com',
    'ic@bellatrix.com',
    'investor@bellatrix.com'
  )
);

-- Finally delete users
DELETE FROM users 
WHERE email IN (
  'admin@bellatrix.com',
  'bsf@bellatrix.com',
  'payment@bellatrix.com',
  'ic@bellatrix.com',
  'investor@bellatrix.com'
);

-- Drop existing policies
DROP POLICY IF EXISTS "allow_read_all_users" ON users;
DROP POLICY IF EXISTS "allow_bim_admin_all" ON users;
DROP POLICY IF EXISTS "allow_update_own" ON users;

-- Create simplified authentication policies
CREATE POLICY "users_read_access"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "users_admin_access"
  ON users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'bim_admin'
    )
  );

-- Insert test users
INSERT INTO users (email, password, role, full_name)
VALUES 
  ('admin@bellatrix.com', 'admin123', 'bim_admin', 'BIM Administrator'),
  ('bsf@bellatrix.com', 'bsf123', 'bsf', 'BSF User'),
  ('payment@bellatrix.com', 'payment123', 'payment_officer', 'Payment Officer'),
  ('ic@bellatrix.com', 'ic123', 'ic', 'Investment Committee'),
  ('investor@bellatrix.com', 'investor123', 'investor', 'Investor')
ON CONFLICT (email) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);