/*
  # Update RFF Application Policies

  1. Changes
    - Update RLS policies for RFF applications to handle submitted_by properly
    - Add index on submitted_by column for better performance
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow BSF users to create applications" ON rff_applications;
DROP POLICY IF EXISTS "Allow BSF users to view own applications" ON rff_applications;

-- Create new policies
CREATE POLICY "bsf_create_applications"
  ON rff_applications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
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
        WHERE id = auth.uid()
        AND role = 'bsf'
      )
      AND submitted_by = auth.uid()
    )
    -- Allow BIM admins and IC members to view all applications
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('bim_admin', 'ic')
    )
  );

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_rff_applications_submitted_by 
ON rff_applications(submitted_by);