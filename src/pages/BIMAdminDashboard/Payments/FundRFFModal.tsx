import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { RFFApplication, InvestorAccount } from '../../../types';

interface FundRFFModalProps {
  rff: RFFApplication;
  onClose: () => void;
  onSuccess: () => void;
}

interface InvestorAccountWithSelection extends InvestorAccount {
  isSelected: boolean;
}

export function FundRFFModal({ rff, onClose, onSuccess }: FundRFFModalProps) {
  const [step, setStep] = useState(1);
  const [accounts, setAccounts] = useState<InvestorAccountWithSelection[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInvestorAccounts();
  }, []);

  const fetchInvestorAccounts = async () => {
    const { data } = await supabase
      .from('investor_accounts')
      .select('*, investor_profiles(*)');

    if (data) {
      setAccounts(data.map(account => ({ ...account, isSelected: true })));
    }
  };

  const handleToggleAccount = (accountId: string) => {
    setAccounts(prev =>
      prev.map(account =>
        account.id === accountId
          ? { ...account, isSelected: !account.isSelected }
          : account
      )
    );
  };

  const calculateInvestmentAmount = (selectedAccounts: InvestorAccountWithSelection[]) => {
    const percentagePerAccount = 100 / selectedAccounts.length;
    return rff.loanAmount * (percentagePerAccount / 100);
  };

  const handleSendPaymentInstruction = async () => {
    setLoading(true);
    try {
      const selectedAccounts = accounts.filter(a => a.isSelected);
      const investmentAmount = calculateInvestmentAmount(selectedAccounts);
      const interestPerAccount = rff.bimInterest / selectedAccounts.length;

      // Create funding records and update account balances
      const fundingPromises = selectedAccounts.map(account => {
        return supabase.from('rff_funding').insert({
          rff_id: rff.id,
          account_id: account.id,
          amount: investmentAmount,
          interest_rate: interestPerAccount,
          status: 'pending'
        });
      });

      await Promise.all(fundingPromises);

      // Notify payment officer (in a real app, this would trigger a notification)
      await supabase.from('payment_notifications').insert({
        type: 'rff_funding',
        rff_id: rff.id,
        status: 'pending'
      });

      onSuccess();
    } catch (error) {
      console.error('Error processing RFF funding:', error);
      alert('Failed to process RFF funding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-8 max-w-4xl bg-white rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Fund RFF: {rff.rffNumber}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step === 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200'
            }`}>
              1
            </div>
            <div className="w-16 h-1 bg-gray-200">
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step === 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200'
            }`}>
              2
            </div>
          </div>
        </div>

        {step === 1 ? (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Select Investor Accounts
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{account.account_name}</p>
                    <p className="text-sm text-gray-500">
                      Balance: N$ {account.current_balance.toLocaleString()}
                    </p>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={account.isSelected}
                      onChange={() => handleToggleAccount(account.id)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </label>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Review and Confirm
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
                  <dd className="mt-1 text-lg font-medium text-gray-900">
                    N$ {rff.loanAmount.toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Selected Accounts</dt>
                  <dd className="mt-1 text-lg font-medium text-gray-900">
                    {accounts.filter(a => a.isSelected).length}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Amount per Account</dt>
                  <dd className="mt-1 text-lg font-medium text-gray-900">
                    N$ {calculateInvestmentAmount(accounts.filter(a => a.isSelected)).toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Interest per Account</dt>
                  <dd className="mt-1 text-lg font-medium text-gray-900">
                    {(rff.bimInterest / accounts.filter(a => a.isSelected).length).toFixed(2)}%
                  </dd>
                </div>
              </dl>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleSendPaymentInstruction}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Send Payment Instruction'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}