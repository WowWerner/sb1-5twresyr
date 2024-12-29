/*
  # Payment Officer Dashboard Setup

  1. New Tables
    - `payment_notifications`
      - Stores notifications for payment requests
    - `payment_proofs`
      - Stores proof of payment documents
    
  2. Security
    - Enable RLS on all tables
    - Add policies for payment officer access
*/

-- Create payment notifications table
CREATE TABLE IF NOT EXISTS payment_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('rff_funding', 'withdrawal')),
  rff_id uuid REFERENCES rff_applications(id),
  withdrawal_id uuid REFERENCES withdrawal_requests(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'cancelled')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payment proofs table
CREATE TABLE IF NOT EXISTS payment_proofs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id uuid REFERENCES payment_notifications(id) NOT NULL,
  file_url text NOT NULL,
  uploaded_by uuid REFERENCES users(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE payment_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_proofs ENABLE ROW LEVEL SECURITY;

-- Create policies for payment officer access
CREATE POLICY "Payment officers can view notifications"
  ON payment_notifications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'payment_officer'
    )
  );

CREATE POLICY "Payment officers can update notifications"
  ON payment_notifications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'payment_officer'
    )
  );

CREATE POLICY "Payment officers can manage payment proofs"
  ON payment_proofs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'payment_officer'
    )
  );