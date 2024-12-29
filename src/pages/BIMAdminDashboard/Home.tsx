import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { StatusCard } from '../../components/BIMAdminDashboard/StatusCard';
import { Calendar } from '../../components/BIMAdminDashboard/Calendar';
import { UpcomingSettlements } from '../../components/BIMAdminDashboard/UpcomingSettlements';
import { RecentInvestors } from '../../components/BIMAdminDashboard/RecentInvestors';
import { supabase } from '../../lib/supabase';
import type { RFFApplication } from '../../types';

export function Home() {
  const navigate = useNavigate();
  const [rffApplications, setRffApplications] = useState<RFFApplication[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    declined: 0
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data: rffs, error } = await supabase
        .from('rff_applications')
        .select('*');

      if (error) throw error;

      setRffApplications(rffs || []);

      // Calculate stats
      setStats({
        pending: rffs?.filter(rff => rff.approval_status === 'pending').length || 0,
        approved: rffs?.filter(rff => rff.approval_status === 'approved').length || 0,
        declined: rffs?.filter(rff => rff.approval_status === 'declined').length || 0
      });
    } catch (error) {
      console.error('Error fetching applications:', error);
      alert('Failed to load applications data');
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = selectedPriority === 'all'
    ? rffApplications
    : rffApplications.filter(rff => rff.priority === selectedPriority);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatusCard
          title="Pending Applications"
          count={stats.pending}
          status="pending"
          onClick={() => navigate('/bim-admin/applications?status=pending')}
        />
        <StatusCard
          title="Approved Applications"
          count={stats.approved}
          status="approved"
          onClick={() => navigate('/bim-admin/applications?status=approved')}
        />
        <StatusCard
          title="Declined Applications"
          count={stats.declined}
          status="declined"
          onClick={() => navigate('/bim-admin/applications?status=declined')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Calendar rffApplications={filteredApplications} />
          <div className="mt-6">
            <UpcomingSettlements rffApplications={filteredApplications} />
          </div>
          <div className="mt-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Filter by Priority</h2>
              <div className="flex space-x-4">
                {['all', 'low', 'medium', 'high'].map((priority) => (
                  <button
                    key={priority}
                    onClick={() => setSelectedPriority(priority)}
                    className={`px-4 py-2 rounded-md ${
                      selectedPriority === priority
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div>
          <RecentInvestors />
        </div>
      </div>
    </div>
  );
}