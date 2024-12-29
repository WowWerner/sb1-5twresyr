import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '../../../lib/supabase';
import { Line } from 'react-chartjs-2';
import { TrendingUp, ArrowDownCircle } from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  transaction_type: 'funding' | 'withdrawal';
  created_at: string;
}

interface Interest {
  id: string;
  interest_amount: number;
  interest_rate: number;
  date: string;
}

interface AccountDetailsProps {
  accountId: string;
  onUpdate: () => void;
}

export function AccountDetails({ accountId, onUpdate }: AccountDetailsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [interest, setInterest] = useState<Interest[]>([]);
  const [balanceHistory, setBalanceHistory] = useState<any>(null);

  useEffect(() => {
    fetchTransactions();
    fetchInterest();
    fetchBalanceHistory();
  }, [accountId]);

  const fetchTransactions = async () => {
    console.log('Fetching transactions for account:', accountId);
    const { data } = await supabase
      .from('transactions')
      .select(`
        id,
        amount,
        transaction_type,
        created_at,
        transaction_id
      `)
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });

    if (data) {
      console.log('Found transactions:', data);
      setTransactions(data);
    }
  };

  const fetchInterest = async () => {
    console.log('Fetching interest for account:', accountId);
    const { data } = await supabase
      .from('account_interest')
      .select(`
        id,
        interest_amount,
        interest_rate,
        date,
        created_at
      `)
      .eq('account_id', accountId)
      .order('date', { ascending: false });

    if (data) {
      console.log('Found interest records:', data);
      setInterest(data);
    }
  };

  const fetchBalanceHistory = async () => {
    // Implement balance history chart data calculation
    // This would combine transactions and interest to show account growth
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Account Details</h2>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Recent Transactions
            </h3>
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    {transaction.transaction_type === 'funding' ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
                    ) : (
                      <ArrowDownCircle className="w-4 h-4 text-red-500 mr-2" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {transaction.transaction_type === 'funding'
                          ? 'Deposit'
                          : 'Withdrawal'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(
                          new Date(transaction.created_at),
                          'MMM dd, yyyy'
                        )}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      transaction.transaction_type === 'funding'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {transaction.transaction_type === 'funding' ? '+' : '-'}
                    N$ {transaction.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Interest History
            </h3>
            <div className="space-y-3">
              {interest.slice(0, 5).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {entry.interest_rate}% Interest
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(entry.date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-green-600">
                    +N$ {entry.interest_amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {balanceHistory && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">
              Balance History
            </h3>
            <Line
              data={balanceHistory}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => `N$ ${value}`
                    }
                  }
                }
              }}
              height={300}
            />
          </div>
        )}
      </div>
    </div>
  );
}