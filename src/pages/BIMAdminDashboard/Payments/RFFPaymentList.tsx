import React, { useState } from 'react';
import { format } from 'date-fns';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import type { RFFApplication } from '../../../types';
import { supabase } from '../../../lib/supabase';

interface RFFPaymentListProps {
  rffs: RFFApplication[];
  onRefresh: () => void;
}

export function RFFPaymentList({ rffs, onRefresh }: RFFPaymentListProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleInitiatePayment = async (rff: RFFApplication) => {
    try {
      // Create payment notification for payment officer
      const { error } = await supabase
        .from('payment_notifications')
        .insert([{
          type: 'rff_funding',
          rff_id: rff.id,
          status: 'pending',
          priority: rff.priority
        }]);

      if (error) throw error;
      
      alert('Payment request sent to Payment Officer');
      onRefresh();
    } catch (error) {
      console.error('Error initiating payment:', error);
      alert('Failed to initiate payment');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">RFF Payment Requests</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {rffs.map((rff) => (
          <div
            key={rff.id}
            className="p-6 relative hover:bg-gray-50 transition-colors"
            onMouseEnter={() => setHoveredId(rff.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      rff.priority === 'high' 
                        ? 'bg-red-100 text-red-800'
                        : rff.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {rff.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="font-medium mt-2">
                    {rff.rff_number} - {rff.client_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Amount: N$ {rff.loan_amount.toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                {format(new Date(rff.created_at), 'MMM dd, yyyy HH:mm')}
              </p>
            </div>

            {hoveredId === rff.id && (
              <div className="absolute right-6 top-1/2 -translate-y-1/2">
                <button
                  onClick={() => handleInitiatePayment(rff)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Initiate Payment
                </button>
              </div>
            )}
          </div>
        ))}

        {rffs.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No RFF payment requests found
          </div>
        )}
      </div>
    </div>
  );
}