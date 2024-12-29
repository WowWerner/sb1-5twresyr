import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { AlertTriangle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface PriorityPayment {
  id: string;
  type: 'rff_funding' | 'withdrawal';
  priority: string;
  created_at: string;
  rff_application?: {
    rff_number: string;
    client_name: string;
    loan_amount: number;
  };
  withdrawal_request?: {
    withdrawal_id: string;
    amount: number;
    investor_profile: {
      full_name: string;
    };
  };
}

export function PriorityPayments() {
  const [payments, setPayments] = useState<PriorityPayment[]>([]);

  useEffect(() => {
    fetchPriorityPayments();
  }, []);

  const fetchPriorityPayments = async () => {
    const { data } = await supabase
      .from('payment_notifications')
      .select(`
        *,
        rff_application:rff_applications(*),
        withdrawal_request:withdrawal_requests(
          *,
          investor_profile:investor_profiles(*)
        )
      `)
      .eq('status', 'pending')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(5);

    if (data) setPayments(data);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center mb-4">
        <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">Priority Payments</h2>
      </div>
      <div className="space-y-4">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(payment.priority)}`}>
                  {payment.priority.toUpperCase()} PRIORITY
                </span>
                <p className="font-medium mt-2">
                  {payment.type === 'rff_funding'
                    ? `${payment.rff_application?.rff_number} - ${payment.rff_application?.client_name}`
                    : `${payment.withdrawal_request?.withdrawal_id} - ${payment.withdrawal_request?.investor_profile.full_name}`}
                </p>
                <p className="text-sm text-gray-500">
                  Amount: N$ {(
                    payment.type === 'rff_funding'
                      ? payment.rff_application?.loan_amount
                      : payment.withdrawal_request?.amount
                  )?.toLocaleString()}
                </p>
              </div>
              <p className="text-sm text-gray-500">
                {format(new Date(payment.created_at), 'MMM dd, yyyy HH:mm')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}