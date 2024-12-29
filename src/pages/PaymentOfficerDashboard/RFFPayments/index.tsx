import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { RFFPaymentList } from './RFFPaymentList';
import { PaymentModal } from './PaymentModal';
import type { PaymentNotification } from '../../../types';

export function RFFPayments() {
  const [searchParams] = useSearchParams();
  const [payments, setPayments] = useState<PaymentNotification[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentNotification | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [searchParams]);

  const fetchPayments = async () => {
    const status = searchParams.get('status') || 'pending';
    const { data } = await supabase
      .from('payment_notifications')
      .select(`
        *,
        rff_application:rff_applications(*)
      `)
      .eq('type', 'rff_funding')
      .eq('status', status)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true });

    if (data) setPayments(data);
  };

  const handleInitiatePayment = (payment: PaymentNotification) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const handleCancelPayment = async (payment: PaymentNotification) => {
    const confirmed = window.confirm('Are you sure you want to cancel this payment request?');
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('payment_notifications')
        .update({ status: 'cancelled' })
        .eq('id', payment.id);

      if (error) throw error;
      fetchPayments();
    } catch (error) {
      console.error('Error cancelling payment:', error);
      alert('Failed to cancel payment request');
    }
  };

  const handlePaymentComplete = async () => {
    setShowPaymentModal(false);
    setSelectedPayment(null);
    fetchPayments();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <RFFPaymentList
        payments={payments}
        onInitiatePayment={handleInitiatePayment}
        onCancelPayment={handleCancelPayment}
      />

      {showPaymentModal && selectedPayment && (
        <PaymentModal
          payment={selectedPayment}
          onClose={() => setShowPaymentModal(false)}
          onComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
}