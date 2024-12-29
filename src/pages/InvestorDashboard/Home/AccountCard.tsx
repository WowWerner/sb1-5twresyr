import React from 'react';
import { TrendingUp, ArrowDownRight } from 'lucide-react';
import type { InvestorAccount } from '../../../types';

interface AccountCardProps {
  account: InvestorAccount;
}

export function AccountCard({ account }: AccountCardProps) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium text-gray-900">
          {account.account_name}
        </h3>
        <span className="text-sm text-gray-500">
          {account.account_number}
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Balance</span>
          <span className="font-medium">
            N$ {account.current_balance.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            Realised Interest
          </span>
          <div className="flex items-center">
            {account.total_realised_interest > 0 ? (
              <>
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500 font-medium">
                  {account.total_realised_interest}%
                </span>
              </>
            ) : (
              <>
                <ArrowDownRight className="w-4 h-4 text-gray-400 mr-1" />
                <span className="text-gray-500">No returns yet</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}