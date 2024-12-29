import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface KYCFormProps {
  investor: {
    id: string;
    email: string;
    full_name: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export function KYCForm({ investor, onClose, onSuccess }: KYCFormProps) {
  const [formData, setFormData] = useState({
    fullName: investor.full_name,
    idNumber: '',
    dateOfBirth: '',
    phoneNumber: '',
    physicalAddress: '',
    postalAddress: '',
    occupation: '',
    employer: '',
    sourceOfFunds: '',
    riskAppetite: '',
    error: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('investor_profiles')
        .insert([{
          investor_user_id: investor.id,
          full_name: formData.fullName,
          id_number: formData.idNumber,
          date_of_birth: formData.dateOfBirth,
          phone_number: formData.phoneNumber,
          physical_address: formData.physicalAddress,
          postal_address: formData.postalAddress,
          occupation: formData.occupation,
          employer: formData.employer,
          source_of_funds: formData.sourceOfFunds,
          risk_appetite: formData.riskAppetite,
          status: 'active'
        }]);

      if (error) throw error;
      onSuccess();
    } catch (error) {
      let errorMessage = 'Failed to create investor profile';
      
      if (error instanceof Error) {
        // Handle specific error cases
        if (error.message.includes('duplicate key') && error.message.includes('id_number')) {
          errorMessage = 'An investor with this ID number already exists';
        } else if (error.message.includes('violates row-level security')) {
          errorMessage = 'You do not have permission to create investor profiles. Please contact your administrator.';
        } else if (error.message.includes('null value')) {
          errorMessage = 'Missing required information. Please fill in all required fields.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setFormData(prev => ({ ...prev, error: errorMessage }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-8 max-w-2xl bg-white rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Complete KYC Information</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                name="fullName"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">ID Number</label>
              <input
                type="text"
                name="idNumber"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                onChange={(e) => setFormData(prev => ({ ...prev, idNumber: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Physical Address</label>
              <textarea
                name="physicalAddress"
                required
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                onChange={(e) => setFormData(prev => ({ ...prev, physicalAddress: e.target.value }))}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Postal Address</label>
              <textarea
                name="postalAddress"
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                onChange={(e) => setFormData(prev => ({ ...prev, postalAddress: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Occupation</label>
              <input
                type="text"
                name="occupation"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Employer</label>
              <input
                type="text"
                name="employer"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                onChange={(e) => setFormData(prev => ({ ...prev, employer: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Source of Funds</label>
              <input
                type="text"
                name="sourceOfFunds"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                onChange={(e) => setFormData(prev => ({ ...prev, sourceOfFunds: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Risk Appetite</label>
              <select
                name="riskAppetite"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                onChange={(e) => setFormData(prev => ({ ...prev, riskAppetite: e.target.value }))}
              >
                <option value="">Select Risk Level</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {formData.error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error creating profile</h3>
                  <p className="text-sm text-red-700 mt-1">{formData.error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Complete KYC'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}