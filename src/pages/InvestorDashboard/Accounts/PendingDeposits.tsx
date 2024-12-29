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
  onUpdate: () => void;
}

export function PendingDeposits({ profileId, onUpdate }: PendingDepositsProps) {
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);

  useEffect(() => {
    if (profileId) {
      fetchDeposits();
    }
  }, [profileId]);

  const fetchDeposits = async () => {
    console.log('Fetching deposits for profile:', profileId);
    const { data } = await supabase
      .from('deposit_requests')
      .select(`
        id,
        amount,
        source_of_funds,
        status,
        created_at
      `)
      .eq('profile_id', profileId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (data) {
      console.log('Found pending deposits:', data);
      setDeposits(data);
    }
  };

  if (!deposits.length) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <Clock className="w-5 h-5 text-yellow-500 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">
            Pending Deposits
          </h2>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {deposits.map((deposit) => (
            <div
              key={deposit.id}
              className="bg-yellow-50 rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-gray-900">
                    N$ {deposit.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Requested on{' '}
                    {format(new Date(deposit.created_at), 'MMM dd, yyyy')}
                  </p>
                </div>
                <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">
                  Pending
                </span>
              </div>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Source of Funds:</span>{' '}
                {deposit.source_of_funds}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}