import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { PlusCircle, TrendingUp, Wallet, Clock, ArrowUpRight, BellRing } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { DepositForm } from './components/DepositForm';
import { format, subMonths } from 'date-fns';
import type { InvestorProfile, InvestorAccount } from '../../types';

interface DepositRequest {
  id: string;
  amount: number;
  status: string;
  created_at: string;
}

interface HomeProps {
  userId: string;
}

export function Home({ userId }: HomeProps) {
  const [profile, setProfile] = useState<InvestorProfile | null>(null);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
  const [accountGrowthData, setAccountGrowthData] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
    fetchAccountGrowth();
    fetchDepositRequests();
  }, [userId]);

  const fetchDepositRequests = async () => {
    if (!profile) return;

    const { data } = await supabase
      .from('deposit_requests')
      .select('*')
      .eq('profile_id', profile.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (data) setDepositRequests(data);
  };

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('investor_profiles')
      .select(`
        *,
        accounts:investor_accounts(*)
      `)
      .eq('user_id', userId)
      .single();

    if (data) setProfile(data);
  };

  const fetchAccountGrowth = async () => {
    if (!profile?.id) return;

    const lastSixMonths = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), i);
      return format(date, 'yyyy-MM');
    }).reverse();

    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount, created_at, transaction_type')
      .in('account_id', profile.accounts?.map(a => a.id) || [])
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

    setAccountGrowthData({
      labels: lastSixMonths.map(month => format(new Date(month), 'MMM yyyy')),
      datasets: [{
        label: 'Net Investment Growth',
        data: monthlyData,
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        fill: true,
        tension: 0.4
      }]
    });
  };

  const totalInvestment = profile?.accounts?.reduce(
    (sum, account) => sum + account.current_balance,
    0
  ) || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {profile?.full_name}
        </h1>
        <button
          onClick={() => setShowDepositForm(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Make a Deposit
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Investment
              </p>
              <p className="text-2xl font-bold text-gray-900">
                N$ {totalInvestment.toLocaleString()}
              </p>
            </div>
            <div className="bg-indigo-100 p-3 rounded-full">
              <Wallet className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-500 font-medium">
              {profile?.accounts?.reduce((sum, acc) => sum + (acc.total_realised_interest || 0), 0)}% Total Return
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Accounts</p>
              <p className="text-2xl font-bold text-gray-900">
                {profile?.accounts?.length || 0}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Pending Deposits
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {depositRequests.length}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Investment Growth
            </h2>
            {accountGrowthData && (
              <Line
                data={accountGrowthData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                      },
                      ticks: {
                        callback: (value) => `N$ ${value}`
                      }
                    },
                    x: {
                      grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => `N$ ${context.raw}`
                      }
                    }
                  }
                }}
                height={300}
              />
            )}
            <div className="mt-4 text-sm text-gray-500">
              Showing investment growth over the last 6 months
            </div>
          </div>

          {depositRequests.length > 0 && (
            <div className="mt-6 bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <BellRing className="w-5 h-5 text-yellow-500 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">
                  Pending Deposit Requests
                </h2>
              </div>
              <div className="space-y-4">
                {depositRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        N$ {request.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Requested on {format(new Date(request.created_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <span className="px-3 py-1 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-full">
                      Pending Approval
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Investment Accounts
            </h2>
            <div className="space-y-4">
              {profile?.accounts?.map((account) => (
                <div
                  key={account.id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-gray-900">
                      {account.account_name}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {account.account_number}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Balance</span>
                      <span className="font-medium">
                        N$ {account.current_balance.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">
                        Realised Interest
                      </span>
                      <span className={`font-medium ${
                        (account.total_realised_interest || 0) > 0 
                          ? 'text-green-600' 
                          : 'text-gray-600'
                      }`}>
                        {account.total_realised_interest}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showDepositForm && profile && (
        <DepositForm
          profileId={profile.id}
          onClose={() => {
            setShowDepositForm(false);
            fetchProfile();
            fetchDepositRequests();
          }}
          onSuccess={() => {
            fetchProfile();
            fetchDepositRequests();
          }}
        />
      )}
    </div>
  );
}