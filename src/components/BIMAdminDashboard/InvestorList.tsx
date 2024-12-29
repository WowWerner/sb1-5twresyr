import React, { useState } from 'react';
import { User, ChevronRight } from 'lucide-react';
import type { InvestorProfile } from '../../types';
import { InvestorDetails } from './InvestorDetails';

interface InvestorListProps {
  investors: InvestorProfile[];
  onRefresh: () => void;
}

export function InvestorList({ investors, onRefresh }: InvestorListProps) {
  const [selectedInvestor, setSelectedInvestor] = useState<InvestorProfile | null>(null);

  return (
    <>
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {investors.map((investor) => (
            <li
              key={investor.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => setSelectedInvestor(investor)}
            >
              <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-indigo-100 p-2 rounded-full">
                    <User className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {investor.full_name}
                    </h3>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <span>{investor.investor_user?.email}</span>
                      <span>•</span>
                      <span>ID: {investor.id_number}</span>
                      <span>•</span>
                      <span>{investor.accounts?.length || 0} accounts</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </li>
          ))}
        </ul>
      </div>

      {selectedInvestor && (
        <InvestorDetails
          investor={selectedInvestor}
          onClose={() => setSelectedInvestor(null)}
          onRefresh={onRefresh}
        />
      )}
    </>
  );
}