import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface PaymentNotification {
  id: string;
  type: 'rff_funding' | 'withdrawal';
  status: string;
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

export function RecentPayments() {
  const [payments, setPayments] = useState<PaymentNotification[]>([]);

  useEffect(() => {
    fetchRecentPayments();
  }, []);

  const fetchRecentPayments = async () => {
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
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) setPayments(data);
  };

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

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Payment Requests</h2>
      <div className="space-y-4">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-4">
              {getStatusIcon(payment.status)}
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                    {payment.status.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500">
                    {payment.type === 'rff_funding' ? 'RFF Payment' : 'Withdrawal'}
                  </span>
                </div>
                <p className="font-medium mt-1">
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
            </div>
            <div className="text-right text-sm text-gray-500">
              {format(new Date(payment.created_at), 'MMM dd, yyyy HH:mm')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}