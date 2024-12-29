export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password: string
          role: 'bsf' | 'bim_admin' | 'payment_officer' | 'ic' | 'investor'
          full_name: string
          created_at: string
          last_login: string | null
        }
        Insert: {
          id?: string
          email: string
          password: string
          role: 'bsf' | 'bim_admin' | 'payment_officer' | 'ic' | 'investor'
          full_name: string
          created_at?: string
          last_login?: string | null
        }
        Update: {
          id?: string
          email?: string
          password?: string
          role?: 'bsf' | 'bim_admin' | 'payment_officer' | 'ic' | 'investor'
          full_name?: string
          created_at?: string
          last_login?: string | null
        }
      }
      rff_applications: {
        Row: {
          id: string
          rff_number: string
          client_name: string
          client_contact: string
          loan_facility_number: string
          loan_amount: number
          interest_rate: number
          bim_interest: number
          bsf_interest: number
          settlement_date: string
          off_taker: string
          off_taker_sector: string
          priority: 'low' | 'medium' | 'high'
          submitted_by: string
          approval_status: 'pending' | 'approved' | 'declined'
          is_funded: boolean
          is_settled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          rff_number?: string
          client_name: string
          client_contact: string
          loan_facility_number: string
          loan_amount: number
          interest_rate: number
          bim_interest: number
          bsf_interest: number
          settlement_date: string
          off_taker: string
          off_taker_sector: string
          priority: 'low' | 'medium' | 'high'
          submitted_by: string
          approval_status?: 'pending' | 'approved' | 'declined'
          is_funded?: boolean
          is_settled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          rff_number?: string
          client_name?: string
          client_contact?: string
          loan_facility_number?: string
          loan_amount?: number
          interest_rate?: number
          bim_interest?: number
          bsf_interest?: number
          settlement_date?: string
          off_taker?: string
          off_taker_sector?: string
          priority?: 'low' | 'medium' | 'high'
          submitted_by?: string
          approval_status?: 'pending' | 'approved' | 'declined'
          is_funded?: boolean
          is_settled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}