import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calculator } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface ManagementFeeRecord {
  id: string;
  account_id: string;
  amount: number;
  fee_amount: number;
  month: string;
  investor_name: string;
  account_name: string;
  created_at: string;
}

export function ManagementFees() {
  const [feeRecords, setFeeRecords] = useState<ManagementFeeRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedInvestor, setSelectedInvestor] = useState('');
  const [loading, setLoading] = useState(false);

  const performManagementAssessment = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('management_fees')
        .select(`
          *,
          investor_account:investor_accounts(
            account_name,
            investor:investor_profiles(full_name)
          )
        `);

      if (selectedMonth) {
        query = query.eq('month', selectedMonth);
      }

      if (selectedInvestor) {
        query = query.eq('investor_id', selectedInvestor);
      }

      const { data } = await query;
      if (data) {
        setFeeRecords(data.map(record => ({
          id: record.id,
          account_id: record.account_id,
          amount: record.amount,
          fee_amount: record.fee_amount,
          month: record.month,
          investor_name: record.investor_account.investor.full_name,
          account_name: record.investor_account.account_name,
          created_at: record.created_at
        })));
      }
    } catch (error) {
      console.error('Error fetching management fees:', error);
      alert('Failed to fetch management fees');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Management Fees</h2>
        <p className="mt-1 text-sm text-gray-500">
          Monthly management fee assessment (1% of account balance)
        </p>
      </div>

      <div className="p-6">
        <div className="flex gap-4 mb-6">
          <input
            type="month"
            className="px-4 py-2 border rounded-lg"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
          <button
            onClick={performManagementAssessment}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            <Calculator className="w-5 h-5 mr-2" />
            {loading ? 'Processing...' : 'Perform Management Assessment'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Investor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fee Amount (1%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Charged
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {feeRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(record.month), 'MMMM yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.investor_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.account_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    N$ {record.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    N$ {record.fee_amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(record.created_at), 'MMM dd, yyyy HH:mm')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}