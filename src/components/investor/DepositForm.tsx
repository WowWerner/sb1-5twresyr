import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface DepositFormProps {
  profileId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function DepositForm({ profileId, onClose, onSuccess }: DepositFormProps) {
  const [amount, setAmount] = useState('');
  const [sourceOfFunds, setSourceOfFunds] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileId) {
      setError('Your profile is not properly configured. Please contact support.');
      return;
    }

    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      setError('Please enter a valid deposit amount greater than 0');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: depositError } = await supabase
        .from('deposit_requests')
        .insert([{
          profile_id: profileId,
          amount: depositAmount,
          source_of_funds: sourceOfFunds,
          status: 'pending'
        }]);

      if (depositError) {
        if (depositError.code === '23503') {
          throw new Error('Invalid profile. Please contact support.');
        }
        throw depositError;
      }

      onSuccess();
    } catch (error) {
      console.error('Error submitting deposit request:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit deposit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-8 max-w-md bg-white rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Request Deposit</h2>
          <button 
            onClick={onClose}
            type="button"
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter amount"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Source of Funds
            </label>
            <input
              type="text"
              required
              value={sourceOfFunds}
              onChange={(e) => setSourceOfFunds(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="e.g., Salary, Business Income"
            />
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
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}