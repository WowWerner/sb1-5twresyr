import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { InvestorProfile } from '../../../types';

interface WithdrawalFormProps {
  profile: InvestorProfile;
  onClose: () => void;
  onSuccess: () => void;
}

type UrgencyLevel = 'not_urgent' | 'urgent' | 'very_urgent';

export function WithdrawalForm({ profile, onClose, onSuccess }: WithdrawalFormProps) {
  const [selectedAccount, setSelectedAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('not_urgent');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedAccountDetails = profile.accounts?.find(acc => acc.id === selectedAccount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!selectedAccountDetails) {
      setError('Please select an account');
      setLoading(false);
      return;
    }

    const withdrawalAmount = parseFloat(amount);
    if (withdrawalAmount > selectedAccountDetails.current_balance) {
      setError('Withdrawal amount cannot exceed account balance');
      setLoading(false);
      return;
    }

    try {
      const { error: withdrawalError } = await supabase
        .from('withdrawal_requests')
        .insert([{
          profile_id: profile.id,
          account_id: selectedAccount,
          amount: withdrawalAmount,
          urgency_level: urgency,
          status: 'pending'
        }]);

      if (withdrawalError) throw withdrawalError;

      onSuccess();
    } catch (err) {
      console.error('Error submitting withdrawal request:', err);
      setError('Failed to submit withdrawal request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-8 max-w-md bg-white rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Request Withdrawal</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Select Account
            </label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Select an account</option>
              {profile.accounts?.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.account_name} (N$ {account.current_balance.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Amount (N$)
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {selectedAccountDetails && (
              <p className="mt-1 text-sm text-gray-500">
                Available balance: N$ {selectedAccountDetails.current_balance.toLocaleString()}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Urgency Level
            </label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="not_urgent">Not Urgent</option>
              <option value="urgent">Urgent</option>
              <option value="very_urgent">Very Urgent</option>
            </select>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Withdrawal Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}