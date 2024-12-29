import React from 'react';
import { ApprovalTrends } from './ApprovalTrends';
import { SectorDistribution } from './SectorDistribution';
import { RiskMetrics } from './RiskMetrics';

export function Analytics() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <ApprovalTrends />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectorDistribution />
          <RiskMetrics />
        </div>
      </div>
    </div>
  );
}