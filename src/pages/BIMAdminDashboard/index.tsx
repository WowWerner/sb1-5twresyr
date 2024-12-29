import React from 'react';
import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from '../../components/BIMAdminDashboard/Navbar';
import { Home } from './Home';
import { Applications } from './Applications';
import { Investors } from './Investors';
import { Transactions } from './Transactions';
import { Payments } from './Payments';
import { Reports } from './Reports';
import { Management } from './Management';
import { LoginForm } from '../../components/LoginForm';

export function BIMAdminDashboard() {
  const [userId, setUserId] = useState<string | null>(null);

  if (!userId) {
    return <LoginForm role="bim_admin" onLogin={setUserId} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/investors" element={<Investors />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/management" element={<Management />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}