import { supabase } from '../supabase';
import type { InvestorProfile } from '../../types';

interface CreateInvestorUserParams {
  email: string;
  password: string;
  fullName: string;
  profileData: {
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
  };
}

export async function createInvestorUser(params: CreateInvestorUserParams) {
  try {
    const { data, error } = await supabase
      .rpc('create_investor', {
        p_email: params.email,
        p_password: params.password,
        p_full_name: params.fullName,
        p_profile: params.profileData
      });

    if (error) {
      console.error('Error creating investor:', error);
      throw new Error(error.message || 'Failed to create investor');
    }

    return data;
  } catch (error) {
    console.error('Error creating investor:', error);
    throw error;
  }
}

export async function fetchInvestorProfiles() {
  const { data, error } = await supabase
    .from('investor_profiles')
    .select(`
      *,
      investor_user:investor_users(email),
      accounts:investor_accounts(*)
    `);

  if (error) throw error;
  return data || [];
}

export async function deleteInvestorProfile(id: string) {
  const { error } = await supabase
    .from('investor_profiles')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getInvestorUser(id: string) {
  const { data, error } = await supabase
    .from('investor_users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching investor user:', error);
    return null;
  }

  return data;
}
export async function updateInvestorProfile(id: string, data: Partial<InvestorProfile>) {
  const { error } = await supabase
    .from('investor_profiles')
    .update(data)
    .eq('id', id);

  if (error) throw error;
}