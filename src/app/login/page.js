'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const pathname = usePathname();
  const router = useRouter();
  const { login, error: authError } = useAuth();
  const [activeTab, setActiveTab] = useState('student');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navbarTogglerRef = useRef(null);
  const navbarCollapseRef = useRef(null);

  const switchTab = (tabName) => {
    setActiveTab(tabName);
    setError(null);
    console.log('Switched tab to:', tabName);
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const form = event.target;
    const userId = form[`${activeTab}Id`].value;
    const password = form[`${activeTab}Password`].value;

    try {
      console.log('Attempting login for:', { userId, role: activeTab });
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password, role: activeTab.toLowerCase() }),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (data.success) {
        console.log('Login Successful - User Data:', data.user);
        const success = await login({
          userId: data.user.userId,
          role: data.user.role || (activeTab === 'faculty' ? 'instructor' : 'student'),
          name: data.user.name,
          department: data.user.department,
          year: data.user.year,
          modules: data.user.modules,
          facultyRole: data.user.facultyRole
        });

        if (success) {
          const redirectPath = data.user.role === 'admin' ? '/admin_dashboard' : 
                             activeTab.toLowerCase() === 'student' ? '/student_dashboard' : 
                             '/instructor_dashboard';
          console.log(`Redirecting to ${redirectPath}`);
          router.push(redirectPath);
        }
      } else {
        console.log('Login Failed - No Success in Response');
        throw new Error(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login Error:', err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="font-sans bg-gray-100 min-h-screen flex flex-col">
      <nav className="bg-[#2c3e50] py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Image src="/images/logo.png" alt="College Logo" width={40} height={40} className="mr-2 rounded-full" />
              <Link href="/" className="text-white text-lg font-semibold">College Attendance System</Link>
            </div>
            <button
              ref={navbarTogglerRef}
              className="lg:hidden text-white focus:outline-none"
              type="button"
              onClick={() => navbarCollapseRef.current?.classList.toggle('hidden')}
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
            <div ref={navbarCollapseRef} className="hidden lg:flex lg:items-center lg:ml-auto" id="navbarNav">
              <ul className="flex flex-col lg:flex-row lg:space-x-4">
                {['Home', 'Login', 'About', 'Contact'].map((item) => (
                  <li key={item} className="nav-item">
                    <Link
                      href={item === 'Login' ? '/login' : item === 'Home' ? '/' : `/#${item.toLowerCase()}`}
                      className={`text-white px-4 py-2 relative hover:text-[#3498db] transition-colors duration-300 ${
                        pathname === (item === 'Login' ? '/login' : item === 'Home' ? '/' : `/#${item.toLowerCase()}`)
                          ? 'after:w-full'
                          : ''
                      } after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-[#3498db] after:w-0 after:transition-all after:duration-300 hover:after:w-full`}
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-grow flex items-center justify-center">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold text-gray-900">Welcome to the Attendance System</h3>
            <p className="text-gray-600">Please select your role to continue</p>
          </div>

          <div className="flex justify-center mb-8">
            <div
              className={`px-5 py-2 cursor-pointer border-b-2 font-medium transition-all duration-300 ${
                activeTab === 'student' ? 'border-[#3498db] text-[#3498db]' : 'border-transparent text-gray-900 hover:text-[#3498db]'
              }`}
              onClick={() => switchTab('student')}
            >
              Student
            </div>
            <div
              className={`px-5 py-2 cursor-pointer border-b-2 font-medium transition-all duration-300 ${
                activeTab === 'faculty' ? 'border-[#3498db] text-[#3498db]' : 'border-transparent text-gray-900 hover:text-[#3498db]'
              }`}
              onClick={() => switchTab('faculty')}
            >
              Faculty
            </div>
          </div>

          <div className="pt-5">
            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
            <form onSubmit={handleLogin} className="pt-5">
              <div className="mb-4">
                <label htmlFor={`${activeTab}Id`} className="block text-sm font-medium text-gray-900">
                  {activeTab === 'student' ? 'Student ID' : 'Faculty ID'}
                </label>
                <input
                  type="text"
                  id={`${activeTab}Id`}
                  name={`${activeTab}Id`}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-900 placeholder-gray-500 focus:ring-[#3498db] focus:border-[#3498db]"
                  placeholder={`Enter your ${activeTab} ID`}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor={`${activeTab}Password`} className="block text-sm font-medium text-gray-900">
                  Password
                </label>
                <input
                  type="password"
                  id={`${activeTab}Password`}
                  name={`${activeTab}Password`}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-900 placeholder-gray-500 focus:ring-[#3498db] focus:border-[#3498db]"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  id={`${activeTab}RememberMe`}
                  className="h-4 w-4 text-[#3498db] focus:ring-[#3498db] border-gray-300 rounded"
                />
                <label htmlFor={`${activeTab}RememberMe`} className="ml-2 text-sm text-gray-900">
                  Remember me
                </label>
              </div>
              <button
                type="submit"
                className="w-full bg-[#3498db] text-white py-3 rounded-md hover:bg-[#2980b9] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  'Logging in...'
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSignInAlt} className="mr-2" /> Login
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <footer className="bg-[#2c3e50] text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-0">© 2025 College Attendance System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}