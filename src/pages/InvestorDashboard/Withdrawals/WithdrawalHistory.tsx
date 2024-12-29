import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface WithdrawalRequest {
  id: string;
  withdrawal_id: string;
  amount: number;
  urgency_level: string;
  status: string;
  created_at: string;
  account: {
    account_name: string;
    account_number: string;
  };
}

interface WithdrawalHistoryProps {
  profileId?: string;
}

export function WithdrawalHistory({ profileId }: WithdrawalHistoryProps) {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);

  useEffect(() => {
    if (profileId) {
      fetchWithdrawals();
    }
  }, [profileId]);

  const fetchWithdrawals = async () => {
    const { data } = await supabase
      .from('withdrawal_requests')
      .select(`
        *,
        account:investor_accounts(
          account_name,
          account_number
        )
      `)
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false });

    if (data) setWithdrawals(data);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'declined':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Withdrawal History</h2>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {withdrawals.map((withdrawal) => (
            <div
              key={withdrawal.id}
              className="bg-gray-50 rounded-lg p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(withdrawal.status)}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(withdrawal.status)}`}>
                      {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                    </span>
                  </div>
                  <p className="mt-2 font-medium text-gray-900">
                    N$ {withdrawal.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    From: {withdrawal.account.account_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Account: {withdrawal.account.account_number}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {format(new Date(withdrawal.created_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                  {withdrawal.withdrawal_id && (
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      ID: {withdrawal.withdrawal_id}
                    </p>
                  )}
                  <p className={`text-sm font-medium mt-1 ${
                    withdrawal.urgency_level === 'very_urgent'
                      ? 'text-red-600'
                      : withdrawal.urgency_level === 'urgent'
                      ? 'text-orange-600'
                      : 'text-blue-600'
                  }`}>
                    {withdrawal.urgency_level.replace('_', ' ').toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {withdrawals.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              No withdrawal history found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}