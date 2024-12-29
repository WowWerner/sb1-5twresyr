import React, { useState, useEffect } from 'react';
import { Search, Calendar, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../../../lib/supabase';

interface Transaction {
  id: string;
  transaction_id: string;
  amount: number;
  transaction_type: 'funding' | 'withdrawal';
  created_at: string;
  rff_application?: {
    rff_number: string;
    client_name: string;
  };
  investor_account: {
    account_name: string;
    account_number: string;
  };
  payment_proof: {
    file_url: string;
  };
}

export function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [transactionType, setTransactionType] = useState<'all' | 'funding' | 'withdrawal'>('all');

  useEffect(() => {
    fetchTransactions();
  }, [transactionType]);

  const fetchTransactions = async () => {
    let query = supabase
      .from('transactions')
      .select(`
        *,
        rff_application:rff_applications(rff_number, client_name),
        investor_account:investor_accounts(account_name, account_number),
        payment_proof:payment_proofs(file_url)
      `);

    if (transactionType !== 'all') {
      query = query.eq('transaction_type', transactionType);
    }

    if (startDate && endDate) {
      query = query
        .gte('created_at', startDate)
        .lte('created_at', endDate);
    }

    const { data } = await query.order('created_at', { ascending: false });
    if (data) setTransactions(data);
  };

  const filteredTransactions = transactions.filter(transaction => {
    const searchString = searchTerm.toLowerCase();
    return (
      transaction.transaction_id.toLowerCase().includes(searchString) ||
      transaction.rff_application?.rff_number.toLowerCase().includes(searchString) ||
      transaction.rff_application?.client_name.toLowerCase().includes(searchString) ||
      transaction.investor_account.account_name.toLowerCase().includes(searchString) ||
      transaction.investor_account.account_number.toLowerCase().includes(searchString)
    );
  });

  const getTransactionColor = (type: string) => {
    return type === 'funding' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value as 'all' | 'funding' | 'withdrawal')}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">All Types</option>
              <option value="funding">RFF Funding</option>
              <option value="withdrawal">Withdrawals</option>
            </select>
            <input
              type="date"
              className="px-4 py-2 border rounded-lg"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="date"
              className="px-4 py-2 border rounded-lg"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <button
              onClick={fetchTransactions}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Account
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Proof
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {transaction.transaction_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`font-medium ${getTransactionColor(transaction.transaction_type)}`}>
                    {transaction.transaction_type.charAt(0).toUpperCase() + 
                     transaction.transaction_type.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  N$ {transaction.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {transaction.rff_application ? (
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {transaction.rff_application.rff_number}
                      </div>
                      <div className="text-gray-500">
                        {transaction.rff_application.client_name}
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Withdrawal</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">
                      {transaction.investor_account.account_name}
                    </div>
                    <div className="text-gray-500">
                      {transaction.investor_account.account_number}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.payment_proof?.file_url && (
                    <a
                      href={transaction.payment_proof.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View POP
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}