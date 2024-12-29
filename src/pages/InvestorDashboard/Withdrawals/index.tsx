import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { WithdrawalForm } from './WithdrawalForm';
import { WithdrawalHistory } from './WithdrawalHistory';
import { WithdrawalStatus } from './WithdrawalStatus';
import type { InvestorProfile } from '../../../types';

interface WithdrawalsProps {
  investorUser: InvestorAuthUser;
}

export function Withdrawals({ investorUser, onError }: WithdrawalsProps) {
  const [profile, setProfile] = useState<InvestorProfile | null>(null);
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [investorUser.id]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('investor_profiles')
      .select(`
        *,
        accounts:investor_accounts(*)
      `)
      .eq('investor_user_id', investorUser.id)
      .single();

    if (data) setProfile(data);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <WithdrawalHistory profileId={profile?.id} />
        </div>
        <div className="space-y-6">
          <WithdrawalStatus profileId={profile?.id} />
          <button
            onClick={() => setShowWithdrawalForm(true)}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Request Withdrawal
          </button>
        </div>
      </div>

      {showWithdrawalForm && profile && (
        <WithdrawalForm
          profile={profile}
          onClose={() => setShowWithdrawalForm(false)}
          onSuccess={() => {
            setShowWithdrawalForm(false);
            fetchProfile();
          }}
        />
      )}
    </div>
  );
}