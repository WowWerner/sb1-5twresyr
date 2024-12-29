/*
  # Fix Timestamp and Date Handling

  1. Changes
    - Safely drop and recreate triggers
    - Update timestamp handling
    - Improve date validation
*/

-- Safely drop existing triggers and functions
DO $$ BEGIN
    DROP TRIGGER IF EXISTS set_timestamp ON rff_applications;
    DROP TRIGGER IF EXISTS validate_settlement_date ON rff_applications;
    DROP TRIGGER IF EXISTS update_timestamp ON rff_applications;
    DROP TRIGGER IF EXISTS validate_date_trigger ON rff_applications;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

DO $$ BEGIN
    DROP FUNCTION IF EXISTS trigger_set_timestamp();
    DROP FUNCTION IF EXISTS validate_settlement_date();
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- Create function to handle timestamps
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to validate dates
CREATE OR REPLACE FUNCTION validate_settlement_date()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate settlement_date format and value
  IF NEW.settlement_date IS NOT NULL THEN
    -- Ensure date is in ISO format
    IF NOT NEW.settlement_date::text ~ '^\d{4}-\d{2}-\d{2}$' THEN
      RAISE EXCEPTION 'Invalid settlement date format. Use YYYY-MM-DD';
    END IF;
    
    -- Convert to date type to ensure validity
    NEW.settlement_date := NEW.settlement_date::date;
  END IF;
  
  -- Set timestamps
  IF TG_OP = 'INSERT' THEN
    NEW.created_at = CURRENT_TIMESTAMP;
  END IF;
  NEW.updated_at = CURRENT_TIMESTAMP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Safely create new triggers
DO $$ BEGIN
    CREATE TRIGGER set_timestamp
        BEFORE UPDATE ON rff_applications
        FOR EACH ROW
        EXECUTE FUNCTION trigger_set_timestamp();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER validate_settlement_date
        BEFORE INSERT OR UPDATE ON rff_applications
        FOR EACH ROW
        EXECUTE FUNCTION validate_settlement_date();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update timestamp column defaults
ALTER TABLE rff_applications
    ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP,
    ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;