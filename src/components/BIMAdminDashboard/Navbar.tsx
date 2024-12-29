import React from 'react';
import { Home, FileText, Users, DollarSign, BarChart3, Settings, FileBarChart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { name: 'Home', icon: Home, path: '/bim-admin' },
  { name: 'Applications', icon: FileText, path: '/bim-admin/applications' },
  { name: 'Investors', icon: Users, path: '/bim-admin/investors' },
  { name: 'Payments', icon: DollarSign, path: '/bim-admin/payments' },
  { name: 'Transactions', icon: BarChart3, path: '/bim-admin/transactions' },
  { name: 'Management', icon: Settings, path: '/bim-admin/management' },
  { name: 'Reports', icon: FileBarChart, path: '/bim-admin/reports' },
];

export function Navbar() {
  const location = useLocation();

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <FileText className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">BIM Admin</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`${
                      isActive
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}