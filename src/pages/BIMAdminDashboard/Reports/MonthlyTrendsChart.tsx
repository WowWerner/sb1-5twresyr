import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { formatDateForQuery } from '../../../utils/date';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { supabase } from '../../../lib/supabase';
import { format, subMonths } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export function MonthlyTrendsChart() {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    fetchMonthlyData();
  }, []);

  const fetchMonthlyData = async () => {
    const lastSixMonths = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), i);
      return formatDateForQuery(date);
    }).reverse();

    const { data: rffs } = await supabase
      .from('rff_applications')
      .select('*')
      .gte('created_at', `${lastSixMonths[0]}T00:00:00Z`);

    if (!rffs) return;

    const monthlyData = lastSixMonths.map(month => {
      const monthRFFs = rffs.filter(rff => 
        rff.created_at.startsWith(month)
      );

      return {
        approved: monthRFFs.filter(rff => rff.approval_status === 'approved').length,
        pending: monthRFFs.filter(rff => rff.approval_status === 'pending').length,
        declined: monthRFFs.filter(rff => rff.approval_status === 'declined').length
      };
    });

    setChartData({
      labels: lastSixMonths.map(month => format(new Date(month), 'MMM yyyy')),
      datasets: [
        {
          label: 'Approved',
          data: monthlyData.map(d => d.approved),
          backgroundColor: 'rgba(34, 197, 94, 0.5)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1
        },
        {
          label: 'Pending',
          data: monthlyData.map(d => d.pending),
          backgroundColor: 'rgba(234, 179, 8, 0.5)',
          borderColor: 'rgb(234, 179, 8)',
          borderWidth: 1
        },
        {
          label: 'Declined',
          data: monthlyData.map(d => d.declined),
          backgroundColor: 'rgba(239, 68, 68, 0.5)',
          borderColor: 'rgb(239, 68, 68)',
          borderWidth: 1
        }
      ]
    });
  };

  if (!chartData) return null;

  return (
    <Bar
      data={chartData}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top' as const
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }}
      height={300}
    />
  );
}