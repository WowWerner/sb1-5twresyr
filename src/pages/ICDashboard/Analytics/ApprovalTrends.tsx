import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { format, subMonths } from 'date-fns';
import { supabase } from '../../../lib/supabase';

export function ApprovalTrends() {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    fetchTrendData();
  }, []);

  const fetchTrendData = async () => {
    const lastSixMonths = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), i);
      return format(date, 'yyyy-MM');
    }).reverse();

    const { data: applications } = await supabase
      .from('rff_applications')
      .select('approval_status, created_at');

    if (!applications) return;

    const monthlyData = lastSixMonths.map(month => {
      const monthApplications = applications.filter(app => 
        app.created_at.startsWith(month)
      );

      return {
        approved: monthApplications.filter(app => app.approval_status === 'approved').length,
        declined: monthApplications.filter(app => app.approval_status === 'declined').length,
        pending: monthApplications.filter(app => app.approval_status === 'pending').length
      };
    });

    setChartData({
      labels: lastSixMonths.map(month => format(new Date(month), 'MMM yyyy')),
      datasets: [
        {
          label: 'Approved',
          data: monthlyData.map(d => d.approved),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4
        },
        {
          label: 'Declined',
          data: monthlyData.map(d => d.declined),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4
        },
        {
          label: 'Pending',
          data: monthlyData.map(d => d.pending),
          borderColor: 'rgb(234, 179, 8)',
          backgroundColor: 'rgba(234, 179, 8, 0.1)',
          tension: 0.4
        }
      ]
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Approval Trends</h2>
      {chartData && (
        <div className="h-80">
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1
                  }
                }
              },
              plugins: {
                legend: {
                  position: 'top' as const
                }
              }
            }}
          />
        </div>
      )}
      <p className="mt-4 text-sm text-gray-500">
        Monthly distribution of RFF application statuses
      </p>
    </div>
  );
}