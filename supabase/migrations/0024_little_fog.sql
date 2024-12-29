/*
  # Fix User Authentication and Policies
  
  1. Handle foreign key constraints
  2. Update policies
  3. Recreate test users
*/

-- First, delete related records in investor_profiles
DELETE FROM investor_profiles
WHERE user_id IN (
  SELECT id FROM users
  WHERE email IN (
    'admin@bellatrix.com',
    'bsf@bellatrix.com',
    'bim@bellatrix.com',
    'payment@bellatrix.com',
    'ic@bellatrix.com',
    'investor@bellatrix.com'
  )
);

-- Drop existing policies
DROP POLICY IF EXISTS "allow_user_select" ON users;
DROP POLICY IF EXISTS "allow_user_update" ON users;
DROP POLICY IF EXISTS "allow_user_insert" ON users;
DROP POLICY IF EXISTS "allow_user_delete" ON users;

-- Create simplified policy for authentication
CREATE POLICY "authenticate_users"
  ON users FOR SELECT
  USING (true);

-- Now safe to delete users
DELETE FROM users
WHERE email IN (
  'admin@bellatrix.com',
  'bsf@bellatrix.com',
  'bim@bellatrix.com',
  'payment@bellatrix.com',
  'ic@bellatrix.com',
  'investor@bellatrix.com'
);

-- Insert test users with proper data
INSERT INTO users (id, email, password, role, full_name, created_at) VALUES
(gen_random_uuid(), 'admin@bellatrix.com', 'admin123', 'bim_admin', 'BIM Administrator', now()),
(gen_random_uuid(), 'bsf@bellatrix.com', 'bsf123', 'bsf', 'BSF User', now()),
(gen_random_uuid(), 'bim@bellatrix.com', 'bim123', 'bim_admin', 'BIM Admin', now()),
(gen_random_uuid(), 'payment@bellatrix.com', 'payment123', 'payment_officer', 'Payment Officer', now()),
(gen_random_uuid(), 'ic@bellatrix.com', 'ic123', 'ic', 'Investment Committee', now()),
(gen_random_uuid(), 'investor@bellatrix.com', 'investor123', 'investor', 'Investor', now());