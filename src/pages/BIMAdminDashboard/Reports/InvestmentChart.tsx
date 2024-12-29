import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { formatDateForQuery } from '../../../utils/date';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { supabase } from '../../../lib/supabase';
import { format, subMonths } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function InvestmentChart() {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    fetchInvestmentData();
  }, []);

  const fetchInvestmentData = async () => {
    const lastSixMonths = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), i);
      return formatDateForQuery(date);
    }).reverse();

    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount, created_at, transaction_type')
      .gte('created_at', `${lastSixMonths[0]}T00:00:00Z`);

    if (!transactions) return;

    const monthlyData = lastSixMonths.map(month => {
      const monthTransactions = transactions.filter(t => 
        t.created_at.startsWith(month)
      );

      const funding = monthTransactions
        .filter(t => t.transaction_type === 'funding')
        .reduce((sum, t) => sum + t.amount, 0);

      const withdrawals = monthTransactions
        .filter(t => t.transaction_type === 'withdrawal')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        funding,
        withdrawals,
        net: funding - withdrawals
      };
    });

    setChartData({
      labels: lastSixMonths.map(month => format(new Date(month), 'MMM yyyy')),
      datasets: [
        {
          label: 'Net Investment',
          data: monthlyData.map(d => d.net),
          borderColor: 'rgb(79, 70, 229)',
          tension: 0.4
        }
      ]
    });
  };

  if (!chartData) return null;

  return (
    <Line
      data={chartData}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top' as const,
            display: true,
            labels: {
              boxWidth: 12,
              padding: 15
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              callback: (value) => `N$ ${Number(value).toLocaleString()}`
            }
          },
          x: {
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          }
        }
      }}
    />
  );
}