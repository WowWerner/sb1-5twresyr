import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { supabase } from '../../../lib/supabase';

export function RiskAnalysis() {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    fetchRiskData();
  }, []);

  const fetchRiskData = async () => {
    const { data: applications } = await supabase
      .from('rff_applications')
      .select('off_taker_sector, loan_amount')
      .eq('approval_status', 'approved');

    if (applications) {
      const sectorData = applications.reduce((acc: Record<string, number>, app) => {
        acc[app.off_taker_sector] = (acc[app.off_taker_sector] || 0) + app.loan_amount;
        return acc;
      }, {});

      const sectors = Object.keys(sectorData);
      const amounts = Object.values(sectorData);

      setChartData({
        labels: sectors,
        datasets: [{
          data: amounts,
          backgroundColor: [
            'rgba(59, 130, 246, 0.5)', // blue
            'rgba(16, 185, 129, 0.5)', // green
            'rgba(245, 158, 11, 0.5)', // yellow
            'rgba(239, 68, 68, 0.5)',  // red
            'rgba(139, 92, 246, 0.5)', // purple
          ],
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(16, 185, 129)',
            'rgb(245, 158, 11)',
            'rgb(239, 68, 68)',
            'rgb(139, 92, 246)',
          ],
          borderWidth: 1
        }]
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Sector Risk Analysis</h2>
      {chartData && (
        <div className="relative h-64">
          <Doughnut
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'right',
                  labels: {
                    boxWidth: 12,
                    padding: 15
                  }
                },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const value = context.raw as number;
                      const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
                      const percentage = ((value / total) * 100).toFixed(1);
                      return `N$ ${value.toLocaleString()} (${percentage}%)`;
                    }
                  }
                }
              }
            }}
          />
        </div>
      )}
      <p className="mt-4 text-sm text-gray-500">
        Distribution of approved RFFs by off-taker sector
      </p>
    </div>
  );
}