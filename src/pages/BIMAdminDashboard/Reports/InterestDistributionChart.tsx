import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { supabase } from '../../../lib/supabase';

ChartJS.register(ArcElement, Tooltip, Legend);

export function InterestDistributionChart() {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    fetchInterestData();
  }, []);

  const fetchInterestData = async () => {
    const { data: rffs } = await supabase
      .from('rff_applications')
      .select('bim_interest, loan_amount, is_settled')
      .eq('approval_status', 'approved');

    if (!rffs) return;

    const realisedInterest = rffs
      .filter(rff => rff.is_settled)
      .reduce((sum, rff) => sum + (rff.loan_amount * rff.bim_interest / 100), 0);

    const unrealisedInterest = rffs
      .filter(rff => !rff.is_settled)
      .reduce((sum, rff) => sum + (rff.loan_amount * rff.bim_interest / 100), 0);

    setChartData({
      labels: ['Realised Interest', 'Unrealised Interest'],
      datasets: [
        {
          data: [realisedInterest, unrealisedInterest],
          backgroundColor: [
            'rgba(34, 197, 94, 0.2)',
            'rgba(234, 179, 8, 0.2)'
          ],
          borderColor: [
            'rgb(34, 197, 94)',
            'rgb(234, 179, 8)'
          ],
          borderWidth: 1
        }
      ]
    });
  };

  if (!chartData) return null;

  return (
    <Doughnut
      data={chartData}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top' as const
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.raw as number;
                return `N$ ${value.toLocaleString()}`;
              }
            }
          }
        }
      }}
      height={300}
    />
  );
}