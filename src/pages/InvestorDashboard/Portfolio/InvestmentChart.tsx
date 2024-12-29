import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
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
  Legend,
  Filler
);

interface InvestmentChartProps {
  profileId: string;
}

export function InvestmentChart({ profileId }: InvestmentChartProps) {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    fetchInvestmentData();
  }, [profileId]);

  const fetchInvestmentData = async () => {
    const lastSixMonths = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), i);
      return format(date, 'yyyy-MM');
    }).reverse();

    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount, created_at, transaction_type')
      .in('account_id', await getAccountIds())
      .gte('created_at', `${lastSixMonths[0]}-01`);

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

      return funding - withdrawals;
    });

    setChartData({
      labels: lastSixMonths.map(month => format(new Date(month), 'MMM yyyy')),
      datasets: [{
        label: 'Portfolio Growth',
        data: monthlyData,
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        fill: true,
        tension: 0.4
      }]
    });
  };

  const getAccountIds = async () => {
    const { data: accounts } = await supabase
      .from('investor_accounts')
      .select('id')
      .eq('profile_id', profileId);

    return accounts?.map(acc => acc.id) || [];
  };

  if (!chartData) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Growth</h2>
      <div className="h-[300px]">
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                callbacks: {
                  label: (context) => `N$ ${context.raw as number}`
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: (value) => `N$ ${value}`
                }
              }
            }
          }}
        />
      </div>
    </div>
  );
}