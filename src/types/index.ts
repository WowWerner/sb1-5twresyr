export type UserRole = 'bsf' | 'bim_admin' | 'payment_officer' | 'ic' | 'investor';

export type PriorityLevel = 'low' | 'medium' | 'high';

export type ApprovalStatus = 'pending' | 'approved' | 'declined';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  createdAt: string;
  lastLogin: string | null;
}

export interface InvestorAuthUser {
  id: string;
  email: string;
  full_name: string;
  status: string;
  created_at: string;
  last_login: string | null;
}

export interface RFFApplication {
  id: string;
  rff_number: string;
  client_name: string;
  client_contact: string;
  loan_facility_number: string;
  loan_amount: number;
  interest_rate: number;
  bim_interest: number;
  bsf_interest: number;
  settlement_date: string;
  off_taker: string;
  off_taker_sector: string;
  priority: PriorityLevel;
  submitted_by: string; // User email
  approval_status: ApprovalStatus;
  is_funded: boolean;
  is_settled: boolean;
  created_at: string;
  updated_at: string;
}

export interface InvestorProfile {
  id: string;
  investor_user_id: string;
  full_name: string;
  id_number: string;
  date_of_birth: string;
  phone_number: string;
  physical_address: string;
  postal_address?: string;
  occupation: string;
  employer?: string;
  source_of_funds: string;
  risk_appetite: string;
  created_at: string;
  updated_at: string;
  investor_user?: {
    email: string;
  };
  accounts?: InvestorAccount[];
}

export interface PaymentNotification {
  id: string;
  type: 'rff_funding' | 'withdrawal';
  status: string;
  priority: string;
  created_at: string;
  rff_application?: {
    id: string;
    rff_number: string;
    client_name: string;
    loan_amount: number;
  };
  withdrawal_request?: {
    withdrawal_id: string;
    amount: number;
    investor_profile: {
      full_name: string;
    };
  };
}

export interface InvestorAccount {
  id: string;
  profile_id: string;
  account_name: string;
  account_number: string;
  total_invested: number;
  total_withdrawn: number;
  current_balance: number;
  created_at: string;
  updated_at: string;
}

export interface FundingRequest {
  id: string;
  profile_id: string;
  amount: number;
  status: string;
  validated_at?: string;
  validated_by?: string;
  transaction_id?: string;
  created_at: string;
  updated_at: string;
}