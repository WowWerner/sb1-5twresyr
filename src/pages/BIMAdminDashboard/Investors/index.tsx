import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { InvestorList } from './InvestorList';
import { InvestorUserForm } from '../../../components/BIMAdminDashboard/InvestorUserForm';
import { KYCForm } from '../../../components/BIMAdminDashboard/KYCForm';
import { DepositRequests } from '../../../components/BIMAdminDashboard/DepositRequests';
import { fetchInvestorProfiles, deleteInvestorProfile, getInvestorUser } from '../../../lib/api/investors';
import type { InvestorProfile } from '../../../types';

export function Investors() {
  const [showUserForm, setShowUserForm] = useState(false);
  const [showKYCForm, setShowKYCForm] = useState(false);
  const [pendingInvestor, setPendingInvestor] = useState<any>(null);
  const [investors, setInvestors] = useState<InvestorProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvestors();
  }, []);

  const loadInvestors = async () => {
    try {
      setLoading(true);
      const data = await fetchInvestorProfiles();
      setInvestors(data);
    } catch (error) {
      console.error('Error loading investors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvestor = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this investor?');
    if (!confirmed) return;

    try {
      await deleteInvestorProfile(id);
      await loadInvestors();
    } catch (error) {
      console.error('Error deleting investor:', error);
      alert('Failed to delete investor');
    }
  };

  const filteredInvestors = investors.filter(investor =>
    investor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    investor.id_number.includes(searchTerm)
  );

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search investors..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <button
          onClick={() => setShowUserForm(true)}
          className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Investor
        </button>
      </div>

      <InvestorList
        investors={filteredInvestors}
        onDelete={handleDeleteInvestor}
      />

      <DepositRequests />

      {showUserForm && (
        <InvestorUserForm
          onClose={() => setShowUserForm(false)}
          onSuccess={async (investorUserId) => {
            setShowUserForm(false);
            const investor = await getInvestorUser(investorUserId);
            if (investor) {
              setPendingInvestor(investor);
              setShowKYCForm(true);
            }
          }}
        />
      )}

      {showKYCForm && pendingInvestor && (
        <KYCForm
          investor={pendingInvestor}
          onClose={() => {
            setShowKYCForm(false);
            setPendingInvestor(null);
          }}
          onSuccess={() => {
            setShowKYCForm(false);
            setPendingInvestor(null);
            loadInvestors();
          }}
        />
      )}
    </div>
  );
}