import React from 'react';
import { differenceInDays } from 'date-fns';
import type { RFFApplication } from '../../types';

interface UpcomingSettlementsProps {
  rffApplications: RFFApplication[];
}

export function UpcomingSettlements({ rffApplications }: UpcomingSettlementsProps) {
  const today = new Date();
  const upcomingRFFs = rffApplications
    .filter((rff) => {
      const daysUntilSettlement = differenceInDays(
        new Date(rff.settlementDate),
        today
      );
      return daysUntilSettlement >= 0 && daysUntilSettlement <= 30;
    })
    .sort((a, b) => 
      new Date(a.settlementDate).getTime() - new Date(b.settlementDate).getTime()
    );

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">
        Upcoming Settlements (Next 30 Days)
      </h2>
      <div className="space-y-4">
        {upcomingRFFs.map((rff) => {
          const daysLeft = differenceInDays(
            new Date(rff.settlementDate),
            today
          );
          
          return (
            <div
              key={rff.id}
              className="border-l-4 border-yellow-500 pl-4 py-3"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{rff.clientName}</p>
                  <p className="text-sm text-gray-600">RFF: {rff.rffNumber}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-yellow-600">
                    {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
                  </p>
                  <p className="text-sm text-gray-600">
                    N$ {rff.loanAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}