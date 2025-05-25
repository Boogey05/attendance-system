'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [adminName, setAdminName] = useState('');

  useEffect(() => {
    const adminId = Cookies.get('adminId');
    const name = Cookies.get('adminName');
    
    if (!adminId) {
      router.push('/admin/login');
    } else {
      setAdminName(name);
    }
  }, [router]);

  const handleLogout = () => {
    Cookies.remove('adminId');
    Cookies.remove('adminName');
    router.push('/admin/login');
  };

  const adminFeatures = [
    {
      title: 'Manage Students',
      description: 'Add, edit, or remove student records',
      href: '/admin/students',
      icon: '👥',
    },
    {
      title: 'Manage Faculty',
      description: 'Add, edit, or remove faculty records',
      href: '/admin/faculty',
      icon: '👨‍🏫',
    },
    {
      title: 'Manage Modules',
      description: 'Add, edit, or remove course modules',
      href: '/admin/modules',
      icon: '📚',
    },
    {
      title: 'View Attendance',
      description: 'View and manage attendance records',
      href: '/admin/attendance',
      icon: '📊',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {adminName}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {adminFeatures.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-center space-x-4">
                <span className="text-4xl">{feature.icon}</span>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {feature.title}
                  </h2>
                  <p className="mt-1 text-gray-600">{feature.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
} 