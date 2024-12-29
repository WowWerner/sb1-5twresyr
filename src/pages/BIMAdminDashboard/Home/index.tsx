import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, Calendar as CalendarIcon } from 'lucide-react';
import { StatusCard } from '../../../components/BIMAdminDashboard/StatusCard';
import { SettlementCalendar } from '../../../components/BIMAdminDashboard/SettlementCalendar';
import { UpcomingSettlements } from '../../../components/BIMAdminDashboard/UpcomingSettlements';
import { RecentInvestors } from '../../../components/BIMAdminDashboard/RecentInvestors';
import { supabase } from '../../../lib/supabase';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [rffResponse, investorsResponse] = await Promise.all([
          supabase
            .from('rff_applications')
            .select(`
              *,
              submitted_by (
                full_name,
                email
              )
            `)
            .order('created_at', { ascending: false }),
          supabase
            .from('users')
            .select('*')
            .eq('role', 'investor')
            .order('created_at', { ascending: false })
            .limit(5)
        ]);

        if (rffResponse.error) throw rffResponse.error;
        if (investorsResponse.error) throw investorsResponse.error;

        setRffApplications(rffResponse.data || []);
        setInvestors(investorsResponse.data || []);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        alert('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);