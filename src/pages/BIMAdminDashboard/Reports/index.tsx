import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { InvestmentChart } from './InvestmentChart';
import { InterestDistributionChart } from './InterestDistributionChart';
import { MonthlyTrendsChart } from './MonthlyTrendsChart';

interface ReportData {
  totalInvestment: number;
  unsettledInvestment: number;
  realisedInterest: number;
  realisedInterestAmount: number;
  unrealisedInterest: number;
  unrealisedInterestAmount: number;
}

export function Reports() {
  const [reportData, setReportData] = useState<ReportData>({
    totalInvestment: 0,
    unsettledInvestment: 0,
    realisedInterest: 0,
    realisedInterestAmount: 0,
    unrealisedInterest: 0,
    unrealisedInterestAmount: 0
  });

  useEffect(() => {
    fetchReportData();
  }, []);
  
  const fetchReportData = async () => {
    try {
      // Fetch all RFF applications
      const { data: rffData, error: rffError } = await supabase
        .from('rff_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (rffError) throw rffError;

      // Get approved RFFs
      const approvedRFFs = rffData?.filter(rff => rff.approval_status === 'approved') || [];
      
      // Get settled RFFs
      const settledRFFs = approvedRFFs.filter(rff => rff.is_settled) || [];
      
      // Get unsettled but approved RFFs
      const unsettledRFFs = approvedRFFs.filter(rff => !rff.is_settled) || [];

      // Calculate total investment from approved RFFs
      const totalInvestment = approvedRFFs.reduce(
        (sum, rff) => sum + (rff.loan_amount || 0),
        0
      ) || 0;
      
      // Calculate unsettled investment amount
      const unsettledInvestment = unsettledRFFs?.reduce(
        (sum, rff) => sum + (rff.loan_amount || 0),
        0
      ) || 0;

      // Calculate realised interest from settled RFFs
      const realisedInterest = settledRFFs?.reduce(
        (sum, rff) => sum + (rff.bim_interest || 0),
        0
      ) || 0;

      const realisedInterestAmount = settledRFFs?.reduce(
        (sum, rff) => sum + ((rff.loan_amount || 0) * (rff.bim_interest || 0) / 100),
        0
      ) || 0;

      // Calculate unrealised interest from unsettled RFFs
      const unrealisedInterest = unsettledRFFs?.reduce(
        (sum, rff) => sum + (rff.bim_interest || 0),
        0
      ) || 0;

      const unrealisedInterestAmount = unsettledRFFs?.reduce(
        (sum, rff) => sum + ((rff.loan_amount || 0) * (rff.bim_interest || 0) / 100),
        0
      ) || 0;

      setReportData({
        totalInvestment,
        unsettledInvestment,
        realisedInterest,
        realisedInterestAmount,
        unrealisedInterest,
        unrealisedInterestAmount
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
      alert('Failed to load report data. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Investment Reports</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Investment</p>
              <p className="text-2xl font-bold text-gray-900">
                N$ {reportData.totalInvestment.toLocaleString()}
              </p>
              <div className="mt-1">
                <p className="text-xs text-gray-500">Total approved RFFs</p>
                <p className="text-sm text-yellow-600 font-medium">
                  {(((reportData.totalInvestment - reportData.unsettledInvestment) / reportData.totalInvestment) * 100).toFixed(1)}% settled
                </p>
              </div>
            </div>
            <div className="bg-indigo-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Realised Interest</p>
              <p className="text-2xl font-bold text-green-600">
                {reportData.realisedInterest.toFixed(2)}%
              </p>
              <p className="text-sm text-gray-500">
                N$ {reportData.realisedInterestAmount.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">From settled RFFs</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unrealised Interest</p>
              <p className="text-2xl font-bold text-yellow-600">
                {reportData.unrealisedInterest.toFixed(2)}%
              </p>
              <p className="text-sm text-gray-500">
                N$ {reportData.unrealisedInterestAmount.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">From approved RFFs</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <TrendingDown className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Interest</p>
              <p className="text-2xl font-bold text-indigo-600">
                {(reportData.realisedInterest + reportData.unrealisedInterest).toFixed(2)}%
              </p>
              <p className="text-sm text-gray-500">
                N$ {(reportData.realisedInterestAmount + reportData.unrealisedInterestAmount).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">Combined interest earnings</p>
            </div>
            <div className="bg-indigo-100 p-3 rounded-full">
              <PieChart className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm h-[400px]">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Investment Growth</h3>
          <div className="h-[300px]">
            <InvestmentChart />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm h-[400px]">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Interest Distribution</h3>
          <div className="h-[300px]">
            <InterestDistributionChart />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm lg:col-span-2 h-[400px]">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Trends</h3>
          <div className="h-[300px]">
            <MonthlyTrendsChart />
          </div>
        </div>
      </div>
    </div>
  );
}