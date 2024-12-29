/*
  # Fix RFF Applications Schema

  1. Changes
    - Add missing columns with proper defaults
    - Add trigger for interest rate calculations
    - Add performance indexes
*/

-- Add missing columns with proper defaults
DO $$ BEGIN
  -- Add client_contact if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rff_applications' 
    AND column_name = 'client_contact'
  ) THEN
    ALTER TABLE rff_applications 
    ADD COLUMN client_contact text NOT NULL DEFAULT '';
  END IF;

  -- Add loan_facility_number if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rff_applications' 
    AND column_name = 'loan_facility_number'
  ) THEN
    ALTER TABLE rff_applications 
    ADD COLUMN loan_facility_number text NOT NULL DEFAULT '';
  END IF;

  -- Add interest split columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rff_applications' 
    AND column_name = 'bim_interest'
  ) THEN
    ALTER TABLE rff_applications 
    ADD COLUMN bim_interest decimal(5,2) NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rff_applications' 
    AND column_name = 'bsf_interest'
  ) THEN
    ALTER TABLE rff_applications 
    ADD COLUMN bsf_interest decimal(5,2) NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Create or replace function for interest rate calculation
CREATE OR REPLACE FUNCTION set_interest_rates()
RETURNS TRIGGER AS $$
BEGIN
  -- Split interest rate evenly between BIM and BSF
  NEW.bim_interest := NEW.interest_rate / 2;
  NEW.bsf_interest := NEW.interest_rate / 2;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS set_interest_rates_trigger ON rff_applications;

-- Create new trigger
CREATE TRIGGER set_interest_rates_trigger
  BEFORE INSERT ON rff_applications
  FOR EACH ROW
  EXECUTE FUNCTION set_interest_rates();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_rff_applications_status 
ON rff_applications(approval_status);

CREATE INDEX IF NOT EXISTS idx_rff_applications_submitted_by 
ON rff_applications(submitted_by);