import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface DepositFormProps {
  profileId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function DepositForm({ profileId, onClose, onSuccess }: DepositFormProps) {
  const [amount, setAmount] = useState('');
  const [sourceOfFunds, setSourceOfFunds] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('deposit_requests')
        .insert([{
          profile_id: profileId,
          amount: parseFloat(amount),
          source_of_funds: sourceOfFunds
        }]);

      if (error) throw error;

      onSuccess();
    } catch (error) {
      console.error('Error submitting deposit request:', error);
      alert('Failed to submit deposit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-8 max-w-md bg-white rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Make a Deposit</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Source of Funds
            </label>
            <textarea
              required
              value={sourceOfFunds}
              onChange={(e) => setSourceOfFunds(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

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
              {loading ? 'Submitting...' : 'Submit Deposit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}