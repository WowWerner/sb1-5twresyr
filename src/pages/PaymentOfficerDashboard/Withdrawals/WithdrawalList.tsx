import React, { useState } from 'react';
import { format } from 'date-fns';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import type { PaymentNotification } from '../../../types';

interface WithdrawalListProps {
  payments: PaymentNotification[];
  onInitiatePayment: (payment: PaymentNotification) => void;
  onCancelPayment: (payment: PaymentNotification) => void;
}

export function WithdrawalList({ payments, onInitiatePayment, onCancelPayment }: WithdrawalListProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'very_urgent':
        return 'bg-red-100 text-red-800';
      case 'urgent':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Withdrawal Payment Requests</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="p-6 relative hover:bg-gray-50 transition-colors"
            onMouseEnter={() => setHoveredId(payment.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-4">
                {getStatusIcon(payment.status)}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                      {payment.status.toUpperCase()}
                    </span>
                    {payment.withdrawal_request?.urgency_level && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(payment.withdrawal_request.urgency_level)}`}>
                        {payment.withdrawal_request.urgency_level.replace('_', ' ').toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p className="font-medium mt-2">
                    {payment.withdrawal_request?.withdrawal_id} - {payment.withdrawal_request?.investor_profile.full_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Amount: N$ {payment.withdrawal_request?.amount.toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                {format(new Date(payment.created_at), 'MMM dd, yyyy HH:mm')}
              </p>
            </div>

            {hoveredId === payment.id && payment.status === 'pending' && (
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex space-x-2">
                <button
                  onClick={() => onInitiatePayment(payment)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Initiate Payment
                </button>
                <button
                  onClick={() => onCancelPayment(payment)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Cancel Request
                </button>
              </div>
            )}
          </div>
        ))}

        {payments.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No withdrawal requests found
          </div>
        )}
      </div>
    </div>
  );
}