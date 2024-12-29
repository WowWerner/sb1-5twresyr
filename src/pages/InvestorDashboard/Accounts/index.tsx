import React, { useState, useEffect } from 'react';
import { Loader, PlusCircle } from 'lucide-react';
import { AccountList } from './AccountList';
import { AccountDetails } from './AccountDetails';
import { DepositForm } from '../../../components/investor/DepositForm';
import { PendingDeposits } from '../../../components/investor/PendingDeposits';
import { EmptyState } from '../../../components/investor/EmptyState';
import { fetchInvestorProfile, fetchInvestorAccounts } from '../../../lib/api/investor';
import type { InvestorProfile, InvestorAuthUser } from '../../../types';

interface AccountsProps {
  investorUser: InvestorAuthUser;
  onError: (message: string) => void;
}

export function Accounts({ investorUser, onError }: AccountsProps) {
  const [profile, setProfile] = useState<InvestorProfile | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfileAndAccounts();
  }, [investorUser.id]);

  const loadProfileAndAccounts = async () => {
    try {
      setLoading(true);
      if (!investorUser.id) {
        onError('Invalid user session');
        return;
      }

      const profileData = await fetchInvestorProfile(investorUser.id);
      if (!profileData) {
        onError('No investor profile found. Please contact BIM Admin.');
        return;
      }

      const accountsData = await fetchInvestorAccounts(profileData.id);
      
      setProfile({
        ...profileData,
        accounts: accountsData
      });
    } catch (error) {
      console.error('Error loading profile and accounts:', error);
      onError('Failed to load investment accounts');
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
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setShowDepositForm(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Make a Deposit
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AccountList
            accounts={profile.accounts || []}
            onSelectAccount={setSelectedAccountId}
            selectedAccountId={selectedAccountId}
          />
          {selectedAccountId && (
            <AccountDetails
              accountId={selectedAccountId}
              onUpdate={loadProfileAndAccounts}
            />
          )}
        </div>
        <div>
          <PendingDeposits 
            profileId={profile.id} 
            onUpdate={loadProfileAndAccounts} 
          />
        </div>
      </div>

      {showDepositForm && (
        <DepositForm
          profileId={profile.id}
          onClose={() => setShowDepositForm(false)}
          onSuccess={() => {
            setShowDepositForm(false);
            loadProfileAndAccounts();
          }}
        />
      )}
    </div>
  );
}