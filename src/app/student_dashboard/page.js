'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faUser, faSignOutAlt, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../hooks/useAuth';

export default function StudentDashboard() {
  const router = useRouter();
  const { isAuthenticated, isLoading, error: authError, user, logout } = useAuth('student');
  const [studentData, setStudentData] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [moduleData, setModuleData] = useState([]);
  const [error, setError] = useState(null);
  const isMounted = useRef(false);

  // Initialize mounted ref
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Fetch dashboard data only when authenticated
  const fetchDashboardData = useCallback(async () => {
    try {
      console.log('Fetching dashboard data for user:', user?.userId);
      const response = await fetch(`/api/student/dashboard?userId=${user.userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Received dashboard data:', data);
      
      if (isMounted.current) {
        setStudentData(data.student);
        setModuleData(data.enrolledModules || []);
        setAttendanceHistory(data.attendanceHistory || []);
      }
    } catch (err) {
      console.error('Error fetching student dashboard:', err);
      if (isMounted.current) {
        setError(err.message || 'Failed to fetch student data');
      }
    }
  }, [user?.userId]);

  // Add auto-refresh every 30 seconds
  useEffect(() => {
    console.log('Auth state:', { isAuthenticated, isLoading, user });
    if (user?.userId) {
      console.log('User authenticated, fetching data...');
      fetchDashboardData();
      const refreshInterval = setInterval(fetchDashboardData, 30000);
      return () => clearInterval(refreshInterval);
    }
  }, [user, user?.userId, fetchDashboardData, isAuthenticated, isLoading]);

  const handleLogout = useCallback((e) => {
    e.preventDefault();
    logout();
  }, [logout]);

  if (isLoading) return <div className="text-center text-gray-600 py-4">Loading...</div>;
  if (!isAuthenticated) return null;
  if (authError) return <div className="text-center text-red-500 py-4">Error: {authError}</div>;
  if (error) return <div className="text-center text-red-500 py-4">Error: {error}</div>;
  if (!studentData) return <div className="text-center text-gray-600 py-4">Loading...</div>;

  console.log('Rendering dashboard with data:', { studentData, moduleData, attendanceHistory });

  const isMale = studentData.name.split(' ')[1]?.toLowerCase().endsWith('i') || studentData.name.split(' ')[1]?.toLowerCase().endsWith('o');
  const defaultImage = isMale ? '/default-male.png' : '/default-female.png';

  return (
    <div className="font-sans bg-gray-100 min-h-screen flex flex-col">
      <header className="bg-[#4154f1] text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center">
          <Image src="/images/logo.png" alt="College Logo" width={40} height={40} className="rounded-full mr-2" />
          <Link href="/student_dashboard" className="text-xl font-bold text-white">
            College Attendance System
          </Link>
        </div>
        <div className="flex items-center">
          <div className="rounded-full bg-gray-200 flex items-center justify-center mr-2" style={{ width: 40, height: 40 }}>
            <FontAwesomeIcon icon={faUser} className="text-gray-500" style={{ fontSize: 24 }} />
          </div>
          <div>
            <h6 className="mb-0 text-sm font-medium">{studentData.name}</h6>
            <small className="text-gray-200 text-xs">{user.userId}</small>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 flex-grow">
        <div className="bg-white rounded-lg shadow-md mb-4 p-2">
          <ul className="flex flex-wrap">
            <li className="mr-2">
              <Link
                href="/student_dashboard"
                className="flex items-center text-[#4154f1] px-3 py-2 rounded-md bg-[#4154f1]/10"
              >
                <FontAwesomeIcon icon={faTachometerAlt} className="mr-2" /> Dashboard
              </Link>
            </li>
            <li className="mr-2">
              <Link
                href="/student_profile"
                className="flex items-center text-[#4154f1] px-3 py-2 rounded-md hover:bg-[#4154f1]/10"
              >
                <FontAwesomeIcon icon={faUser} className="mr-2" /> My Profile
              </Link>
            </li>
            <li className="ml-auto">
              <button
                onClick={handleLogout}
                className="flex items-center text-[#4154f1] px-3 py-2 rounded-md hover:bg-[#4154f1]/10"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" /> Logout
              </button>
            </li>
          </ul>
        </div>

        <div className="content-area">
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="flex flex-col md:flex-row justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Welcome, <span className="font-bold">{studentData.name.split(' ')[0]}!</span>
                </h4>
                <p className="text-gray-700 text-base">{studentData.department} Department</p>
              </div>
              <div className="text-right mt-2 md:mt-0">
                <h6 className="text-base font-medium">
                  Current Semester: <span className="text-[#4154f1] font-bold">Spring 2025</span>
                </h6>
                <div className="bg-blue-100 text-blue-800 text-base mt-2 flex items-center p-2 rounded">
                  <FontAwesomeIcon icon={faInfoCircle} className="mr-2 text-[#3498db]" /> You must maintain at least <strong className="text-gray-900">90%</strong> attendance in <strong className="text-gray-900">each module</strong> to be eligible for final examinations.
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between mb-4">
            <div className="bg-white rounded-lg shadow-md p-3 m-1 flex-1 text-center">
              <div className="text-gray-700 text-base">Average Attendance</div>
              <div className="text-2xl font-bold text-gray-900">{studentData.averageAttendance}</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3 m-1 flex-1 text-center">
              <div className="text-gray-700 text-base">Modules Above 90%</div>
              <div className="text-2xl font-bold text-[#2ecc71]">{studentData.goodModules}</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3 m-1 flex-1 text-center">
              <div className="text-gray-700 text-base">Modules At Risk</div>
              <div className="text-2xl font-bold text-[#f39c12]">{studentData.warningModules}</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3 m-1 flex-1 text-center">
              <div className="text-gray-700 text-base">Critical Modules</div>
              <div className="text-2xl font-bold text-[#e74c3c]">{studentData.criticalModules}</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <h5 className="text-lg font-semibold text-gray-900 mb-3">My Module Attendance</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {moduleData.map((module) => {
                const statusClass = module.attendance >= 90 ? 'bg-[#2ecc71]' : 
                                  module.attendance >= 80 ? 'bg-[#f39c12]' : 
                                  'bg-[#e74c3c]';
                const statusBadgeClass = module.attendance >= 90 ? 'bg-green-100 text-green-700' : 
                                       module.attendance >= 80 ? 'bg-yellow-100 text-yellow-700' : 
                                       'bg-red-100 text-red-700';
                const statusText = module.attendance >= 90 ? 'Good' : 
                                 module.attendance >= 80 ? 'Warning' : 
                                 'Critical';

                return (
                  <div key={module.id} className="bg-white rounded-xl shadow p-6 flex flex-col justify-between min-h-[220px]">
                    <div>
                      <div className="text-lg font-semibold text-gray-900 mb-1">{module.name}</div>
                      <div className="text-gray-500 text-sm mb-2">{module.code}</div>
                      <div className="flex items-center mb-2">
                        <span className="text-4xl font-extrabold text-gray-900 mr-3">{module.attendance}%</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ml-auto ${statusBadgeClass}`}>{statusText}</span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 rounded-full mb-4">
                        <div
                          className={`h-3 rounded-full ${statusClass}`}
                          style={{ width: `${module.attendance}%` }}
                          role="progressbar"
                          aria-valuenow={module.attendance}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-auto pt-2 text-base">
                      <div className="text-center">
                        <div className="font-bold text-gray-900">{module.presentClasses}/{module.totalClasses}</div>
                        <div className="text-gray-500 text-xs">Attended</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-gray-900">{module.schedule}</div>
                        <div className="text-gray-500 text-xs">Schedule</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-gray-900">{module.teacher}</div>
                        <div className="text-gray-500 text-xs">Teacher</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Total Classes</h3>
              <p className="text-2xl font-bold text-gray-900">{moduleData.reduce((sum, m) => sum + m.totalClasses, 0)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Present</h3>
              <p className="text-2xl font-bold text-green-600">{moduleData.reduce((sum, m) => sum + m.presentClasses, 0)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Absent</h3>
              <p className="text-2xl font-bold text-red-600">{moduleData.reduce((sum, m) => sum + (m.totalClasses - m.presentClasses), 0)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Average Attendance</h3>
              <p className="text-2xl font-bold text-blue-600">
                {moduleData.length > 0 
                  ? Math.round(moduleData.reduce((sum, m) => sum + m.attendance, 0) / moduleData.length) + '%'
                  : '0%'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-[#2c3e50] text-white py-4 text-center">
        <div className="container mx-auto">
          <p className="mb-0 text-base font-medium">© 2025 College Attendance System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}