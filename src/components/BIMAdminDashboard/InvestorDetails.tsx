import React, { useState, useEffect } from 'react';
import { X, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';
import type { InvestorProfile, FundingRequest } from '../../types';

interface InvestorDetailsProps {
  investor: InvestorProfile;
  onClose: () => void;
  onRefresh: () => void;
}

export function InvestorDetails({ investor, onClose, onRefresh }: InvestorDetailsProps) {
  const [fundingRequests, setFundingRequests] = useState<FundingRequest[]>([]);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<FundingRequest | null>(null);

  useEffect(() => {
    fetchFundingRequests();
  }, [investor.id]);

  const fetchFundingRequests = async () => {
    const { data } = await supabase
      .from('funding_requests')
      .select('*')
      .eq('profile_id', investor.id)
      .eq('status', 'pending');
    
    if (data) setFundingRequests(data);
  };

  const handleValidateFunding = async () => {
    if (!selectedRequest) return;

    try {
      // Generate account name
      const accountName = `${investor.full_name}_${(investor.accounts?.length || 0) + 1}`;

      // Create new investor account
      const { data: accountData, error: accountError } = await supabase
        .from('investor_accounts')
        .insert([{
          profile_id: investor.id,
          account_name: accountName,
          account_number: `ACC_${Date.now()}`,
          total_invested: selectedRequest.amount,
          current_balance: selectedRequest.amount
        }])
        .select()
        .single();

      if (accountError) throw accountError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          account_id: accountData.id,
          transaction_type: 'funding',
          amount: selectedRequest.amount
        }]);

      if (transactionError) throw transactionError;

      // Update funding request status
      const { error: requestError } = await supabase
        .from('funding_requests')
        .update({
          status: 'validated',
          validated_at: new Date().toISOString(),
          validated_by: investor.id
        })
        .eq('id', selectedRequest.id);

      if (requestError) throw requestError;

      setShowValidationModal(false);
      setSelectedRequest(null);
      fetchFundingRequests();
      onRefresh();
    } catch (error) {
      console.error('Error validating funding:', error);
      alert('Failed to validate funding request');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-8 max-w-4xl bg-white rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{investor.full_name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{investor.user?.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">ID Number</dt>
                <dd className="mt-1 text-sm text-gray-900">{investor.id_number}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">{investor.phone_number}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Risk Appetite</dt>
                <dd className="mt-1 text-sm text-gray-900">{investor.risk_appetite}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Investment Accounts</h3>
            <div className="space-y-4">
              {investor.accounts?.map((account) => (
                <div
                  key={account.id}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-900">{account.account_name}</h4>
                    <span className="text-sm text-gray-500">{account.account_number}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Invested</p>
                      <p className="font-medium">N$ {account.total_invested.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Withdrawn</p>
                      <p className="font-medium">N$ {account.total_withdrawn.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Balance</p>
                      <p className="font-medium">N$ {account.current_balance.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Funding Requests</h3>
          <div className="space-y-4">
            {fundingRequests.map((request) => (
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
                <button
                  onClick={() => {
                    setSelectedRequest(request);
                    setShowValidationModal(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Validate
                </button>
              </div>
            ))}
          </div>
        </div>

        {showValidationModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Validate Funding Request
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to validate this funding request for
                N$ {selectedRequest.amount.toLocaleString()}?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowValidationModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleValidateFunding}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Yes, Create Investment Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}