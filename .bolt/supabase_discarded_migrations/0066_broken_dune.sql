/*
  # Remove legacy user_id column
  
  1. Changes
    - Remove unused user_id column from investor_profiles table
    - Clean up any related indexes
  
  2. Notes
    - Safe to remove as all functionality now uses investor_user_id
    - No data migration needed as all active profiles use investor_user_id
*/

-- Drop any existing indexes on user_id
DROP INDEX IF EXISTS idx_investor_profiles_user_id;

-- Remove the user_id column
ALTER TABLE investor_profiles
  DROP COLUMN IF EXISTS user_id;