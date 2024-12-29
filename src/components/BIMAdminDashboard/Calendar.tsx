import React from 'react';
import { format, isBefore, addDays, parseISO, isValid } from 'date-fns';
import type { RFFApplication } from '../../types';

interface CalendarProps {
  rffApplications: RFFApplication[];
}

export function Calendar({ rffApplications }: CalendarProps) {
  const today = new Date();

  const getStatusColor = (settlementDate: string | null | undefined) => {
    if (!settlementDate) {
      return 'bg-gray-100 text-gray-800';
    }
    
    try {
      const date = parseISO(settlementDate);
      if (!isValid(date)) {
        return 'bg-gray-100 text-gray-800';
      }
      
      if (isBefore(date, today)) {
        return 'bg-red-100 text-red-800'; // Overdue
      }
      if (isBefore(date, addDays(today, 30))) {
        return 'bg-yellow-100 text-yellow-800'; // Due soon
      }
      return 'bg-green-100 text-green-800'; // Future
    } catch (error) {
      return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Settlement Calendar</h2>
      <div className="space-y-4">
        {(rffApplications || []).map((rff) => (
          <div
            key={rff.id}
            className={`p-3 rounded-md ${getStatusColor(rff.settlement_date)}`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{rff.client_name || 'Unnamed Client'}</p>
                <p className="text-sm">RFF: {rff.rff_number || 'N/A'}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  {rff.settlement_date ? format(parseISO(rff.settlement_date), 'MMM dd, yyyy') : 'No date'}
                </p>
                <p className="text-sm">
                  N$ {(rff.loan_amount || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
        {(!rffApplications || rffApplications.length === 0) && (
          <div className="text-center text-gray-500 py-4">
            No RFF applications found
          </div>
        )}
      </div>
    </div>
  );
}