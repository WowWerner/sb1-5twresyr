import React from 'react';
import { Wallet } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  message: string;
}

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-center space-x-4 text-gray-500">
          <Wallet className="w-8 h-8" />
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
}