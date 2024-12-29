/*
  # Fix User Policies and Add Test Users
  
  1. Changes
    - Simplify RLS policies for users table
    - Add test users for each role
*/

-- Drop existing policies
DROP POLICY IF EXISTS "allow_read_users" ON users;
DROP POLICY IF EXISTS "allow_update_own_user" ON users;
DROP POLICY IF EXISTS "allow_bim_admin_full_access" ON users;

-- Create simplified policies
CREATE POLICY "users_select_policy"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "users_update_policy"
  ON users FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Delete existing test users
DELETE FROM users WHERE email IN (
  'admin@bellatrix.com',
  'bsf@bellatrix.com',
  'bim@bellatrix.com',
  'payment@bellatrix.com',
  'ic@bellatrix.com',
  'investor@bellatrix.com'
);

-- Insert test users
INSERT INTO users (email, password, role, full_name, created_at) VALUES
('admin@bellatrix.com', 'admin123', 'bim_admin', 'BIM Administrator', now()),
('bsf@bellatrix.com', 'bsf123', 'bsf', 'BSF User', now()),
('bim@bellatrix.com', 'bim123', 'bim_admin', 'BIM Admin', now()),
('payment@bellatrix.com', 'payment123', 'payment_officer', 'Payment Officer', now()),
('ic@bellatrix.com', 'ic123', 'ic', 'Investment Committee', now()),
('investor@bellatrix.com', 'investor123', 'investor', 'Investor', now());