import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusCard } from './StatusCard';
import { RecentPayments } from './RecentPayments';
import { PriorityPayments } from './PriorityPayments';
import { supabase } from '../../../lib/supabase';

export function Home() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pending: 0,
    processed: 0,
    cancelled: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { data } = await supabase
      .from('payment_notifications')
      .select('status');

    if (data) {
      setStats({
        pending: data.filter(n => n.status === 'pending').length,
        processed: data.filter(n => n.status === 'processed').length,
        cancelled: data.filter(n => n.status === 'cancelled').length
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatusCard
          title="Pending Payments"
          count={stats.pending}
          status="pending"
          onClick={() => navigate('/payment-officer/rff-payments?status=pending')}
        />
        <StatusCard
          title="Processed Payments"
          count={stats.processed}
          status="processed"
          onClick={() => navigate('/payment-officer/rff-payments?status=processed')}
        />
        <StatusCard
          title="Cancelled Payments"
          count={stats.cancelled}
          status="cancelled"
          onClick={() => navigate('/payment-officer/rff-payments?status=cancelled')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentPayments />
        <PriorityPayments />
      </div>
    </div>
  );
}