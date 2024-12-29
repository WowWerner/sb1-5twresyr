/*
  # Fix RFF Applications Columns

  1. Changes
    - Add missing columns with proper snake_case naming
    - Set default values to prevent null issues
    - Add proper constraints
*/

-- Add missing columns if they don't exist
DO $$ BEGIN
  -- Client contact column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rff_applications' 
    AND column_name = 'client_contact'
  ) THEN
    ALTER TABLE rff_applications ADD COLUMN client_contact text NOT NULL DEFAULT '';
  END IF;

  -- Loan facility number column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rff_applications' 
    AND column_name = 'loan_facility_number'
  ) THEN
    ALTER TABLE rff_applications ADD COLUMN loan_facility_number text NOT NULL DEFAULT '';
  END IF;

  -- Interest split columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rff_applications' 
    AND column_name = 'bim_interest'
  ) THEN
    ALTER TABLE rff_applications ADD COLUMN bim_interest decimal(5,2) NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rff_applications' 
    AND column_name = 'bsf_interest'
  ) THEN
    ALTER TABLE rff_applications ADD COLUMN bsf_interest decimal(5,2) NOT NULL DEFAULT 0;
  END IF;
END $$;