import React, { useState, useEffect } from 'react';
import { User, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Investor {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export function RecentInvestors() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecentInvestors();
  }, []);

  const fetchRecentInvestors = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, created_at')
        .eq('role', 'investor')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setInvestors(data || []);
    } catch (err) {
      console.error('Error fetching recent investors:', err);
      setError('Failed to load recent investors');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Recent Investors</h2>
        <div className="flex justify-center py-4">
          <Loader className="w-6 h-6 text-indigo-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Recent Investors</h2>
        <p className="text-red-600 text-center py-4">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Recent Investors</h2>
      {investors.length > 0 ? (
        <div className="space-y-3">
          {investors.map((investor) => (
            <div
              key={investor.id}
              className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md"
            >
              <div className="bg-indigo-100 p-2 rounded-full">
                <User className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium">{investor.full_name}</p>
                <p className="text-sm text-gray-600">{investor.email}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">No recent investors found</p>
      )}
    </div>
  );
}