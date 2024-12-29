/*
  # Add Test Investors

  1. New Data
    - Create test investor users with credentials
    - Create investor profiles with realistic data
    - Create initial investment accounts with balances
    
  2. Test Accounts
    - Test Investor 1: High-risk investor with large portfolio
    - Test Investor 2: Medium-risk investor with medium portfolio
    - Test Investor 3: Low-risk investor with conservative portfolio
*/

-- Create test investor users
INSERT INTO users (email, password, role, full_name) VALUES
('test.investor1@example.com', 'test123', 'investor', 'Test Investor One'),
('test.investor2@example.com', 'test123', 'investor', 'Test Investor Two'),
('test.investor3@example.com', 'test123', 'investor', 'Test Investor Three')
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
  (SELECT id FROM users WHERE email = 'test.investor1@example.com'),
  'Test Investor One',
  'TEST123456',
  '1985-03-15',
  '+264 81 111 1111',
  '123 Test Street, Windhoek',
  'P.O. Box TEST1, Windhoek',
  'Entrepreneur',
  'Self Employed',
  'Business Income',
  'high'
),
(
  (SELECT id FROM users WHERE email = 'test.investor2@example.com'),
  'Test Investor Two',
  'TEST789012',
  '1990-06-20',
  '+264 81 222 2222',
  '456 Test Avenue, Windhoek',
  'P.O. Box TEST2, Windhoek',
  'Software Engineer',
  'Tech Corp',
  'Salary',
  'medium'
),
(
  (SELECT id FROM users WHERE email = 'test.investor3@example.com'),
  'Test Investor Three',
  'TEST345678',
  '1978-09-10',
  '+264 81 333 3333',
  '789 Test Road, Windhoek',
  'P.O. Box TEST3, Windhoek',
  'Teacher',
  'Education Department',
  'Salary',
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
  (SELECT id FROM investor_profiles WHERE full_name = 'Test Investor One'),
  'Growth Portfolio',
  'TEST_ACC_001',
  1000000.00,
  0.00,
  1080000.00,
  8.00
),
(
  (SELECT id FROM investor_profiles WHERE full_name = 'Test Investor Two'),
  'Balanced Portfolio',
  'TEST_ACC_002',
  500000.00,
  0.00,
  525000.00,
  5.00
),
(
  (SELECT id FROM investor_profiles WHERE full_name = 'Test Investor Three'),
  'Conservative Portfolio',
  'TEST_ACC_003',
  250000.00,
  0.00,
  257500.00,
  3.00
);