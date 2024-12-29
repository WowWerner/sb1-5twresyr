import React, { useState } from 'react';
import { format } from 'date-fns';
import { supabase } from '../../../lib/supabase';
import { FundRFFModal } from './FundRFFModal';
import type { RFFApplication } from '../../../types';

interface RFFListProps {
  rffs: RFFApplication[];
  onUpdate: () => void;
}

export function RFFList({ rffs, onUpdate }: RFFListProps) {
  const [selectedRFF, setSelectedRFF] = useState<RFFApplication | null>(null);

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              RFF Number
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Client
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Interest Rate
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Settlement Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rffs.map((rff) => (
            <tr key={rff.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {rff.rffNumber}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {rff.clientName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                N$ {rff.loanAmount.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {rff.interestRate}%
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {format(new Date(rff.settlementDate), 'MMM dd, yyyy')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button
                  onClick={() => setSelectedRFF(rff)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Fund RFF
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedRFF && (
        <FundRFFModal
          rff={selectedRFF}
          onClose={() => setSelectedRFF(null)}
          onSuccess={() => {
            setSelectedRFF(null);
            onUpdate();
          }}
        />
      )}
    </div>
  );
}