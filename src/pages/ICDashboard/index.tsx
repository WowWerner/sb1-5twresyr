import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './Home';
import { Applications } from './Applications';
import { Analytics } from './Analytics';
import { LoginForm } from '../../components/LoginForm';

export function ICDashboard() {
  const [userId, setUserId] = useState<string | null>(null);

  if (!userId) {
    return <LoginForm role="ic" onLogin={setUserId} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}