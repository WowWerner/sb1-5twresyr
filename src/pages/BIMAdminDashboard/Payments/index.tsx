import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { supabase } from '../../../lib/supabase';
import { RFFPaymentList } from './RFFPaymentList';
import { WithdrawalList } from './WithdrawalList';
import { PaymentModal } from './PaymentModal';
import type { RFFApplication, WithdrawalRequest } from '../../../types';

export function Payments() {
  const [activeTab, setActiveTab] = useState('rffs');
  const [rffs, setRFFs] = useState<RFFApplication[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch approved RFFs that haven't been funded
      const { data: rffData } = await supabase
        .from('rff_applications')
        .select('*')
        .eq('approval_status', 'approved')
        .eq('is_funded', false)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true });

      if (rffData) setRFFs(rffData);

      // Fetch pending withdrawals
      const { data: withdrawalData } = await supabase
        .from('withdrawal_requests')
        .select(`
          *,
          investor_profile:investor_profiles(
            full_name
          ),
          account:investor_accounts(
            account_name,
            account_number
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (withdrawalData) setWithdrawals(withdrawalData);
    } catch (error) {
      console.error('Error fetching payment data:', error);
      alert('Failed to load payment requests');
    }
  };

  const handleInitiatePayment = (withdrawal: WithdrawalRequest) => {
    setSelectedWithdrawal(withdrawal);
    setShowPaymentModal(true);
  };

  const handleCancelPayment = async (withdrawal: WithdrawalRequest) => {
    const confirmed = window.confirm('Are you sure you want to cancel this payment request?');
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('withdrawal_requests')
        .update({ status: 'cancelled' })
        .eq('id', withdrawal.id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error cancelling payment:', error);
      alert('Failed to cancel payment request');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="sm:hidden">
          <select
            className="block w-full rounded-md border-gray-300"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
          >
            <option value="rffs">RFF Payments</option>
            <option value="withdrawals">Withdrawal Payments</option>
          </select>
        </div>
        <div className="hidden sm:block">
          <nav className="flex space-x-4" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('rffs')}
              className={`${
                activeTab === 'rffs'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              } px-3 py-2 font-medium text-sm rounded-md`}
            >
              RFF Payments
            </button>
            <button
              onClick={() => setActiveTab('withdrawals')}
              className={`${
                activeTab === 'withdrawals'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              } px-3 py-2 font-medium text-sm rounded-md`}
            >
              Withdrawal Payments
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'rffs' ? (
        <RFFPaymentList rffs={rffs} onRefresh={fetchData} />
      ) : (
        <WithdrawalList
          withdrawals={withdrawals}
          onInitiatePayment={handleInitiatePayment}
          onCancelPayment={handleCancelPayment}
        />
      )}

      {showPaymentModal && selectedWithdrawal && (
        <PaymentModal
          withdrawal={selectedWithdrawal}
          onClose={() => setShowPaymentModal(false)}
          onComplete={() => {
            setShowPaymentModal(false);
            setSelectedWithdrawal(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
}