import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { supabase } from '../../../lib/supabase';

export function SectorDistribution() {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    fetchSectorData();
  }, []);

  const fetchSectorData = async () => {
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
      const total = amounts.reduce((a, b) => a + b, 0);
      const percentages = amounts.map(amount => (amount / total) * 100);

      setChartData({
        labels: sectors,
        datasets: [{
          label: 'Portfolio Distribution (%)',
          data: percentages,
          backgroundColor: [
            'rgba(59, 130, 246, 0.5)',
            'rgba(16, 185, 129, 0.5)',
            'rgba(245, 158, 11, 0.5)',
            'rgba(239, 68, 68, 0.5)',
            'rgba(139, 92, 246, 0.5)'
          ],
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(16, 185, 129)',
            'rgb(245, 158, 11)',
            'rgb(239, 68, 68)',
            'rgb(139, 92, 246)'
          ],
          borderWidth: 1
        }]
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Sector Distribution</h2>
      {chartData && (
        <div className="h-80">
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value) => `${value}%`
                  }
                }
              },
              plugins: {
                legend: {
                  display: false
                },
                tooltip: {
                  callbacks: {
                    label: (context) => `${context.parsed.y.toFixed(1)}%`
                  }
                }
              }
            }}
          />
        </div>
      )}
      <p className="mt-4 text-sm text-gray-500">
        Percentage distribution of approved RFFs by sector
      </p>
    </div>
  );
}