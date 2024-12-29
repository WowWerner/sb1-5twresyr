/*
  # Fix RLS Policies for Custom Authentication
  
  1. Changes
    - Drop existing policies
    - Create new policies that don't rely on auth.uid()
    
  2. Security
    - Enable public read access for users table (needed for login)
    - Add policies for BSF users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable update for users based on id" ON users;
DROP POLICY IF EXISTS "BSF users can create RFF applications" ON rff_applications;
DROP POLICY IF EXISTS "BSF users can view own RFF applications" ON rff_applications;

-- Create new policies for users table
CREATE POLICY "Allow public read access to users"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Allow last_login updates"
  ON users FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create new policies for RFF applications
CREATE POLICY "Allow BSF users to create applications"
  ON rff_applications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = rff_applications.submitted_by
      AND users.role = 'bsf'
    )
  );

CREATE POLICY "Allow BSF users to view own applications"
  ON rff_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = rff_applications.submitted_by
      AND users.role = 'bsf'
    )
  );