import React from 'react';
import { Link } from 'react-router-dom';

interface StatusCardProps {
  title: string;
  count: number;
  status: 'pending' | 'approved' | 'declined';
  onClick: () => void;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
};

export function StatusCard({ title, count, status, onClick }: StatusCardProps) {
  return (
    <div
      onClick={onClick}
      className={`${statusColors[status]} p-6 rounded-lg shadow-sm cursor-pointer transition-transform hover:scale-105`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className="text-2xl font-bold">{count}</span>
      </div>
      <p className="mt-2 text-sm opacity-75">Click to view details</p>
    </div>
  );
}