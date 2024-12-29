import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isToday, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { RFFApplication } from '../../types';

interface SettlementCalendarProps {
  rffApplications: RFFApplication[];
}

export function SettlementCalendar({ rffApplications }: SettlementCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getSettlementsForDay = (date: Date) => {
    return rffApplications.filter(rff => 
      isSameDay(new Date(rff.settlement_date), date)
    );
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <div className="w-full">
      {/* Calendar Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <span className="mx-4 font-medium text-gray-900">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Next month"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="w-full">
        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden shadow-sm">
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="bg-gray-50 py-2 text-center">
              <span className="text-sm font-medium text-gray-500">{day}</span>
            </div>
          ))}

          {/* Calendar Days */}
          {days.map((day, dayIdx) => {
            const settlements = getSettlementsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isCurrentDay = isToday(day);
            
            return (
              <div
                key={day.toString()}
                className={`min-h-[120px] relative bg-white p-2 border-t border-l first:border-l-0 ${
                  dayIdx < 7 ? '' : '-mt-px'
                } ${!isCurrentMonth ? 'bg-gray-50' : ''} hover:bg-gray-50 transition-colors`}
              >
                <header className="flex items-center justify-between">
                  <p className={`text-sm ${
                    isCurrentMonth 
                      ? isCurrentDay
                        ? 'text-blue-600 font-bold'
                        : 'text-gray-900'
                      : 'text-gray-400'
                  }`}>
                    {format(day, 'd')}
                  </p>
                  {settlements.length > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-50 text-xs text-indigo-600 font-medium">
                      {settlements.length}
                    </span>
                  )}
                </header>
                
                <div className="mt-2 space-y-1 max-h-[80px] overflow-y-auto scrollbar-thin">
                  {settlements.map(settlement => (
                    <div
                      key={settlement.id}
                      className="px-2 py-1 text-xs rounded-md bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-indigo-700 truncate" title={settlement.client_name}>
                          {settlement.client_name}
                        </span>
                      </div>
                      <div className="text-indigo-600 font-medium mt-0.5">
                        N$ {settlement.loan_amount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}