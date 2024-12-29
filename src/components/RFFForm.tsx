import React, { useState } from 'react';
import { PlusCircle, AlertCircle } from 'lucide-react';
import { PriorityLevel, RFFApplication } from '../types';
import { supabase } from '../lib/supabase';

interface RFFFormProps {
  onSubmit: (data: Partial<RFFApplication>) => void;
}

export function RFFForm({ onSubmit }: RFFFormProps) {
  const [formData, setFormData] = useState({
    client_name: '',
    client_contact: '',
    loan_facility_number: '',
    loan_amount: '',
    interest_rate: '',
    settlement_date: '',
    off_taker: '',
    off_taker_sector: '',
    priority: 'medium' as PriorityLevel,
  });

  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate form data
    if (!formData.client_name || !formData.client_contact || !formData.loan_facility_number ||
        !formData.loan_amount || !formData.interest_rate || !formData.settlement_date ||
        !formData.off_taker || !formData.off_taker_sector) {
      setError('Please fill in all required fields');
      return;
    }

    setShowPreview(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      onSubmit(formData);
      setShowPreview(false);
      setFormData({
        client_name: '',
        client_contact: '',
        loan_facility_number: '',
        loan_amount: '',
        interest_rate: '',
        settlement_date: '',
        off_taker: '',
        off_taker_sector: '',
        priority: 'medium',
      });
    } catch (error) {
      console.error('Error submitting RFF:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit RFF application');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-8 space-y-8">
        {/* Main Fields */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-2">Client Name</label>
              <input
                type="text"
                name="client_name"
                value={formData.client_name}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-lg bg-blue-50"
                required
              />
            </div>
          </div>
          <div>
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-2">Loan Amount (N$)</label>
              <input
                type="number"
                name="loan_amount"
                value={formData.loan_amount}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-lg bg-blue-50"
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Other Fields */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Client Contact</label>
              <input
                type="text"
                name="client_contact"
                value={formData.client_contact}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Loan Facility Number</label>
              <input
                type="text"
                name="loan_facility_number"
                value={formData.loan_facility_number}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Interest Rate (%)</label>
              <input
                type="number"
                name="interest_rate"
                value={formData.interest_rate}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                required
                min="0"
                max="100"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Settlement Date</label>
              <input
                type="date"
                name="settlement_date"
                value={formData.settlement_date}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Off-taker</label>
              <input
                type="text"
                name="off_taker"
                value={formData.off_taker}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Off-taker Sector</label>
              <input
                type="text"
                name="off_taker_sector"
                value={formData.off_taker_sector}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Priority Level</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-md flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Submit
          </button>
        </div>
      </form>

      {showPreview && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl p-8 m-4 max-w-xl w-full">
            <h2 className="text-2xl font-bold mb-4">Preview RFF Application</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-gray-500">Client Name</p>
                  <p>{formData.client_name}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500">Client Contact</p>
                  <p>{formData.client_contact}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500">Loan Facility Number</p>
                  <p>{formData.loan_facility_number}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500">Loan Amount</p>
                  <p>N$ {parseFloat(formData.loan_amount).toLocaleString()}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500">Interest Rate</p>
                  <p>{formData.interest_rate}%</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500">Settlement Date</p>
                  <p>{new Date(formData.settlement_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500">Off-taker</p>
                  <p>{formData.off_taker}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500">Off-taker Sector</p>
                  <p>{formData.off_taker_sector}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500">Priority Level</p>
                  <p className="capitalize">{formData.priority}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Submit to BIM
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}