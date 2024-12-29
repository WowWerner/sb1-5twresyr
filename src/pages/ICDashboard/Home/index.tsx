import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusCard } from './StatusCard';
import { RecentApplications } from './RecentApplications';
import { RiskAnalysis } from './RiskAnalysis';
import { supabase } from '../../../lib/supabase';

export function Home() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    declined: 0,
    totalAmount: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { data } = await supabase
      .from('rff_applications')
      .select('approval_status, loan_amount');

    if (data) {
      setStats({
        pending: data.filter(rff => rff.approval_status === 'pending').length,
        approved: data.filter(rff => rff.approval_status === 'approved').length,
        declined: data.filter(rff => rff.approval_status === 'declined').length,
        totalAmount: data.reduce((sum, rff) => sum + (rff.loan_amount || 0), 0)
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatusCard
          title="Pending Review"
          count={stats.pending}
          status="pending"
          onClick={() => navigate('/ic/applications?status=pending')}
        />
        <StatusCard
          title="Approved"
          count={stats.approved}
          status="approved"
          onClick={() => navigate('/ic/applications?status=approved')}
        />
        <StatusCard
          title="Declined"
          count={stats.declined}
          status="declined"
          onClick={() => navigate('/ic/applications?status=declined')}
        />
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900">Total Portfolio</h3>
          <p className="mt-2 text-3xl font-bold text-indigo-600">
            N$ {stats.totalAmount.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentApplications />
        <RiskAnalysis />
      </div>
    </div>
  );
}