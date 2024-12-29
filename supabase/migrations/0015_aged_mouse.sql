/*
  # Create Test Investor Profiles

  1. New Data
    - Creates 3 test investor users with different risk profiles
    - Creates investor profiles with realistic dummy data
    - Creates initial investment accounts for each investor
*/

-- Create test investor users
INSERT INTO users (email, password, role, full_name) VALUES
('john.doe@example.com', 'invest123', 'investor', 'John Doe'),
('sarah.smith@example.com', 'invest123', 'investor', 'Sarah Smith'),
('michael.brown@example.com', 'invest123', 'investor', 'Michael Brown')
ON CONFLICT (email) DO NOTHING;

-- Create investor profiles
INSERT INTO investor_profiles (
  user_id,
  full_name,
  id_number,
  date_of_birth,
  phone_number,
  physical_address,
  postal_address,
  occupation,
  employer,
  source_of_funds,
  risk_appetite
) VALUES
(
  (SELECT id FROM users WHERE email = 'john.doe@example.com'),
  'John Doe',
  'NAM19800515',
  '1980-05-15',
  '+264 81 123 4567',
  '123 Independence Avenue, Windhoek',
  'P.O. Box 1234, Windhoek',
  'Business Owner',
  'Self Employed',
  'Business Income',
  'high'
),
(
  (SELECT id FROM users WHERE email = 'sarah.smith@example.com'),
  'Sarah Smith',
  'NAM19900720',
  '1990-07-20',
  '+264 81 234 5678',
  '45 Nelson Mandela Avenue, Windhoek',
  'P.O. Box 5678, Windhoek',
  'Medical Doctor',
  'Central Hospital',
  'Professional Income',
  'medium'
),
(
  (SELECT id FROM users WHERE email = 'michael.brown@example.com'),
  'Michael Brown',
  'NAM19750830',
  '1975-08-30',
  '+264 81 345 6789',
  '78 Sam Nujoma Drive, Windhoek',
  'P.O. Box 9012, Windhoek',
  'Retired',
  'N/A',
  'Retirement Savings',
  'low'
);

-- Create initial investment accounts
INSERT INTO investor_accounts (
  profile_id,
  account_name,
  account_number,
  total_invested,
  total_withdrawn,
  current_balance,
  total_realised_interest
) VALUES
(
  (SELECT id FROM investor_profiles WHERE full_name = 'John Doe'),
  'High Growth Portfolio',
  'ACC_001',
  500000.00,
  0.00,
  525000.00,
  5.00
),
(
  (SELECT id FROM investor_profiles WHERE full_name = 'Sarah Smith'),
  'Balanced Growth Account',
  'ACC_002',
  250000.00,
  0.00,
  262500.00,
  5.00
),
(
  (SELECT id FROM investor_profiles WHERE full_name = 'Michael Brown'),
  'Conservative Investment',
  'ACC_003',
  100000.00,
  0.00,
  103000.00,
  3.00
);