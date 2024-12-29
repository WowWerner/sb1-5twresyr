import React from 'react';
import { Wallet, TrendingUp } from 'lucide-react';
import type { InvestorAccount } from '../../../types';

interface AccountCardProps {
  account: InvestorAccount;
}

export function AccountCard({ account }: AccountCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="bg-indigo-100 p-3 rounded-full">
          <Wallet className="h-6 w-6 text-indigo-600" />
        </div>
        <span className="text-sm text-gray-500">{account.account_number}</span>
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {account.account_name}
      </h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Current Balance</span>
          <span className="font-semibold text-gray-900">
            N$ {account.current_balance.toLocaleString()}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Total Invested</span>
          <span className="font-medium text-gray-900">
            N$ {account.total_invested.toLocaleString()}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Interest Earned</span>
          <div className="flex items-center text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span className="font-medium">{account.total_realised_interest || 0}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}