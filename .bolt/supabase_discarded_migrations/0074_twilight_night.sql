/*
  # Fix RFF Application Submission

  1. Changes
    - Add trigger to handle RFF application submission
    - Add function to validate and process RFF submissions
    - Add policy to allow BSF users to submit RFF applications
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow BSF users to create applications" ON rff_applications;
DROP POLICY IF EXISTS "Allow BSF users to view own applications" ON rff_applications;

-- Create policy for BSF users to submit RFF applications
CREATE POLICY "bsf_submit_rff"
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

-- Create policy for BSF users to view their applications
CREATE POLICY "bsf_view_rff"
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

-- Create function to validate RFF submission
CREATE OR REPLACE FUNCTION validate_rff_submission()
RETURNS trigger AS $$
BEGIN
  -- Set default values if not provided
  NEW.approval_status := 'pending';
  NEW.is_funded := false;
  NEW.is_settled := false;
  NEW.created_at := COALESCE(NEW.created_at, now());
  NEW.updated_at := COALESCE(NEW.updated_at, now());
  
  -- Calculate BIM and BSF interest rates
  NEW.bim_interest := NEW.interest_rate * 0.7;  -- 70% to BIM
  NEW.bsf_interest := NEW.interest_rate * 0.3;  -- 30% to BSF
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for RFF submission
DROP TRIGGER IF EXISTS rff_submission_trigger ON rff_applications;
CREATE TRIGGER rff_submission_trigger
  BEFORE INSERT ON rff_applications
  FOR EACH ROW
  EXECUTE FUNCTION validate_rff_submission();

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_rff_applications_submitted_by 
ON rff_applications(submitted_by, approval_status);