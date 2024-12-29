import React from 'react';
import { Wallet, TrendingUp, ArrowDownRight } from 'lucide-react';
import type { InvestorAccount } from '../../../types';

interface AccountListProps {
  accounts: InvestorAccount[];
  selectedAccountId: string | null;
  onSelectAccount: (id: string) => void;
}

export function AccountList({ accounts, selectedAccountId, onSelectAccount }: AccountListProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Investment Accounts</h2>
        <p className="mt-1 text-sm text-gray-500">
          Select an account to view detailed information
        </p>
      </div>
      <div className="divide-y divide-gray-200">
        {accounts.map((account) => (
          <div
            key={account.id}
            onClick={() => onSelectAccount(account.id)}
            className={`p-6 cursor-pointer transition-colors ${
              selectedAccountId === account.id
                ? 'bg-indigo-50'
                : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-indigo-100 p-3 rounded-full">
                  <Wallet className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {account.account_name}
                  </h3>
                  <p className="text-sm text-gray-500">{account.account_number}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-medium text-gray-900">
                  N$ {account.current_balance.toLocaleString()}
                </p>
                <div className="flex items-center justify-end mt-1">
                  {account.total_realised_interest > 0 ? (
                    <>
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-500">
                        {account.total_realised_interest}% Return
                      </span>
                    </>
                  ) : (
                    <>
                      <ArrowDownRight className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-500">No returns yet</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}