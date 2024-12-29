import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { ApplicationList } from './ApplicationList';
import { ApplicationDetails } from './ApplicationDetails';
import type { RFFApplication } from '../../../types';

export function Applications() {
  const [searchParams] = useSearchParams();
  const [applications, setApplications] = useState<RFFApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<RFFApplication | null>(null);

  useEffect(() => {
    fetchApplications();
  }, [searchParams]);

  const fetchApplications = async () => {
    const status = searchParams.get('status') || 'pending';
    const { data, error } = await supabase
      .from('rff_applications')
      .select('*')
      .eq('approval_status', status)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching applications:', error);
      return;
    }

    if (data) setApplications(data);
  };

  const handleApprove = async (id: string) => {
    try {
      const confirmed = window.confirm('Are you sure you want to approve this RFF application?');
      if (!confirmed) return;

      const { error } = await supabase
        .from('rff_applications')
        .update({ 
          approval_status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) throw error;
      
      // Refresh the applications list
      fetchApplications();
      setSelectedApplication(null);
    } catch (error) {
      console.error('Error approving application:', error);
      alert('Failed to approve application');
    }
  };

  const handleDecline = async (id: string) => {
    try {
      const confirmed = window.confirm('Are you sure you want to decline this RFF application?');
      if (!confirmed) return;

      const { error } = await supabase
        .from('rff_applications')
        .update({ 
          approval_status: 'declined',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) throw error;
      
      // Refresh the applications list
      fetchApplications();
      setSelectedApplication(null);
    } catch (error) {
      console.error('Error declining application:', error);
      alert('Failed to decline application');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ApplicationList
        applications={applications}
        onSelect={setSelectedApplication}
      />

      {selectedApplication && (
        <ApplicationDetails
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onApprove={handleApprove}
          onDecline={handleDecline}
        />
      )}
    </div>
  );
}