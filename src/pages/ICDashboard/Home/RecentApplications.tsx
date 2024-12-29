import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { RFFApplication } from '../../../types';

export function RecentApplications() {
  const [applications, setApplications] = useState<RFFApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecentApplications();
  }, []);

  const fetchRecentApplications = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('rff_applications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (fetchError) throw fetchError;
      setApplications(data || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load recent applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'declined':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Applications</h2>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Applications</h2>
        <div className="text-red-600 text-center py-4">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Applications</h2>
      <div className="space-y-4">
        {applications.map((app) => (
          <div
            key={app.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-4">
              {getStatusIcon(app.approval_status)}
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">{app.rff_number || 'No RFF Number'}</span>
                  {app.priority === 'high' && (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <p className="text-sm text-gray-500">{app.client_name || 'Unnamed Client'}</p>
                <p className="text-sm font-medium text-gray-900">
                  N$ {(app.loan_amount || 0).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                {app.created_at ? format(new Date(app.created_at), 'MMM dd, yyyy') : 'No date'}
              </p>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(app.approval_status)}`}>
                {app.approval_status.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
        {applications.length === 0 && (
          <p className="text-center text-gray-500 py-4">No recent applications found</p>
        )}
      </div>
    </div>
  );
}