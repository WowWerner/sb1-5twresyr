/*
  # Update Investor Profile Constraints

  1. Changes
    - Make user_id nullable
    - Add proper foreign key for investor_user_id
    - Add indexes for better query performance
    
  2. Security
    - Maintain RLS policies
    - Ensure data integrity with constraints
*/

-- First make user_id nullable and add constraint to investor_user_id
ALTER TABLE investor_profiles
  ALTER COLUMN user_id DROP NOT NULL,
  ALTER COLUMN investor_user_id SET NOT NULL;

-- Drop existing constraint if it exists
DO $$ BEGIN
  ALTER TABLE investor_profiles
    DROP CONSTRAINT IF EXISTS investor_profiles_id_number_key;
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

-- Add unique constraint on id_number
ALTER TABLE investor_profiles
  ADD CONSTRAINT investor_profiles_id_number_unique UNIQUE (id_number);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_investor_profiles_investor_user_id 
  ON investor_profiles(investor_user_id);

CREATE INDEX IF NOT EXISTS idx_investor_profiles_id_number 
  ON investor_profiles(id_number);

-- Add foreign key constraint with cascade delete
ALTER TABLE investor_profiles
  DROP CONSTRAINT IF EXISTS investor_profiles_investor_user_id_fkey,
  ADD CONSTRAINT investor_profiles_investor_user_id_fkey
    FOREIGN KEY (investor_user_id)
    REFERENCES investor_users(id)
    ON DELETE CASCADE;