'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faUser, faSignOutAlt, faSearch, faUserCheck, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../hooks/useAuth';

export default function InstructorDashboard() {
  const router = useRouter();
  const { isAuthenticated, isLoading, error: authError, user, logout } = useAuth('instructor');
  const [instructorData, setInstructorData] = useState(null);
  const [studentsAtRisk, setStudentsAtRisk] = useState([]);
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [hours, setHours] = useState(1);
  const [startHour, setStartHour] = useState(9);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceUpdates, setAttendanceUpdates] = useState({});
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const isMounted = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [students, setStudents] = useState([]);

  // Initialize mounted ref
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Function to fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      console.log('Fetching data for instructor:', user.userId);
      const response = await fetch(`/api/instructor/dashboard?userId=${user.userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched instructor data:', data);
      
      if (isMounted.current) {
        setInstructorData(data.instructor);
        setStudentsAtRisk(data.studentsAtRisk || []);
        setSelectedModule(data.instructor?.modules?.[0] || '');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      if (isMounted.current) {
        setError(err.message || 'Failed to fetch instructor data');
      }
    }
  }, [user?.userId]);

  // Initial data fetch
  useEffect(() => {
    if (user?.userId) {
      fetchDashboardData();
    }
  }, [user?.userId, fetchDashboardData]);

  const handleLogout = useCallback((e) => {
    e.preventDefault();
    logout();
  }, [logout]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleAttendanceChange = (studentId, present) => {
    setAttendanceUpdates(prev => ({ ...prev, [studentId]: present }));
  };

  // Helper to convert year number to ordinal string
  const toOrdinalYear = (year) => {
    if (year === '1' || year === 1) return '1st';
    if (year === '2' || year === 2) return '2nd';
    if (year === '3' || year === 3) return '3rd';
    if (year === '4' || year === 4) return '4th';
    return year;
  };

  // Add function to fetch students for selected module and year
  const fetchStudentsForModule = useCallback(async (moduleCode, year) => {
    if (!moduleCode || !year) {
      setStudents([]);
      return;
    }
    const ordinalYear = toOrdinalYear(year);
    console.log('Fetching students for', { moduleCode, year: ordinalYear });
    try {
      const response = await fetch(`/api/instructor/module-students?moduleCode=${moduleCode}&year=${ordinalYear}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (isMounted.current) {
        setStudents(data.students || []);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      if (isMounted.current) {
        setError(err.message || 'Failed to fetch students');
      }
    }
  }, []);

  // Helper to get module options
  const getModuleOptions = () => {
    if (!instructorData?.modules) return [];
    // If modules is an array of objects with code and name
    if (instructorData.modules.length > 0 && typeof instructorData.modules[0] === 'object') {
      return instructorData.modules;
    }
    // If modules is an array of codes, fallback to showing code only
    return instructorData.modules.map(code => ({ code, name: code }));
  };

  // Update module selection handler
  const handleModuleChange = (e) => {
    const selectedModuleCode = e.target.value;
    setSelectedModule(selectedModuleCode);
    setAttendanceUpdates({});
    setShowPreview(false);
    if (selectedModuleCode && selectedYear) {
      fetchStudentsForModule(selectedModuleCode, toOrdinalYear(selectedYear));
    } else {
      setStudents([]);
    }
  };

  const handleYearChange = (e) => {
    const year = e.target.value;
    setSelectedYear(year);
    setAttendanceUpdates({});
    setShowPreview(false);
    if (selectedModule && year) {
      fetchStudentsForModule(selectedModule, toOrdinalYear(year));
    } else {
      setStudents([]);
    }
  };

  // Add bulk action handler
  const handleBulkAction = (action) => {
    setAttendanceUpdates(prev => ({ ...prev, ...Object.fromEntries(students.map(student => [student.id, action === 'present'])) }));
  };

  // Modify preview handler to remove venue
  const handlePreview = () => {
    const presentCount = Object.values(attendanceUpdates).filter(v => v).length;
    const absentCount = Object.values(attendanceUpdates).filter(v => !v).length;
    setPreviewData({
      module: selectedModule,
      date,
      time: `${startHour.toString().padStart(2, '0')}:00 - ${(startHour + hours).toString().padStart(2, '0')}:00`,
      presentCount,
      absentCount,
      totalStudents: students.length
    });
    setShowPreview(true);
  };

  // Modify submit handler to remove venue
  const handleSubmitAttendance = async () => {
    if (!selectedModule) {
      setMessage({ type: 'error', text: 'Please select a module first' });
      return;
    }

    if (!showPreview) {
      handlePreview();
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const moduleCode = selectedModule.split(' (')[1]?.replace(')', '') || selectedModule;
      const updatePromises = Object.entries(attendanceUpdates).map(([studentId, present]) => {
        const student = students.find(s => s.id === studentId);
        if (!student) {
          throw new Error(`Student not found for ID: ${studentId}`);
        }
        return fetch('/api/attendance/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: student.userId,
            moduleCode,
            date,
            hours,
            present,
            startHour,
            instructorId: user.userId,
          }),
        });
      });

      const responses = await Promise.all(updatePromises);
      const results = await Promise.all(responses.map(r => r.json()));
      
      // Check if any updates failed
      const errors = results.filter(r => r.error);
      if (errors.length > 0) {
        throw new Error(errors.map(e => e.error).join(', '));
      }
      
      setMessage({ type: 'success', text: 'Attendance updated successfully!' });
      setAttendanceUpdates({});
      setShowPreview(false);
      setPreviewData(null);
      
      // Refresh both dashboard data and student list
      await Promise.all([
        fetchDashboardData(),
        fetchStudentsForModule(moduleCode, selectedYear)
      ]);
    } catch (error) {
      console.error('Attendance update error:', error);
      setMessage({ type: 'error', text: 'Failed to update attendance: ' + error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add auto-refresh every 30 seconds
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      if (user?.userId) {
        fetchDashboardData();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(refreshInterval);
  }, [user?.userId, fetchDashboardData]);

  if (isLoading) return <div className="text-center text-gray-600 py-4">Loading...</div>;
  if (!isAuthenticated) return null;
  if (authError) return <div className="text-center text-red-500 py-4">Error: {authError}</div>;
  if (error) return <div className="text-center text-red-500 py-4">Error: {error}</div>;
  if (!instructorData) return <div className="text-center text-gray-600 py-4">Loading...</div>;

  const isMale = instructorData.name?.split(' ')[1]?.toLowerCase().endsWith('i') || instructorData.name?.split(' ')[1]?.toLowerCase().endsWith('o') || false;
  const defaultImage = isMale ? '/default-male.png' : '/default-female.png';

  const hourOptions = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: `${i.toString().padStart(2, '0')}:00`,
  }));

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-[#4154f1] text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center">
          <Image src="/images/logo.png" alt="College Logo" width={40} height={40} className="rounded-full mr-2" />
          <Link href="/instructor_dashboard" className="text-xl font-bold text-white no-underline">
            College Attendance System
          </Link>
        </div>
        <div className="flex items-center">
          <div className="rounded-full bg-gray-200 flex items-center justify-center mr-2" style={{ width: 40, height: 40 }}>
            <FontAwesomeIcon icon={faUser} className="text-gray-500" style={{ fontSize: 24 }} />
          </div>
          <div>
            <h6 className="mb-0 text-sm font-medium">{user.name || instructorData.name}</h6>
            <small className="text-gray-200 text-xs">{user.userId}</small>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md mb-5 p-2">
          <ul className="flex flex-wrap">
            <li className="mr-2">
              <Link
                href="/instructor_dashboard"
                className="flex items-center text-[#4154f1] px-3 py-2 rounded-md bg-[#4154f1]/10"
              >
                <FontAwesomeIcon icon={faTachometerAlt} className="mr-2" /> Dashboard
              </Link>
            </li>
            <li className="mr-2">
              <Link
                href="/instructor_profile"
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
          <div className="bg-white rounded-lg shadow-md p-5 mb-5">
            <div className="flex flex-col md:flex-row justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Welcome, <span className="font-bold">{instructorData.name?.split(' ')[1] || ''}!</span>
                </h4>
                <p className="text-gray-600">{user.department || instructorData.department}</p>
              </div>
              <div className="mt-3 md:mt-0">
                <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded flex items-center">
                  <FontAwesomeIcon icon={faInfoCircle} className="mr-2" /> Students need <strong>90%</strong> attendance to be eligible for final exams.
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between mb-5">
            <div className="flex-1 bg-white rounded-lg shadow-md p-4 m-1 text-center">
              <div className="text-gray-600 text-sm">Total Students</div>
              <div className="text-2xl font-bold text-gray-900">{instructorData.totalStudents || 0}</div>
            </div>
            <div className="flex-1 bg-white rounded-lg shadow-md p-4 m-1 text-center">
              <div className="text-gray-600 text-sm">Students Above 90%</div>
              <div className="text-2xl font-bold text-[#2ecc71]">{instructorData.goodAttendance || 0}</div>
            </div>
            <div className="flex-1 bg-white rounded-lg shadow-md p-4 m-1 text-center">
              <div className="text-gray-600 text-sm">Students At Risk (80-90%)</div>
              <div className="text-2xl font-bold text-[#f39c12]">{instructorData.warningAttendance || 0}</div>
            </div>
            <div className="flex-1 bg-white rounded-lg shadow-md p-4 m-1 text-center">
              <div className="text-gray-600 text-sm">
                Critical Attendance ({`< 80%`})
              </div>
              <div className="text-2xl font-bold text-[#e74c3c]">
                {instructorData?.criticalAttendance || 0}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-5">
            <h5 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <FontAwesomeIcon icon={faUserCheck} className="mr-3 text-[#4154f1] text-xl" /> Update Attendance
            </h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-3">Select Module</label>
                <select
                  className="w-full border-2 border-gray-300 rounded-lg shadow-sm focus:ring-[#4154f1] focus:border-[#4154f1] text-lg py-2.5 px-4 text-black font-bold bg-white"
                  value={selectedModule}
                  onChange={handleModuleChange}
                >
                  <option value="">Select a module</option>
                  {getModuleOptions().map((module, index) => (
                    <option key={index} value={module.code}>{module.name} ({module.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-3">Select Year</label>
                <select
                  className="w-full border-2 border-gray-300 rounded-lg shadow-sm focus:ring-[#4154f1] focus:border-[#4154f1] text-lg py-2.5 px-4 text-black font-bold bg-white"
                  value={selectedYear}
                  onChange={handleYearChange}
                >
                  <option value="">Select a year</option>
                  <option value="1st">1st Year</option>
                  <option value="2nd">2nd Year</option>
                  <option value="3rd">3rd Year</option>
                  <option value="4th">4th Year</option>
                </select>
              </div>
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-3">Date</label>
                <input
                  type="date"
                  className="w-full border-2 border-gray-300 rounded-lg shadow-sm focus:ring-[#4154f1] focus:border-[#4154f1] text-lg py-2.5 px-4 text-black font-bold bg-white"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setShowPreview(false);
                  }}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-lg font-bold text-gray-900 mb-3">Time Slot</label>
                <div className="flex gap-3">
                  <select
                    className="flex-1 border-2 border-gray-300 rounded-lg shadow-sm focus:ring-[#4154f1] focus:border-[#4154f1] text-lg py-2.5 px-4 text-black font-bold bg-white"
                    value={startHour}
                    onChange={(e) => {
                      setStartHour(parseInt(e.target.value));
                      setShowPreview(false);
                    }}
                  >
                    {hourOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    className="w-28 border-2 border-gray-300 rounded-lg shadow-sm focus:ring-[#4154f1] focus:border-[#4154f1] text-lg py-2.5 px-4 text-black font-bold bg-white"
                    value={hours}
                    min="1"
                    max="8"
                    onChange={(e) => {
                      setHours(Math.max(1, Math.min(8, parseInt(e.target.value) || 1)));
                      setShowPreview(false);
                    }}
                    placeholder="Hours"
                  />
                </div>
              </div>
            </div>

            {message && (
              <div className={`mb-6 p-4 rounded-lg text-lg font-medium ${
                message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {message.text}
              </div>
            )}

            {selectedModule && (
              <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div className="relative w-full md:w-96">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-4 text-gray-600 text-lg" />
                    <input
                      type="text"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg shadow-sm focus:ring-[#4154f1] focus:border-[#4154f1] text-lg text-black font-bold bg-white"
                      placeholder="Search students by name or ID..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    <button
                      onClick={() => handleBulkAction('present')}
                      className="flex-1 md:flex-none px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-lg font-semibold transition-colors"
                    >
                      Mark All Present
                    </button>
                    <button
                      onClick={() => handleBulkAction('absent')}
                      className="flex-1 md:flex-none px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 text-lg font-semibold transition-colors"
                    >
                      Mark All Absent
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto bg-white rounded-lg border-2 border-gray-200">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-4 text-lg font-bold text-gray-900">Student ID</th>
                        <th className="p-4 text-lg font-bold text-gray-900">Name</th>
                        <th className="p-4 text-lg font-bold text-gray-900">Attendance</th>
                        <th className="p-4 text-lg font-bold text-gray-900">Status</th>
                        <th className="p-4 text-lg font-bold text-gray-900 text-center">Present</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students
                        .filter(student => 
                          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.userId.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((student) => (
                          <tr key={student.id} className="border-t-2 border-gray-200 hover:bg-gray-50">
                            <td className="p-4 text-lg text-gray-900 font-medium">{student.userId}</td>
                            <td className="p-4 text-lg text-gray-900 font-medium">{student.name}</td>
                            <td className="p-4 text-lg text-gray-900 font-medium">{student.attendance || 0}%</td>
                            <td className="p-4">
                              <span className={`px-4 py-2 rounded-full text-base font-semibold ${
                                student.status === 'good' ? 'bg-green-100 text-green-800' :
                                student.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                student.status === 'critical' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {student.status ? student.status.charAt(0).toUpperCase() + student.status.slice(1) : 'Pending'}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <label className="inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={attendanceUpdates[student.id] ?? true}
                                  onChange={(e) => {
                                    handleAttendanceChange(student.id, e.target.checked);
                                    setShowPreview(false);
                                  }}
                                  className="h-6 w-6 text-[#4154f1] focus:ring-[#4154f1] border-2 border-gray-300 rounded"
                                />
                              </label>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {showPreview && previewData && (
                  <div className="mt-8 p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
                    <h6 className="text-xl font-bold text-gray-900 mb-4">Attendance Summary</h6>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-lg text-gray-700 font-medium">Module</p>
                        <p className="text-xl font-bold text-gray-900 mt-1">{previewData.module}</p>
                      </div>
                      <div>
                        <p className="text-lg text-gray-700 font-medium">Date & Time</p>
                        <p className="text-xl font-bold text-gray-900 mt-1">{previewData.date} ({previewData.time})</p>
                      </div>
                      <div>
                        <p className="text-lg text-gray-700 font-medium">Present Students</p>
                        <p className="text-xl font-bold text-green-700 mt-1">{previewData.presentCount}</p>
                      </div>
                      <div>
                        <p className="text-lg text-gray-700 font-medium">Absent Students</p>
                        <p className="text-xl font-bold text-red-700 mt-1">{previewData.absentCount}</p>
                      </div>
                      <div>
                        <p className="text-lg text-gray-700 font-medium">Total Students</p>
                        <p className="text-xl font-bold text-gray-900 mt-1">{previewData.totalStudents}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-8 flex justify-end gap-4">
                  {showPreview && (
                    <button
                      onClick={() => setShowPreview(false)}
                      className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 text-lg font-semibold transition-colors"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={handleSubmitAttendance}
                    disabled={Object.keys(attendanceUpdates).length === 0 || isSubmitting}
                    className={`px-8 py-3 rounded-lg text-white text-lg font-semibold transition-colors ${
                      isSubmitting || Object.keys(attendanceUpdates).length === 0
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-[#4154f1] hover:bg-[#3141e1]'
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </span>
                    ) : showPreview ? (
                      'Confirm & Submit'
                    ) : (
                      'Preview & Submit'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="bg-[#2c3e50] text-white py-4 text-center mt-8">
        <div className="container mx-auto">
          <p className="mb-0">© 2025 College Attendance System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}