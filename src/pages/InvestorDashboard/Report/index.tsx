import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { format } from 'date-fns';
import type { InvestorProfile } from '../../../types';

interface ReportProps {
  investorUser: InvestorAuthUser;
}

export function Report({ investorUser, onError }: ReportProps) {
  const [profile, setProfile] = useState<InvestorProfile | null>(null);
  const [reportData, setReportData] = useState({
    totalInvestment: 0,
    totalInterestEarned: 0,
    realisedInterest: 0,
    unrealisedInterest: 0,
    managementFees: 0
  });

  useEffect(() => {
    fetchProfileAndReportData();
  }, [investorUser.id]);

  const fetchProfileAndReportData = async () => {
    // Fetch profile data
    const { data: profileData } = await supabase
      .from('investor_profiles')
      .select(`
        *,
        accounts:investor_accounts(*)
      `)
      .eq('investor_user_id', investorUser.id)
      .single();

    if (profileData) {
      setProfile(profileData);

      // Calculate totals
      const accounts = profileData.accounts || [];
      const totalInvestment = accounts.reduce((sum, acc) => sum + acc.current_balance, 0);
      const realisedInterest = accounts.reduce((sum, acc) => sum + (acc.total_realised_interest || 0), 0);

      // Fetch management fees
      const { data: fees } = await supabase
        .from('management_fees')
        .select('fee_amount')
        .in('account_id', accounts.map(acc => acc.id));

      const totalFees = fees?.reduce((sum, fee) => sum + fee.fee_amount, 0) || 0;

      setReportData({
        totalInvestment,
        totalInterestEarned: (totalInvestment * realisedInterest) / 100,
        realisedInterest,
        unrealisedInterest: 0, // This would need to be calculated based on your business logic
        managementFees: totalFees
      });
    }
  };

  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Report Header */}
        <div className="p-8 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <img
                src="https://static.wixstatic.com/media/983a76_2174f1130939402ea493875add582142~mv2.png/v1/fill/w_186,h_112,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Bellatrix%20INVESTMENT%20MANAGERS%20logo-01.png"
                alt="Bellatrix Investment Managers"
                className="h-16 object-contain mb-4"
              />
              <div className="text-sm text-gray-500">
                <p>+264 61 256 521 | +264 81 282 8334</p>
                <p>admin@bellatrixinvest.com</p>
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-bold text-gray-900">
                Investment Report
              </h1>
              <p className="text-gray-500">
                Generated on {format(new Date(), 'MMMM dd, yyyy')}
              </p>
            </div>
          </div>
        </div>

        {/* Investor Details */}
        <div className="p-8 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Investor Details
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{profile.full_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Contact Number</p>
              <p className="font-medium">{profile.phone_number}</p>
            </div>
          </div>
        </div>

        {/* Investment Summary */}
        <div className="p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Investment Summary
          </h2>
          
          <div className="space-y-6">
            {/* Total Investment */}
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Total Investment</p>
                <p className="text-sm text-gray-500">Current value of all accounts</p>
              </div>
              <p className="text-xl font-bold text-gray-900">
                N$ {reportData.totalInvestment.toLocaleString()}
              </p>
            </div>

            {/* Interest Earned */}
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Total Interest Earned</p>
                <p className="text-sm text-gray-500">Total monetary value of interest</p>
              </div>
              <p className="text-xl font-bold text-green-600">
                N$ {reportData.totalInterestEarned.toLocaleString()}
              </p>
            </div>

            {/* Realised Interest */}
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Realised Interest</p>
                <p className="text-sm text-gray-500">Interest gained and settled</p>
              </div>
              <p className="text-xl font-bold text-green-600">
                {reportData.realisedInterest.toFixed(2)}%
              </p>
            </div>

            {/* Unrealised Interest */}
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Unrealised Interest</p>
                <p className="text-sm text-gray-500">Pending interest not yet settled</p>
              </div>
              <p className="text-xl font-bold text-yellow-600">
                {reportData.unrealisedInterest.toFixed(2)}%
              </p>
            </div>

            {/* Management Fees */}
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Management Fees</p>
                <p className="text-sm text-gray-500">Total fees charged</p>
              </div>
              <p className="text-xl font-bold text-red-600">
                N$ {reportData.managementFees.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Account Details */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Account Breakdown
            </h3>
            <div className="space-y-4">
              {profile.accounts?.map((account) => (
                <div
                  key={account.id}
                  className="bg-gray-50 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900">
                        {account.account_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {account.account_number}
                      </p>
                    </div>
                    <p className="font-bold text-gray-900">
                      N$ {account.current_balance.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Realised Interest</span>
                    <span className="text-green-600 font-medium">
                      {account.total_realised_interest || 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Notes */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500">
            <p>Notes:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Management fees are calculated at 1% per annum of the account balance</li>
              <li>Performance fees of 20% apply on returns exceeding 20% per annum</li>
              <li>Interest rates are subject to market conditions and fund performance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}