import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface RiskMetric {
  sector: string;
  totalAmount: number;
  approvalRate: number;
  averageInterest: number;
}

export function RiskMetrics() {
  const [metrics, setMetrics] = useState<RiskMetric[]>([]);

  useEffect(() => {
    fetchRiskMetrics();
  }, []);

  const fetchRiskMetrics = async () => {
    const { data: applications } = await supabase
      .from('rff_applications')
      .select('off_taker_sector, loan_amount, interest_rate, approval_status');

    if (applications) {
      const sectorMetrics = applications.reduce((acc: Record<string, any>, app) => {
        if (!acc[app.off_taker_sector]) {
          acc[app.off_taker_sector] = {
            totalAmount: 0,
            totalApplications: 0,
            approvedApplications: 0,
            totalInterest: 0,
            approvedCount: 0
          };
        }

        acc[app.off_taker_sector].totalAmount += app.loan_amount;
        acc[app.off_taker_sector].totalApplications += 1;
        acc[app.off_taker_sector].totalInterest += app.interest_rate;

        if (app.approval_status === 'approved') {
          acc[app.off_taker_sector].approvedApplications += 1;
          acc[app.off_taker_sector].approvedCount += 1;
        }

        return acc;
      }, {});

      const metrics = Object.entries(sectorMetrics).map(([sector, data]: [string, any]) => ({
        sector,
        totalAmount: data.totalAmount,
        approvalRate: (data.approvedApplications / data.totalApplications) * 100,
        averageInterest: data.totalInterest / data.totalApplications
      }));

      setMetrics(metrics.sort((a, b) => b.totalAmount - a.totalAmount));
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Risk Metrics</h2>
      <div className="space-y-4">
        {metrics.map((metric) => (
          <div
            key={metric.sector}
            className="p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium text-gray-900">{metric.sector}</h3>
                <p className="text-sm text-gray-500">
                  Total Exposure: N$ {metric.totalAmount.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {metric.approvalRate < 50 ? (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                ) : (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                )}
                <span className={`text-sm font-medium ${
                  metric.approvalRate < 50 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {metric.approvalRate.toFixed(1)}% Approval
                </span>
              </div>
            </div>
            <div className="flex items-center mt-2">
              <AlertTriangle className={`w-4 h-4 mr-1 ${
                metric.averageInterest > 20
                  ? 'text-red-500'
                  : metric.averageInterest > 15
                  ? 'text-yellow-500'
                  : 'text-green-500'
              }`} />
              <span className="text-sm text-gray-600">
                Average Interest Rate: {metric.averageInterest.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}