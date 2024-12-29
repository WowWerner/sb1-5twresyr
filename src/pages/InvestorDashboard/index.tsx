import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from '../../components/LoginForm';
import { Navbar } from './components/Navbar';
import { Portfolio } from './Portfolio';
import { Accounts } from './Accounts';
import { Withdrawals } from './Withdrawals';
import { Report } from './Report';
import type { InvestorAuthUser } from '../../types';

export function InvestorDashboard() {
  const [investorUser, setInvestorUser] = useState<InvestorAuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!investorUser) {
    return (
      <LoginForm 
        role="investor" 
        onLogin={(user) => {
          setInvestorUser(user as InvestorAuthUser);
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {error && (
        <div className="max-w-7xl mx-auto px-4 py-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      <Routes>
        <Route 
          path="/" 
          element={
            <Portfolio 
              investorUser={investorUser}
              onError={(msg) => setError(msg)} 
            />
          } 
        />
        <Route 
          path="/accounts" 
          element={
            <Accounts 
              investorUser={investorUser}
              onError={(msg) => setError(msg)}
            />
          } 
        />
        <Route 
          path="/withdrawals" 
          element={
            <Withdrawals 
              investorUser={investorUser}
              onError={(msg) => setError(msg)}
            />
          } 
        />
        <Route 
          path="/report" 
          element={
            <Report 
              investorUser={investorUser}
              onError={(msg) => setError(msg)}
            />
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}