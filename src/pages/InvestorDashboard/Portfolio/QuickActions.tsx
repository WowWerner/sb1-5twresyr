import React from 'react';
import { PlusCircle, ArrowDownCircle, FileText, BarChart } from 'lucide-react';
import { Link } from 'react-router-dom';

interface QuickActionsProps {
  onDeposit: () => void;
}

export function QuickActions({ onDeposit }: QuickActionsProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={onDeposit}
          className="flex flex-col items-center justify-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          <PlusCircle className="h-6 w-6 text-indigo-600 mb-2" />
          <span className="text-sm font-medium text-gray-900">Make Deposit</span>
        </button>

        <Link
          to="/investor/withdrawals"
          className="flex flex-col items-center justify-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
        >
          <ArrowDownCircle className="h-6 w-6 text-red-600 mb-2" />
          <span className="text-sm font-medium text-gray-900">Withdraw</span>
        </Link>

        <Link
          to="/investor/accounts"
          className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
        >
          <FileText className="h-6 w-6 text-green-600 mb-2" />
          <span className="text-sm font-medium text-gray-900">View Accounts</span>
        </Link>

        <Link
          to="/investor/report"
          className="flex flex-col items-center justify-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
        >
          <BarChart className="h-6 w-6 text-yellow-600 mb-2" />
          <span className="text-sm font-medium text-gray-900">View Report</span>
        </Link>
      </div>
    </div>
  );
}