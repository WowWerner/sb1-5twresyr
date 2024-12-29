import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { RFFForm } from '../components/RFFForm';
import { LoginForm } from '../components/LoginForm';
import { supabase } from '../lib/supabase';
import type { RFFApplication } from '../types';

export function BSFDashboard() {
  const [userId, setUserId] = useState<string | null>(null);

  if (!userId) {
    return <LoginForm role="bsf" onLogin={setUserId} />;
  }

  const handleSubmitRFF = async (data: Partial<RFFApplication>) => {
    try {
      // Transform form data and set submitted_by to system email
      const totalInterestRate = parseFloat(data.interest_rate?.toString() || '0');
      const splitInterest = totalInterestRate / 2;
      
      const rffData = {
        ...data,
        interest_rate: totalInterestRate,
        bim_interest: splitInterest,
        bsf_interest: splitInterest,
        submitted_by: 'system@bellatrix.com'
      };
      
      const { error } = await supabase
        .from('rff_applications')
        .insert([rffData]);

      if (error) throw error;
      alert('RFF application submitted successfully!');
    } catch (error) {
      console.error('Error submitting RFF:', error);
      alert('Failed to submit RFF application. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-indigo-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              Request for Funds Form
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <RFFForm onSubmit={handleSubmitRFF} />
        </div>
      </main>
    </div>
  );
}