import React from 'react';
import { format } from 'date-fns';
import { X, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import type { RFFApplication } from '../../../types';

interface ApplicationDetailsProps {
  application: RFFApplication;
  onClose: () => void;
  onApprove: (id: string) => void;
  onDecline: (id: string) => void;
}

export function ApplicationDetails({
  application,
  onClose,
  onApprove,
  onDecline
}: ApplicationDetailsProps) {
  const handleApprove = () => {
    const confirmed = window.confirm('Are you sure you want to approve this RFF application?');
    if (confirmed) {
      onApprove(application.id);
    }
  };

  const handleDecline = () => {
    const confirmed = window.confirm('Are you sure you want to decline this RFF application?');
    if (confirmed) {
      onDecline(application.id);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-8 max-w-4xl bg-white rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            RFF Application: {application.rff_number}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Client Information</h3>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Client Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{application.client_name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Contact</dt>
                <dd className="mt-1 text-sm text-gray-900">{application.client_contact}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Off-taker</dt>
                <dd className="mt-1 text-sm text-gray-900">{application.off_taker}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Sector</dt>
                <dd className="mt-1 text-sm text-gray-900">{application.off_taker_sector}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Loan Details</h3>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Loan Amount</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  N$ {application.loanAmount.toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Interest Rate</dt>
                <dd className="mt-1 text-sm text-gray-900">{application.interest_rate}%</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">BIM Interest</dt>
                <dd className="mt-1 text-sm text-gray-900">{application.bim_interest}%</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">BSF Interest</dt>
                <dd className="mt-1 text-sm text-gray-900">{application.bsf_interest}%</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
          <dl className="grid grid-cols-3 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Settlement Date</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {application.settlement_date ? format(new Date(application.settlement_date), 'MMM dd, yyyy') : 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Priority Level</dt>
              <dd className="mt-1">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  application.priority === 'high'
                    ? 'bg-red-100 text-red-800'
                    : application.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {application.priority.toUpperCase()}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  application.approvalStatus === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : application.approvalStatus === 'declined'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {application.approvalStatus.toUpperCase()}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        {application.approvalStatus === 'pending' && (
          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={handleDecline}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              <XCircle className="w-5 h-5 inline-block mr-2" />
              Decline
            </button>
            <button
              onClick={handleApprove}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-5 h-5 inline-block mr-2" />
              Approve
            </button>
          </div>
        )}
      </div>
    </div>
  );
}