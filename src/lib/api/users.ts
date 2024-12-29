import { supabase } from '../supabase';
import type { UserRole } from '../../types';

interface CreateUserParams {
  email: string;
  password: string;
  role: UserRole;
  fullName: string;
}

export async function createUser({ email, password, role, fullName }: CreateUserParams) {
  const { data, error } = await supabase
    .from('users')
    .insert([{
      email,
      password,
      role,
      full_name: fullName
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error);
    throw new Error('Failed to create user. Please ensure you have proper permissions.');
  }

  return data;
}