import React, { useState, useEffect } from 'react';
import { PlusCircle, Wallet, Loader } from 'lucide-react';
import { DepositForm } from '../../../components/investor/DepositForm';
import { EmptyState } from '../../../components/investor/EmptyState';
import { PendingDeposits } from '../../../components/investor/PendingDeposits';
import { fetchInvestorProfile } from '../../../lib/api/investor';
import type { InvestorProfile, InvestorAuthUser } from '../../../types';

interface HomeProps {
  investorUser: InvestorAuthUser;
  onError: (message: string) => void;
}

export function Home({ investorUser, onError }: HomeProps) {
  const [profile, setProfile] = useState<InvestorProfile | null>(null);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    activeAccounts: number;
    totalInvestment: number;
    pendingDeposits: number;
  }>({
    activeAccounts: 0,
    totalInvestment: 0,
    pendingDeposits: 0
  });

  useEffect(() => {
    loadProfile();
  }, [investorUser.id]);

  useEffect(() => {
    if (profile) {
      calculateStats();
    }
  }, [profile]);

  const calculateStats = async () => {
    if (!profile) return;

    try {
      // Get accounts data
      const { data: accounts } = await supabase
        .from('investor_accounts')
        .select('current_balance')
        .eq('profile_id', profile.id);

      const activeAccounts = accounts?.length || 0;
      const totalInvestment = accounts?.reduce(
        (sum, account) => sum + account.current_balance,
        0
      ) || 0;

      // Get pending deposits count
      const { count } = await supabase
        .from('deposit_requests')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', profile.id)
        .eq('status', 'pending');

      setStats({
        activeAccounts,
        totalInvestment,
        pendingDeposits: count || 0
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
      onError('Failed to load account statistics');
    }
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      if (!investorUser.id) {
        onError('Invalid user session');
        return;
      }

      const profileData = await fetchInvestorProfile(investorUser.id);
      
      if (!profileData) {
        onError('Profile not found. Please contact BIM Admin.');
        return;
      }
      
      setProfile(profileData);
    } catch (error) {
      console.error('Error loading profile:', error);
      onError(error instanceof Error ? error.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <EmptyState
        title="Welcome to Bellatrix Investment Portal"
        message="Please contact BIM Admin to complete your profile setup."
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {profile.full_name || investorUser.full_name}
        </h1>
        <button
          onClick={() => setShowDepositForm(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Make a Deposit
        </button>
      </div>

      {profile.accounts?.length === 0 ? (
        <EmptyState
          title=""
          message="Submit a deposit request to start investing. Our team will review and create your investment account."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {profile.accounts?.map((account) => (
            <div key={account.id} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-indigo-100 p-3 rounded-full">
                  <Wallet className="h-6 w-6 text-indigo-600" />
                </div>
                <span className="text-sm text-gray-500">{account.account_number}</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {account.account_name}
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Balance</span>
                  <span className="font-medium">N$ {account.current_balance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Total Interest</span>
                  <span className="font-medium text-green-600">
                    {account.total_realised_interest || 0}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <PendingDeposits profileId={profile.id} />

      {showDepositForm && (
        <DepositForm
          profileId={profile.id}
          onClose={() => setShowDepositForm(false)}
          onSuccess={() => {
            setShowDepositForm(false);
            loadProfile();
          }}
        />
      )}
    </div>
  );
}