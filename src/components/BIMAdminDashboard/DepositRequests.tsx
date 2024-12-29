import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface DepositRequest {
  id: string;
  amount: number;
  source_of_funds: string;
  status: string;
  created_at: string;
  profile: {
    full_name: string;
    id_number: string;
  };
}

export function DepositRequests() {
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    try {
      const { data } = await supabase
        .from('deposit_requests')
        .select(`
          *,
          profile:investor_profiles(
            full_name,
            id_number
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (data) setDeposits(data);
    } catch (error) {
      console.error('Error fetching deposits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const confirmed = window.confirm(
        'Approving this deposit will create a new investment account. Continue?'
      );
      
      if (!confirmed) return;

      const { error } = await supabase
        .from('deposit_requests')
        .update({ status: 'approved' })
        .eq('id', id);

      if (error) throw error;
      alert('Deposit approved and investment account created successfully');
      fetchDeposits();
    } catch (error) {
      console.error('Error approving deposit:', error);
      alert('Failed to approve deposit. Please try again.');
    }
  };

  const handleDecline = async (id: string) => {
    try {
      const confirmed = window.confirm('Are you sure you want to decline this deposit request?');
      
      if (!confirmed) return;

      const { error } = await supabase
        .from('deposit_requests')
        .update({ status: 'declined' })
        .eq('id', id);

      if (error) throw error;
      alert('Deposit request declined');
      fetchDeposits();
    } catch (error) {
      console.error('Error declining deposit:', error);
      alert('Failed to decline deposit. Please try again.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (deposits.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm mt-8">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Pending Deposit Requests</h2>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {deposits.map((deposit) => (
            <div
              key={deposit.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">
                    {deposit.profile.full_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    ID: {deposit.profile.id_number}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Amount: N$ {deposit.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Source: {deposit.source_of_funds}
                  </p>
                  <p className="text-sm text-gray-500">
                    Requested: {format(new Date(deposit.created_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApprove(deposit.id)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                    title="Approve"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDecline(deposit.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                    title="Decline"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}