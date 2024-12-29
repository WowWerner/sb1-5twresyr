-- Add payment reference column to deposit_requests
ALTER TABLE deposit_requests
ADD COLUMN IF NOT EXISTS payment_reference text;

-- Create function to generate payment reference
CREATE OR REPLACE FUNCTION generate_payment_reference()
RETURNS TRIGGER AS $$
DECLARE
  next_number integer;
BEGIN
  -- Get next sequential number
  SELECT COALESCE(MAX(CAST(SUBSTRING(payment_reference FROM 'DEP_(\d+)') AS integer)), 0) + 1
  INTO next_number
  FROM deposit_requests;
  
  -- Generate payment reference
  NEW.payment_reference := 'DEP_' || LPAD(next_number::text, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for payment reference generation
DROP TRIGGER IF EXISTS set_payment_reference ON deposit_requests;
CREATE TRIGGER set_payment_reference
  BEFORE INSERT ON deposit_requests
  FOR EACH ROW
  EXECUTE FUNCTION generate_payment_reference();

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_deposit_requests_payment_ref 
ON deposit_requests(payment_reference);