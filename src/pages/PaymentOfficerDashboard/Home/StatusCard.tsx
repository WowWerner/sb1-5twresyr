import React from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

interface StatusCardProps {
  title: string;
  count: number;
  status: 'pending' | 'processed' | 'cancelled';
  onClick: () => void;
}

const statusConfig = {
  pending: {
    icon: Clock,
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    iconColor: 'text-yellow-500'
  },
  processed: {
    icon: CheckCircle,
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    iconColor: 'text-green-500'
  },
  cancelled: {
    icon: XCircle,
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    iconColor: 'text-red-500'
  }
};

export function StatusCard({ title, count, status, onClick }: StatusCardProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      onClick={onClick}
      className={`${config.bgColor} p-6 rounded-lg shadow-sm cursor-pointer transition-transform hover:scale-105`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-lg font-semibold ${config.textColor}`}>{title}</h3>
          <span className="text-2xl font-bold">{count}</span>
        </div>
        <Icon className={`w-8 h-8 ${config.iconColor}`} />
      </div>
      <p className="mt-2 text-sm opacity-75">Click to view details</p>
    </div>
  );
}