/*
  # Fix RFF Application Timestamps

  1. Changes
    - Add trigger to automatically update updated_at timestamp
    - Ensure created_at and updated_at are properly set on insert
    - Fix existing records to have proper timestamps
*/

-- Create function to handle timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS set_timestamp ON rff_applications;
CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON rff_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to validate RFF submission with proper timestamps
CREATE OR REPLACE FUNCTION validate_rff_submission()
RETURNS trigger AS $$
BEGIN
  -- Set default values if not provided
  NEW.approval_status := COALESCE(NEW.approval_status, 'pending');
  NEW.is_funded := COALESCE(NEW.is_funded, false);
  NEW.is_settled := COALESCE(NEW.is_settled, false);
  NEW.created_at := COALESCE(NEW.created_at, CURRENT_TIMESTAMP);
  NEW.updated_at := COALESCE(NEW.updated_at, CURRENT_TIMESTAMP);
  
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

-- Update any existing records with NULL timestamps
UPDATE rff_applications 
SET 
  created_at = CURRENT_TIMESTAMP,
  updated_at = CURRENT_TIMESTAMP
WHERE 
  created_at IS NULL 
  OR updated_at IS NULL;