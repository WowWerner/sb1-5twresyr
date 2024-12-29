import React, { useState, useEffect } from 'react';
import { PlusCircle, Loader } from 'lucide-react';
import { AccountCard } from './AccountCard';
import { InvestmentChart } from './InvestmentChart';
import { PerformanceMetrics } from './PerformanceMetrics';
import { QuickActions } from './QuickActions';
import { DepositForm } from '../../../components/investor/DepositForm';
import { PendingDeposits } from '../../../components/investor/PendingDeposits';
import { EmptyState } from '../../../components/investor/EmptyState';
import { fetchInvestorProfile } from '../../../lib/api/investor';
import type { InvestorProfile, InvestorAuthUser } from '../../../types';

interface PortfolioProps {
  investorUser: InvestorAuthUser;
  onError: (message: string) => void;
}

export function Portfolio({ investorUser, onError }: PortfolioProps) {
  const [profile, setProfile] = useState<InvestorProfile | null>(null);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [investorUser.id]);

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
      onError('Failed to load investment profile');
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

  const totalInvestment = profile.accounts?.reduce(
    (sum, account) => sum + account.current_balance,
    0
  ) || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Investment Portfolio</h1>

      <QuickActions onDeposit={() => setShowDepositForm(true)} />

      {profile.accounts?.length === 0 ? (
        <EmptyState
          title=""
          message="Submit a deposit request to start investing. Our team will review and create your investment account."
        />
      ) : (
        <>
          <PerformanceMetrics accounts={profile.accounts} />

          <div className="mb-8">
            <InvestmentChart profileId={profile.id} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profile.accounts?.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        </>
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