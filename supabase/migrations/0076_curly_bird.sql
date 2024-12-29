/*
  # Update submitted_by to use email instead of UUID

  1. Changes
    - Modify submitted_by column to use email instead of UUID
    - Update existing records to use email
    - Update foreign key constraints and policies
*/

-- First drop existing policies
DROP POLICY IF EXISTS "bsf_create_applications" ON rff_applications;
DROP POLICY IF EXISTS "bsf_view_applications" ON rff_applications;

-- Add temporary column for email
ALTER TABLE rff_applications 
ADD COLUMN submitted_by_email text;

-- Update temporary column with emails from users table
UPDATE rff_applications ra
SET submitted_by_email = u.email
FROM users u
WHERE ra.submitted_by::uuid = u.id;

-- Drop old column and add new one
ALTER TABLE rff_applications 
DROP COLUMN submitted_by CASCADE;

ALTER TABLE rff_applications
ADD COLUMN submitted_by text NOT NULL DEFAULT 'system@bellatrix.com';

-- Copy data from temporary column
UPDATE rff_applications 
SET submitted_by = COALESCE(submitted_by_email, 'system@bellatrix.com');

-- Drop temporary column
ALTER TABLE rff_applications 
DROP COLUMN submitted_by_email;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_rff_applications_submitted_by 
ON rff_applications(submitted_by);

-- Create new policies using email
CREATE POLICY "bsf_create_applications"
  ON rff_applications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE email = auth.email()
      AND role = 'bsf'
    )
  );

CREATE POLICY "bsf_view_applications"
  ON rff_applications FOR SELECT
  TO authenticated
  USING (
    -- Allow BSF users to view their own applications
    (
      EXISTS (
        SELECT 1 FROM users
        WHERE email = auth.email()
        AND role = 'bsf'
      )
      AND submitted_by = auth.email()
    )
    -- Allow BIM admins and IC members to view all applications
    OR EXISTS (
      SELECT 1 FROM users
      WHERE email = auth.email()
      AND role IN ('bim_admin', 'ic')
    )
  );