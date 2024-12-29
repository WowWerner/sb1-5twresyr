import { supabase } from '../supabase';
import { handleSupabaseError } from '../errors';
import type { InvestorProfile } from '../../types';

export async function fetchInvestorProfile(investorUserId: string): Promise<InvestorProfile | null> {
  try {
    if (!investorUserId || investorUserId === 'undefined') {
      return null;
    }

    const { data, error } = await supabase
      .from('investor_profiles')
      .select(`
        *,
        accounts:investor_accounts(
          id,
          account_name,
          account_number,
          total_invested,
          total_withdrawn,
          current_balance,
          total_realised_interest
        ), 
        investor_user:investor_users(*)
      `)
      .eq('investor_user_id', investorUserId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error);
    return null;
  }
}

export async function fetchInvestorAccounts(profileId: string) {
  try {
    const { data, error } = await supabase
      .from('investor_accounts')
      .select('*')
      .eq('profile_id', profileId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    handleSupabaseError(error);
    return [];
  }
}