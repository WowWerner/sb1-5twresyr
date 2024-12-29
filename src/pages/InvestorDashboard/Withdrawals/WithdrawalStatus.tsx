import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../../../lib/supabase';

interface PendingWithdrawal {
  id: string;
  amount: number;
  urgency_level: string;
  created_at: string;
  account: {
    account_name: string;
  };
}

interface WithdrawalStatusProps {
  profileId?: string;
}

export function WithdrawalStatus({ profileId }: WithdrawalStatusProps) {
  const [pendingWithdrawals, setPendingWithdrawals] = useState<PendingWithdrawal[]>([]);

  useEffect(() => {
    if (profileId) {
      fetchPendingWithdrawals();
    }
  }, [profileId]);

  const fetchPendingWithdrawals = async () => {
    const { data } = await supabase
      .from('withdrawal_requests')
      .select(`
        *,
        account:investor_accounts(account_name)
      `)
      .eq('profile_id', profileId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (data) setPendingWithdrawals(data);
  };

  if (!pendingWithdrawals.length) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <Clock className="w-5 h-5 text-yellow-500 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">
            Pending Withdrawals
          </h2>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {pendingWithdrawals.map((withdrawal) => (
            <div
              key={withdrawal.id}
              className="bg-yellow-50 rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-gray-900">
                    N$ {withdrawal.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    From: {withdrawal.account.account_name}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  withdrawal.urgency_level === 'very_urgent'
                    ? 'bg-red-100 text-red-800'
                    : withdrawal.urgency_level === 'urgent'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {withdrawal.urgency_level.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Requested on {format(new Date(withdrawal.created_at), 'MMM dd, yyyy')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}