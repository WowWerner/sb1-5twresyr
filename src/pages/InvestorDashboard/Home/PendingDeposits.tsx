import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface DepositRequest {
  id: string;
  amount: number;
  source_of_funds: string;
  status: string;
  created_at: string;
}

interface PendingDepositsProps {
  profileId?: string;
}

export function PendingDeposits({ profileId }: PendingDepositsProps) {
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);

  useEffect(() => {
    if (profileId) {
      fetchDeposits();
    }
  }, [profileId]);

  const fetchDeposits = async () => {
    const { data } = await supabase
      .from('deposit_requests')
      .select('*')
      .eq('profile_id', profileId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (data) setDeposits(data);
  };

  if (!deposits.length) return null;

  return (
    <div className="mt-6 bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center mb-4">
        <Clock className="w-5 h-5 text-yellow-500 mr-2" />
        <h2 className="text-lg font-medium text-gray-900">
          Pending Deposit Requests
        </h2>
      </div>
      <div className="space-y-4">
        {deposits.map((deposit) => (
          <div
            key={deposit.id}
            className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg"
          >
            <div>
              <p className="font-medium text-gray-900">
                N$ {deposit.amount.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">
                Source: {deposit.source_of_funds}
              </p>
              <p className="text-sm text-gray-500">
                Requested on {format(new Date(deposit.created_at), 'MMM dd, yyyy')}
              </p>
            </div>
            <span className="px-3 py-1 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-full">
              Pending Approval
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}