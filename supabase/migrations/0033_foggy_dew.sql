/*
  # Fix Authentication System

  1. Changes
    - Drop existing policies
    - Create simplified auth policies
    - Ensure test users exist
    - Add proper indexes
*/

-- First, drop all existing policies
DROP POLICY IF EXISTS "users_read_policy" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "bim_admin_manage_all" ON users;

-- Create a single simple policy for authentication
CREATE POLICY "allow_auth"
  ON users FOR SELECT
  USING (true);

-- Create policy for updates
CREATE POLICY "allow_updates"
  ON users FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_users_auth ON users(email, password, role);

-- Delete existing test users to avoid conflicts
DELETE FROM users 
WHERE email IN (
  'admin@bellatrix.com',
  'bsf@bellatrix.com',
  'bim@bellatrix.com',
  'payment@bellatrix.com',
  'ic@bellatrix.com',
  'investor@bellatrix.com'
);

-- Insert fresh test users
INSERT INTO users (email, password, role, full_name)
VALUES 
  ('admin@bellatrix.com', 'admin123', 'bim_admin', 'BIM Administrator'),
  ('bsf@bellatrix.com', 'bsf123', 'bsf', 'BSF User'),
  ('bim@bellatrix.com', 'bim123', 'bim_admin', 'BIM Admin'),
  ('payment@bellatrix.com', 'payment123', 'payment_officer', 'Payment Officer'),
  ('ic@bellatrix.com', 'ic123', 'ic', 'Investment Committee'),
  ('investor@bellatrix.com', 'investor123', 'investor', 'Investor');