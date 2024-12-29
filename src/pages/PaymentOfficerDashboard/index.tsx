import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './Home';
import { RFFPayments } from './RFFPayments';
import { Withdrawals } from './Withdrawals';
import { Transactions } from './Transactions';
import { LoginForm } from '../../components/LoginForm';

export function PaymentOfficerDashboard() {
  const [userId, setUserId] = useState<string | null>(null);

  if (!userId) {
    return <LoginForm role="payment_officer" onLogin={setUserId} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rff-payments" element={<RFFPayments />} />
        <Route path="/withdrawals" element={<Withdrawals />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}