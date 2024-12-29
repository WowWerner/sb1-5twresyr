import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BSFDashboard } from './pages/BSFDashboard';
import { BIMAdminDashboard } from './pages/BIMAdminDashboard';
import { PaymentOfficerDashboard } from './pages/PaymentOfficerDashboard';
import { ICDashboard } from './pages/ICDashboard';
import { InvestorDashboard } from './pages/InvestorDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/bsf/*" element={<BSFDashboard />} />
        <Route path="/bim-admin/*" element={<BIMAdminDashboard />} />
        <Route path="/payment-officer/*" element={<PaymentOfficerDashboard />} />
        <Route path="/ic/*" element={<ICDashboard />} />
        <Route path="/investor/*" element={<InvestorDashboard />} />
        <Route path="/" element={<Navigate to="/bsf" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
