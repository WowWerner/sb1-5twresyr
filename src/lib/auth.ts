import { supabase } from './supabase';
import type { UserRole } from '../types';

export interface AdminAuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
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

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export async function loginUser(email: string, password: string, role: UserRole): Promise<AdminAuthUser | InvestorAuthUser> {
  if (!email || !password) {
    throw new AuthError('Email and password are required');
  }

  // For investor role, use investor_users table
  if (role === 'investor') {
    return loginInvestorUser(email, password);
  }

  // For other roles, use users table
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, role, full_name')
      .eq('email', email)
      .eq('password', password)
      .eq('role', role)
      .limit(1);

    if (error) {
      console.error('Database error:', error);
      throw new AuthError('Database error occurred');
    }
    
    if (!user || user.length === 0) {
      console.error('No user found with provided credentials');
      throw new AuthError('Invalid email or password');
    }

    const userData = user[0];

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userData.id);

    return {
      id: userData.id,
      email: userData.email,
      role: userData.role,
      fullName: userData.full_name || '',
      createdAt: userData.created_at,
      lastLogin: userData.last_login
    };
  } catch (error) {
    if (error instanceof AuthError) throw error;
    console.error('Unexpected error:', error);
    throw new AuthError('An unexpected error occurred');
  }
}

async function loginInvestorUser(email: string, password: string): Promise<InvestorAuthUser> {
  try {
    const { data: user, error } = await supabase
      .from('investor_users')
      .select('id, email, full_name, status, created_at, last_login')
      .eq('email', email)
      .eq('password', password)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new AuthError('Database error occurred');
    }
    
    if (!user) {
      console.error('No investor found with provided credentials');
      throw new AuthError('Invalid email or password');
    }

    // Update last login
    await supabase
      .from('investor_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    return user;
  } catch (error) {
    if (error instanceof AuthError) throw error;
    throw new AuthError('An unexpected error occurred');
  }
}