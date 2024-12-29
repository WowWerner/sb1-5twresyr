import React, { useState } from 'react';
import { format } from 'date-fns';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import type { WithdrawalRequest } from '../../../types';

interface WithdrawalListProps {
  withdrawals: WithdrawalRequest[];
  onInitiatePayment: (withdrawal: WithdrawalRequest) => void;
  onCancelPayment: (withdrawal: WithdrawalRequest) => void;
}

export function WithdrawalList({ withdrawals, onInitiatePayment, onCancelPayment }: WithdrawalListProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-500" />;
      case 'processed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Withdrawal Payment Requests</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {withdrawals.map((withdrawal) => (
          <div
            key={withdrawal.id}
            className="p-6 relative hover:bg-gray-50 transition-colors"
            onMouseEnter={() => setHoveredId(withdrawal.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-4">
                {getStatusIcon(withdrawal.status)}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(withdrawal.status)}`}>
                      {withdrawal.status.toUpperCase()}
                    </span>
                    {withdrawal.urgency_level && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(withdrawal.urgency_level)}`}>
                        {withdrawal.urgency_level.replace('_', ' ').toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p className="font-medium mt-2">
                    {withdrawal.withdrawal_id} - {withdrawal.investor_profile?.full_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Amount: N$ {withdrawal.amount.toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                {format(new Date(withdrawal.created_at), 'MMM dd, yyyy HH:mm')}
              </p>
            </div>

            {hoveredId === withdrawal.id && withdrawal.status === 'pending' && (
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex space-x-2">
                <button
                  onClick={() => onInitiatePayment(withdrawal)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Initiate Payment
                </button>
                <button
                  onClick={() => onCancelPayment(withdrawal)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Cancel Request
                </button>
              </div>
            )}
          </div>
        ))}

        {withdrawals.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No withdrawal requests found
          </div>
        )}
      </div>
    </div>
  );
}