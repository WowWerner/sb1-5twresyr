import React from 'react';
import { ManagementFees } from './ManagementFees';
import { PerformanceAnalysis } from './PerformanceAnalysis';

export function Management() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        <ManagementFees />
        <PerformanceAnalysis />
      </div>
    </div>
  );
}