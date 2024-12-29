import React, { useState } from 'react';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface PerformanceRecord {
  id: string;
  account_id: string;
  investor_name: string;
  account_name: string;
  total_interest: number;
  over_performance: number;
  fee_amount: number;
  current_balance: number;
}

export function PerformanceAnalysis() {
  const [performanceRecords, setPerformanceRecords] = useState<PerformanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const analyzePerformance = async () => {
    setLoading(true);
    try {
      const { data: accounts } = await supabase
        .from('investor_accounts')
        .select(`
          *,
          investor:investor_profiles(full_name)
        `);

      if (!accounts) return;

      const overPerformingAccounts = accounts
        .filter(account => {
          const totalInterest = account.total_realised_interest || 0;
          return totalInterest > 20;
        })
        .map(account => ({
          id: account.id,
          account_id: account.id,
          investor_name: account.investor.full_name,
          account_name: account.account_name,
          total_interest: account.total_realised_interest || 0,
          over_performance: (account.total_realised_interest || 0) - 20,
          fee_amount: ((account.total_realised_interest || 0) - 20) * 0.2 * account.current_balance / 100,
          current_balance: account.current_balance
        }));

      setPerformanceRecords(overPerformingAccounts);
    } catch (error) {
      console.error('Error analyzing performance:', error);
      alert('Failed to analyze performance');
    } finally {
      setLoading(false);
    }
  };

  const processPerformanceFees = async () => {
    setProcessing(true);
    try {
      for (const record of performanceRecords) {
        // Create performance fee record
        const { error: feeError } = await supabase
          .from('performance_fees')
          .insert({
            account_id: record.account_id,
            amount: record.fee_amount,
            over_performance_percentage: record.over_performance,
            account_balance: record.current_balance
          });

        if (feeError) throw feeError;

        // Update account balance
        const { error: updateError } = await supabase
          .from('investor_accounts')
          .update({
            current_balance: record.current_balance - record.fee_amount
          })
          .eq('id', record.account_id);

        if (updateError) throw updateError;
      }

      alert('Performance fees processed successfully');
      setPerformanceRecords([]);
    } catch (error) {
      console.error('Error processing performance fees:', error);
      alert('Failed to process performance fees');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Performance Analysis</h2>
        <p className="mt-1 text-sm text-gray-500">
          Analyze accounts with over 20% realized interest performance
        </p>
      </div>

      <div className="p-6">
        <div className="flex gap-4 mb-6">
          <button
            onClick={analyzePerformance}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            {loading ? 'Analyzing...' : 'Analyze Investment Performance'}
          </button>
        </div>

        {performanceRecords.length > 0 && (
          <>
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                <p className="text-sm text-yellow-600">
                  Found {performanceRecords.length} accounts with over-performance
                </p>
              </div>
            </div>

            <div className="overflow-x-auto mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Investor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Interest
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Over Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fee Amount (20%)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {performanceRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.investor_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.account_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.total_interest.toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.over_performance.toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        N$ {record.fee_amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button
                onClick={processPerformanceFees}
                disabled={processing}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Action Performance Fees'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}