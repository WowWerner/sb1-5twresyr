import React from 'react';
import { TrendingUp, Wallet, ArrowDownRight, PieChart } from 'lucide-react';
import type { InvestorAccount } from '../../../types';

interface PerformanceMetricsProps {
  accounts: InvestorAccount[];
}

export function PerformanceMetrics({ accounts }: PerformanceMetricsProps) {
  const totalInvestment = accounts.reduce((sum, acc) => sum + acc.current_balance, 0);
  const totalInvested = accounts.reduce((sum, acc) => sum + acc.total_invested, 0);
  const totalWithdrawn = accounts.reduce((sum, acc) => sum + acc.total_withdrawn, 0);
  const averageReturn = accounts.reduce((sum, acc) => sum + (acc.total_realised_interest || 0), 0) / accounts.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Current Balance</p>
            <p className="text-2xl font-bold text-gray-900">
              N$ {totalInvestment.toLocaleString()}
            </p>
          </div>
          <div className="bg-indigo-100 p-3 rounded-full">
            <Wallet className="h-6 w-6 text-indigo-600" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Invested</p>
            <p className="text-2xl font-bold text-green-600">
              N$ {totalInvested.toLocaleString()}
            </p>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Withdrawn</p>
            <p className="text-2xl font-bold text-red-600">
              N$ {totalWithdrawn.toLocaleString()}
            </p>
          </div>
          <div className="bg-red-100 p-3 rounded-full">
            <ArrowDownRight className="h-6 w-6 text-red-600" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Average Return</p>
            <p className="text-2xl font-bold text-indigo-600">
              {averageReturn.toFixed(2)}%
            </p>
          </div>
          <div className="bg-indigo-100 p-3 rounded-full">
            <PieChart className="h-6 w-6 text-indigo-600" />
          </div>
        </div>
      </div>
    </div>
  );
}