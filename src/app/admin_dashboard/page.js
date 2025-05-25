"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTachometerAlt, faUser, faSignOutAlt, faUsers, faBook, faClipboardList } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../hooks/useAuth";

// Add these constants at the top of the file, after the imports
const YEARS = ['1st', '2nd', '3rd', '4th'];
const SEMESTERS = ['1', '2'];

export default function AdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, isLoading, error: authError, user, logout } = useAuth("admin");
  const [activeTab, setActiveTab] = useState("dashboard");

  // Student management state
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [studentForm, setStudentForm] = useState({
    userId: '', name: '', department: '', year: '', email: '', phone: '', address: '', emergencyContact: '', semester: '', program: '', password: '',
  });
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);

  // Teacher management state
  const [teachers, setTeachers] = useState([]);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [editTeacher, setEditTeacher] = useState(null);
  const [teacherForm, setTeacherForm] = useState({
    userId: '', name: '', department: '', facultyRole: '', email: '', phone: '', address: '', qualification: '', specialization: '', officeNumber: '', modules: '', password: '',
  });
  const [showTeacherModuleModal, setShowTeacherModuleModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  // Student filter state
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [allDepartments, setAllDepartments] = useState([]);
  const [allYears, setAllYears] = useState([]);
  const [allSemesters, setAllSemesters] = useState([]);

  // Teacher module state
  const [assignModulesDept, setAssignModulesDept] = useState('');
  const [assignModulesYear, setAssignModulesYear] = useState('');
  const [assignModulesList, setAssignModulesList] = useState([]);
  const [assignModulesSelected, setAssignModulesSelected] = useState([]);

  // Teacher filter state
  const [selectedCourse, setSelectedCourse] = useState('');

  // Update the state declarations
  const [modules, setModules] = useState([]);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [moduleForm, setModuleForm] = useState({
    code: '',
    name: '',
    department: '',
    year: '',
    semester: '',
    credits: '',
    description: ''
  });
  const [filterModuleDept, setFilterModuleDept] = useState('');
  const [filterModuleYear, setFilterModuleYear] = useState('');
  const [filterModuleSemester, setFilterModuleSemester] = useState('');

  // Attendance state
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [attendanceSummary, setAttendanceSummary] = useState([]);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);

  // Add allModules state
  const [allModules, setAllModules] = useState([]);

  // Filter modules for dropdown
  const filteredModules = allModules.filter(module => {
    if (!module) return false;
    if (selectedDepartment && selectedYear) {
      return module.department === selectedDepartment && module.year === selectedYear;
    }
    if (selectedDepartment) {
      return module.department === selectedDepartment;
    }
    if (selectedYear) {
      return module.year === selectedYear;
    }
    return true;
  });

  // Reset selectedModule if department or year changes
  useEffect(() => {
    setSelectedModule('');
  }, [selectedDepartment, selectedYear]);

  useEffect(() => {
    if (activeTab === 'students') {
      fetchStudents();
    }
    if (activeTab === 'teachers') fetchTeachers();
    if (activeTab === 'modules') fetchModules();
    if (activeTab === 'attendance') {
      fetchAttendanceData();
      // Fetch modules if not already loaded
      if (allModules.length === 0) {
        fetchModules().then(data => {
          setAllModules(data);
        });
      }
    }
  }, [activeTab, allModules.length, fetchAttendanceData]);

  async function fetchStudents() {
    setStudentsLoading(true);
    const res = await fetch('/api/admin/students');
    const data = await res.json();
    setStudents(data);
    // Extract unique departments, years, semesters
    setAllDepartments([...new Set(data.map(s => s.department).filter(Boolean))]);
    setAllYears([...new Set(data.map(s => s.year).filter(Boolean))]);
    setAllSemesters([...new Set(data.map(s => s.semester).filter(Boolean))]);
    setStudentsLoading(false);
  }

  async function fetchTeachers() {
    try {
      setTeachersLoading(true);
      const res = await fetch('/api/admin/teachers');
      if (!res.ok) {
        throw new Error('Failed to fetch teachers');
      }
      const data = await res.json();
      console.log('Fetched teachers:', data); // Debug log
      setTeachers(data);
      // Extract unique departments for the filter
      const departments = [...new Set(data.map(t => t.department).filter(Boolean))];
      setAllDepartments(departments);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setTeachersLoading(false);
    }
  }

  function openAddStudentModal() {
    setEditStudent(null);
    setStudentForm({ userId: '', name: '', department: '', year: '', email: '', phone: '', address: '', emergencyContact: '', semester: '', program: '', password: '' });
    setShowStudentModal(true);
  }

  function openEditStudentModal(student) {
    setEditStudent(student);
    setStudentForm({ ...student, password: '' });
    setShowStudentModal(true);
  }

  async function handleDeleteStudent(id) {
    if (!confirm('Are you sure you want to delete this student?')) return;
    await fetch(`/api/admin/students/${id}`, { method: 'DELETE' });
    fetchStudents();
  }

  async function handleStudentSubmit(e) {
    e.preventDefault();
    if (editStudent) {
      await fetch(`/api/admin/students/${editStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentForm),
      });
    } else {
      await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentForm),
      });
    }
    setShowStudentModal(false);
    fetchStudents();
  }

  function openAddTeacherModal() {
    setEditTeacher(null);
    setTeacherForm({ userId: '', name: '', department: '', facultyRole: '', email: '', phone: '', address: '', qualification: '', specialization: '', officeNumber: '', modules: '', password: '' });
    setShowTeacherModal(true);
  }

  function openEditTeacherModal(teacher) {
    setEditTeacher(teacher);
    setTeacherForm({ ...teacher, password: '' });
    setShowTeacherModal(true);
  }

  async function handleDeleteTeacher(id) {
    if (!confirm('Are you sure you want to delete this teacher?')) return;
    await fetch(`/api/admin/teachers/${id}`, { method: 'DELETE' });
    fetchTeachers();
  }

  async function handleTeacherSubmit(e) {
    e.preventDefault();
    if (editTeacher) {
      await fetch(`/api/admin/teachers/${editTeacher.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacherForm),
      });
    } else {
      await fetch('/api/admin/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacherForm),
      });
    }
    setShowTeacherModal(false);
    fetchTeachers();
  }

  function openTeacherModuleModal(teacher) {
    setSelectedTeacher(teacher);
    setAssignModulesDept(teacher.department);
    setAssignModulesYear('');
    setAssignModulesList([]);
    setAssignModulesSelected(teacher.modules || []);
    setShowTeacherModuleModal(true);
  }

  function filteredStudents() {
    return students.filter(s =>
      (!filterDepartment || s.department === filterDepartment) &&
      (!filterYear || s.year === filterYear) &&
      (!filterSemester || s.semester === filterSemester)
    );
  }

  // Fetch modules for department and year
  async function fetchModulesForDeptYear(dept, year) {
    if (!dept || !year) {
      setAssignModulesList([]);
      return;
    }
    const res = await fetch(`/api/admin/modules?department=${dept}&year=${year}`);
    const data = await res.json();
    setAssignModulesList(data.modules || []);
  }

  useEffect(() => {
    if (assignModulesDept && assignModulesYear) {
      fetchModulesForDeptYear(assignModulesDept, assignModulesYear);
    }
  }, [assignModulesDept, assignModulesYear]);

  async function handleAssignModulesSave() {
    // Update teacher's modules
    await fetch(`/api/admin/teachers/${selectedTeacher.id}/modules`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modules: assignModulesSelected }),
    });
    setShowTeacherModuleModal(false);
    fetchTeachers();
  }

  // Update the fetchModules function
  async function fetchModules() {
    try {
      setModulesLoading(true);
      console.log('Fetching modules...'); // Debug log

      const res = await fetch('/api/admin/modules');
      console.log('Response status:', res.status); // Debug log

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Error response:', errorData); // Debug log
        throw new Error(errorData.details || 'Failed to fetch modules');
      }

      const data = await res.json();
      console.log('Fetched modules:', data); // Debug log

      if (!Array.isArray(data)) {
        console.error('Invalid data format:', data); // Debug log
        throw new Error('Invalid data format received from server');
      }

      setModules(data);
      setAllModules(data); // Store modules in allModules as well
      
      // Extract unique departments from modules
      const departments = [...new Set(data.map(m => m.department).filter(Boolean))];
      setAllDepartments(departments);
      
      return data; // Return the data
    } catch (error) {
      console.error('Error in fetchModules:', error);
      setModules([]); // Set empty array on error
      setAllModules([]); // Set empty array on error
      alert('Failed to fetch modules. Please try again later.');
      return []; // Return empty array on error
    } finally {
      setModulesLoading(false);
    }
  }

  // Update the useEffect to handle errors
  useEffect(() => {
    if (activeTab === 'modules') {
      console.log('Active tab changed to modules, fetching...'); // Debug log
      fetchModules().catch(error => {
        console.error('Error in modules useEffect:', error);
      });
    }
  }, [activeTab]);

  function openAddModuleModal() {
    setModuleForm({
      code: '',
      name: '',
      department: '',
      year: '',
      semester: '',
      credits: '',
      description: ''
    });
    setShowModuleModal(true);
  }

  async function handleDeleteModule(id) {
    if (!confirm('Are you sure you want to delete this module? This action cannot be undone.')) return;
    
    try {
      const response = await fetch(`/api/admin/modules/${id}`, { 
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete module');
      }

      // Refresh the modules list
      await fetchModules();
      alert('Module deleted successfully');
    } catch (error) {
      console.error('Error deleting module:', error);
      alert(error.message || 'Failed to delete module. Please try again.');
    }
  }

  // Fetch attendance summary when filters change
  const fetchAttendanceData = useCallback(async () => {
    setIsLoadingAttendance(true);
    try {
      const queryParams = new URLSearchParams();
      if (selectedDepartment) queryParams.append('department', selectedDepartment);
      if (selectedYear) queryParams.append('year', selectedYear);
      if (selectedModule) queryParams.append('moduleCode', selectedModule);

      const response = await fetch(`/api/admin/attendance?${queryParams.toString()}`);
      const data = await response.json();
      
      if (response.ok) {
        setAttendanceSummary(data.summary);
      } else {
        console.error('Failed to fetch attendance data:', data.error);
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setIsLoadingAttendance(false);
    }
  }, [selectedDepartment, selectedYear, selectedModule]);

  // Add filtered attendance summary
  const filteredAttendanceSummary = attendanceSummary.filter(row => {
    if (selectedDepartment && row.department !== selectedDepartment) return false;
    if (selectedYear && row.year !== selectedYear) return false;
    if (selectedModule && row.moduleCode !== selectedModule) return false;
    return true;
  });

  if (isLoading) return <div className="text-center text-gray-600 py-4">Loading...</div>;
  if (!isAuthenticated) return null;
  if (authError) return <div className="text-center text-red-600 py-4">{authError}</div>;

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-[#4154f1] text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center">
          <Image src="/images/logo.png" alt="College Logo" width={40} height={40} className="rounded-full mr-2" />
          <Link href="/admin_dashboard" className="text-xl font-bold text-white no-underline">
            College Attendance System
          </Link>
        </div>
        <div className="flex items-center">
          <div className="rounded-full bg-gray-200 flex items-center justify-center mr-2" style={{ width: 40, height: 40 }}>
            <FontAwesomeIcon icon={faUser} className="text-gray-500" style={{ fontSize: 24 }} />
          </div>
          <div>
            <h6 className="mb-0 text-sm font-medium">{user.name}</h6>
            <small className="text-gray-200 text-xs">{user.userId}</small>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md mb-5 p-2">
          <ul className="flex flex-wrap">
            <li className="mr-2">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`flex items-center text-[#4154f1] px-3 py-2 rounded-md ${activeTab === "dashboard" ? "bg-[#4154f1]/10" : "hover:bg-[#4154f1]/10"}`}
              >
                <FontAwesomeIcon icon={faTachometerAlt} className="mr-2" /> Dashboard
              </button>
            </li>
            <li className="mr-2">
              <button
                onClick={() => setActiveTab("students")}
                className={`flex items-center text-[#4154f1] px-3 py-2 rounded-md ${activeTab === "students" ? "bg-[#4154f1]/10" : "hover:bg-[#4154f1]/10"}`}
              >
                <FontAwesomeIcon icon={faUsers} className="mr-2" /> Manage Students
              </button>
            </li>
            <li className="mr-2">
              <button
                onClick={() => setActiveTab("teachers")}
                className={`flex items-center text-[#4154f1] px-3 py-2 rounded-md ${activeTab === "teachers" ? "bg-[#4154f1]/10" : "hover:bg-[#4154f1]/10"}`}
              >
                <FontAwesomeIcon icon={faUser} className="mr-2" /> Manage Teachers
              </button>
            </li>
            <li className="mr-2">
              <button
                onClick={() => setActiveTab("modules")}
                className={`flex items-center text-[#4154f1] px-3 py-2 rounded-md ${activeTab === "modules" ? "bg-[#4154f1]/10" : "hover:bg-[#4154f1]/10"}`}
              >
                <FontAwesomeIcon icon={faBook} className="mr-2" /> Manage Modules
              </button>
            </li>
            <li className="mr-2">
              <button
                onClick={() => setActiveTab("attendance")}
                className={`flex items-center text-[#4154f1] px-3 py-2 rounded-md ${activeTab === "attendance" ? "bg-[#4154f1]/10" : "hover:bg-[#4154f1]/10"}`}
              >
                <FontAwesomeIcon icon={faClipboardList} className="mr-2" /> View Attendance
              </button>
            </li>
            <li className="ml-auto">
              <button
                onClick={logout}
                className="flex items-center text-[#4154f1] px-3 py-2 rounded-md hover:bg-[#4154f1]/10"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" /> Logout
              </button>
            </li>
          </ul>
        </div>

        <div className="content-area">
          {activeTab === "dashboard" && (
            <div className="bg-white rounded-lg shadow-md p-5 mb-5">
              <h1 className="text-2xl font-bold mb-4 text-black">Welcome, {user.name}!</h1>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Total Students</h3>
                  <p className="text-3xl font-bold text-blue-600">{students.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Total Teachers</h3>
                  <p className="text-3xl font-bold text-green-600">{teachers.length}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <h3 className="text-lg font-semibold text-purple-800 mb-2">Total Modules</h3>
                  <p className="text-3xl font-bold text-purple-600">{modules.length}</p>
                </div>
              </div>

              {/* Department Distribution */}
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-4 text-black">Department Distribution</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allDepartments.map(dept => {
                    const deptStudents = students.filter(s => s.department === dept).length;
                    const deptTeachers = teachers.filter(t => t.department === dept).length;
                    const deptModules = modules.filter(m => m.department === dept).length;
                    
                    return (
                      <div key={dept} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">{dept}</h3>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Students: <span className="font-bold">{deptStudents}</span></p>
                          <p className="text-sm text-gray-600">Teachers: <span className="font-bold">{deptTeachers}</span></p>
                          <p className="text-sm text-gray-600">Modules: <span className="font-bold">{deptModules}</span></p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h2 className="text-xl font-bold mb-4 text-black">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button 
                    onClick={() => setActiveTab("students")}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-800 p-4 rounded-lg text-center transition-colors"
                  >
                    <FontAwesomeIcon icon={faUsers} className="text-2xl mb-2" />
                    <p className="font-semibold">Manage Students</p>
                  </button>
                  <button 
                    onClick={() => setActiveTab("teachers")}
                    className="bg-green-100 hover:bg-green-200 text-green-800 p-4 rounded-lg text-center transition-colors"
                  >
                    <FontAwesomeIcon icon={faUser} className="text-2xl mb-2" />
                    <p className="font-semibold">Manage Teachers</p>
                  </button>
                  <button 
                    onClick={() => setActiveTab("modules")}
                    className="bg-purple-100 hover:bg-purple-200 text-purple-800 p-4 rounded-lg text-center transition-colors"
                  >
                    <FontAwesomeIcon icon={faBook} className="text-2xl mb-2" />
                    <p className="font-semibold">Manage Modules</p>
                  </button>
                  <button 
                    onClick={() => setActiveTab("attendance")}
                    className="bg-orange-100 hover:bg-orange-200 text-orange-800 p-4 rounded-lg text-center transition-colors"
                  >
                    <FontAwesomeIcon icon={faClipboardList} className="text-2xl mb-2" />
                    <p className="font-semibold">View Attendance</p>
                  </button>
                </div>
              </div>
            </div>
          )}
          {activeTab === "students" && (
            <div className="bg-white rounded-lg shadow-md p-5 mb-5">
              <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-black">Department/Course</label>
                  <select className="border p-2 rounded w-full text-black" value={filterDepartment} onChange={e => setFilterDepartment(e.target.value)}>
                    <option value="">All</option>
                    {allDepartments.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-black">Year</label>
                  <select className="border p-2 rounded w-full text-black" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
                    <option value="">All</option>
                    {allYears.map(year => <option key={year} value={year}>{year}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-black">Semester</label>
                  <select className="border p-2 rounded w-full text-black" value={filterSemester} onChange={e => setFilterSemester(e.target.value)}>
                    <option value="">All</option>
                    {allSemesters.map(sem => <option key={sem} value={sem}>{sem}</option>)}
                  </select>
                </div>
                <button className="bg-[#4154f1] text-white px-4 py-2 rounded mt-4 md:mt-0" onClick={fetchStudents}>Reset</button>
              </div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Manage Students</h2>
                <button onClick={openAddStudentModal} className="bg-indigo-600 text-white px-4 py-2 rounded">Add Student</button>
              </div>
              {studentsLoading ? (
                <div>Loading...</div>
              ) : (
                <table className="min-w-full bg-white border text-black">
                  <thead>
                    <tr>
                      <th className="border px-4 py-2 text-black">User ID</th>
                      <th className="border px-4 py-2 text-black">Name</th>
                      <th className="border px-4 py-2 text-black">Department</th>
                      <th className="border px-4 py-2 text-black">Year</th>
                      <th className="border px-4 py-2 text-black">Semester</th>
                      <th className="border px-4 py-2 text-black">Email</th>
                      <th className="border px-4 py-2 text-black">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents().map((student) => (
                      <tr key={student.id}>
                        <td className="border px-4 py-2 text-black">{student.userId}</td>
                        <td className="border px-4 py-2 text-black">{student.name}</td>
                        <td className="border px-4 py-2 text-black">{student.department}</td>
                        <td className="border px-4 py-2 text-black">{student.year}</td>
                        <td className="border px-4 py-2 text-black">{student.semester}</td>
                        <td className="border px-4 py-2 text-black">{student.email}</td>
                        <td className="border px-4 py-2 text-black">
                          <button onClick={() => openEditStudentModal(student)} className="bg-yellow-400 text-white px-2 py-1 rounded mr-2">Edit</button>
                          <button onClick={() => handleDeleteStudent(student.id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {/* Student Modal */}
              {showStudentModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                  <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
                    <h3 className="text-lg font-bold mb-4 text-black">{editStudent ? 'Edit Student' : 'Add Student'}</h3>
                    <form onSubmit={handleStudentSubmit}>
                      <div className="grid grid-cols-2 gap-4">
                        <input className="border p-2 rounded text-black font-bold" placeholder="User ID" value={studentForm.userId} onChange={e => setStudentForm(f => ({ ...f, userId: e.target.value }))} required />
                        <input className="border p-2 rounded text-black font-bold" placeholder="Name" value={studentForm.name} onChange={e => setStudentForm(f => ({ ...f, name: e.target.value }))} required />
                        <select 
                          className="border p-2 rounded text-black font-bold"
                          value={studentForm.department}
                          onChange={e => setStudentForm(f => ({ ...f, department: e.target.value }))}
                          required
                        >
                          <option value="">Select Department</option>
                          {allDepartments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                        <select 
                          className="border p-2 rounded text-black font-bold"
                          value={studentForm.year}
                          onChange={e => setStudentForm(f => ({ ...f, year: e.target.value }))}
                          required
                        >
                          <option value="">Select Year</option>
                          {allYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                        <input className="border p-2 rounded text-black font-bold" placeholder="Email" value={studentForm.email} onChange={e => setStudentForm(f => ({ ...f, email: e.target.value }))} />
                        <input className="border p-2 rounded text-black font-bold" placeholder="Phone" value={studentForm.phone} onChange={e => setStudentForm(f => ({ ...f, phone: e.target.value }))} />
                        <input className="border p-2 rounded text-black font-bold" placeholder="Address" value={studentForm.address} onChange={e => setStudentForm(f => ({ ...f, address: e.target.value }))} />
                        <input className="border p-2 rounded text-black font-bold" placeholder="Emergency Contact" value={studentForm.emergencyContact} onChange={e => setStudentForm(f => ({ ...f, emergencyContact: e.target.value }))} />
                        <select 
                          className="border p-2 rounded text-black font-bold"
                          value={studentForm.semester}
                          onChange={e => setStudentForm(f => ({ ...f, semester: e.target.value }))}
                          required
                        >
                          <option value="">Select Semester</option>
                          {allSemesters.map(sem => (
                            <option key={sem} value={sem}>{sem}</option>
                          ))}
                        </select>
                        <input className="border p-2 rounded text-black font-bold" placeholder="Program" value={studentForm.program} onChange={e => setStudentForm(f => ({ ...f, program: e.target.value }))} />
                        <input className="border p-2 rounded text-black font-bold" placeholder="Password" type="password" value={studentForm.password} onChange={e => setStudentForm(f => ({ ...f, password: e.target.value }))} />
                      </div>
                      <div className="flex justify-end mt-4">
                        <button type="button" onClick={() => setShowStudentModal(false)} className="mr-2 px-4 py-2 rounded bg-gray-300 font-bold hover:bg-gray-400">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded bg-indigo-600 text-white font-bold hover:bg-indigo-700">Save</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              {/* Module Modal (placeholder) */}
              {showModuleModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                  <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                    <h3 className="text-lg font-bold mb-4">Assign Modules (Coming Soon)</h3>
                    <div className="flex justify-end mt-4">
                      <button type="button" onClick={() => setShowModuleModal(false)} className="px-4 py-2 rounded bg-gray-300">Close</button>
                    </div>
                  </div>
                </div>
              )}
              {/* Attendance Modal (placeholder) */}
              {showAttendanceModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                  <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl">
                    <h3 className="text-lg font-bold mb-4">Attendance Details</h3>
                    <div className="overflow-x-auto max-h-96">
                      <table className="min-w-full bg-white border">
                        <thead>
                          <tr>
                            <th className="border px-2 py-1">Date</th>
                            <th className="border px-2 py-1">Module</th>
                            <th className="border px-2 py-1">Present</th>
                            <th className="border px-2 py-1">Absent</th>
                            <th className="border px-2 py-1">Percent</th>
                            <th className="border px-2 py-1">Time</th>
                            <th className="border px-2 py-1">Venue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendanceData.map((row, idx) => (
                            <tr key={idx}>
                              <td className="border px-2 py-1">{row.date}</td>
                              <td className="border px-2 py-1">{row.module}</td>
                              <td className="border px-2 py-1">{row.present}</td>
                              <td className="border px-2 py-1">{row.absent}</td>
                              <td className="border px-2 py-1">{row.percent}%</td>
                              <td className="border px-2 py-1">{row.time}</td>
                              <td className="border px-2 py-1">{row.venue}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex justify-end mt-4">
                      <button type="button" onClick={() => setShowAttendanceModal(false)} className="px-4 py-2 rounded bg-gray-300">Close</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === "teachers" && (
            <div className="bg-white rounded-lg shadow-md p-5 mb-5">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-black">Manage Teachers</h2>
                <button onClick={openAddTeacherModal} className="bg-indigo-600 text-white px-4 py-2 rounded font-bold">Add Teacher</button>
              </div>

              {/* Filter Section */}
              <div className="mb-4 flex gap-4">
                <select 
                  className="border p-2 rounded text-black font-bold"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  <option value="">All Courses</option>
                  {allDepartments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {teachersLoading ? (
                <div className="text-black font-bold">Loading...</div>
              ) : teachers.length === 0 ? (
                <div className="text-black font-bold">No teachers found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border px-4 py-2 text-black font-bold">User ID</th>
                        <th className="border px-4 py-2 text-black font-bold">Name</th>
                        <th className="border px-4 py-2 text-black font-bold">Department</th>
                        <th className="border px-4 py-2 text-black font-bold">Role</th>
                        <th className="border px-4 py-2 text-black font-bold">Email</th>
                        <th className="border px-4 py-2 text-black font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teachers
                        .filter(teacher => !selectedCourse || teacher.department === selectedCourse)
                        .map((teacher) => (
                          <tr key={teacher.id} className="hover:bg-gray-50">
                            <td className="border px-4 py-2 text-black font-bold">{teacher.userId}</td>
                            <td className="border px-4 py-2 text-black font-bold">{teacher.name}</td>
                            <td className="border px-4 py-2 text-black font-bold">{teacher.department}</td>
                            <td className="border px-4 py-2 text-black font-bold">{teacher.facultyRole}</td>
                            <td className="border px-4 py-2 text-black font-bold">{teacher.email}</td>
                            <td className="border px-4 py-2 text-black font-bold">
                              <button 
                                onClick={() => openEditTeacherModal(teacher)} 
                                className="bg-yellow-400 text-white px-2 py-1 rounded mr-2 font-bold hover:bg-yellow-500"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteTeacher(teacher.id)} 
                                className="bg-red-500 text-white px-2 py-1 rounded font-bold hover:bg-red-600"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Teacher Modal */}
              {showTeacherModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                  <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
                    <h3 className="text-lg font-bold mb-4 text-black">{editTeacher ? 'Edit Teacher' : 'Add Teacher'}</h3>
                    <form onSubmit={handleTeacherSubmit}>
                      <div className="grid grid-cols-2 gap-4">
                        <input className="border p-2 rounded text-black font-bold" placeholder="User ID" value={teacherForm.userId} onChange={e => setTeacherForm(f => ({ ...f, userId: e.target.value }))} required />
                        <input className="border p-2 rounded text-black font-bold" placeholder="Name" value={teacherForm.name} onChange={e => setTeacherForm(f => ({ ...f, name: e.target.value }))} required />
                        <select 
                          className="border p-2 rounded text-black font-bold"
                          value={teacherForm.department}
                          onChange={e => setTeacherForm(f => ({ ...f, department: e.target.value }))}
                          required
                        >
                          <option value="">Select Department</option>
                          {allDepartments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                        <input className="border p-2 rounded text-black font-bold" placeholder="Role" value={teacherForm.facultyRole} onChange={e => setTeacherForm(f => ({ ...f, facultyRole: e.target.value }))} required />
                        <input className="border p-2 rounded text-black font-bold" placeholder="Email" value={teacherForm.email} onChange={e => setTeacherForm(f => ({ ...f, email: e.target.value }))} />
                        <input className="border p-2 rounded text-black font-bold" placeholder="Phone" value={teacherForm.phone} onChange={e => setTeacherForm(f => ({ ...f, phone: e.target.value }))} />
                        <input className="border p-2 rounded text-black font-bold" placeholder="Address" value={teacherForm.address} onChange={e => setTeacherForm(f => ({ ...f, address: e.target.value }))} />
                        <input className="border p-2 rounded text-black font-bold" placeholder="Qualification" value={teacherForm.qualification} onChange={e => setTeacherForm(f => ({ ...f, qualification: e.target.value }))} />
                        <input className="border p-2 rounded text-black font-bold" placeholder="Specialization" value={teacherForm.specialization} onChange={e => setTeacherForm(f => ({ ...f, specialization: e.target.value }))} />
                        <input className="border p-2 rounded text-black font-bold" placeholder="Office Number" value={teacherForm.officeNumber} onChange={e => setTeacherForm(f => ({ ...f, officeNumber: e.target.value }))} />
                        <input className="border p-2 rounded text-black font-bold" placeholder="Password" type="password" value={teacherForm.password} onChange={e => setTeacherForm(f => ({ ...f, password: e.target.value }))} />
                      </div>
                      <div className="flex justify-end mt-4">
                        <button type="button" onClick={() => setShowTeacherModal(false)} className="mr-2 px-4 py-2 rounded bg-gray-300 font-bold hover:bg-gray-400">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded bg-indigo-600 text-white font-bold hover:bg-indigo-700">Save</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Assign Modules Modal */}
              {showTeacherModuleModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                  <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                    <h3 className="text-lg font-bold mb-4 text-black">Assign Modules to {selectedTeacher?.name}</h3>
                    <div className="mb-4">
                      <label className="block font-bold mb-1 text-black">Department</label>
                      <select 
                        className="border p-2 rounded w-full text-black font-bold"
                        value={assignModulesDept}
                        onChange={e => setAssignModulesDept(e.target.value)}
                      >
                        <option value="">Select Department</option>
                        {allDepartments.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block font-bold mb-1 text-black">Year</label>
                      <select 
                        className="border p-2 rounded w-full text-black font-bold"
                        value={assignModulesYear}
                        onChange={e => setAssignModulesYear(e.target.value)}
                      >
                        <option value="">Select Year</option>
                        {allYears.map(year => <option key={year} value={year}>{year}</option>)}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block font-bold mb-1 text-black">Modules</label>
                      <select 
                        multiple 
                        className="border p-2 rounded w-full text-black font-bold h-32"
                        value={assignModulesSelected}
                        onChange={e => setAssignModulesSelected(Array.from(e.target.selectedOptions, o => o.value))}
                      >
                        {assignModulesList.map(mod => (
                          <option key={mod.code} value={mod.code}>{mod.name} ({mod.code})</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex justify-end mt-4">
                      <button 
                        type="button" 
                        onClick={() => setShowTeacherModuleModal(false)} 
                        className="px-4 py-2 rounded bg-gray-300 mr-2 font-bold hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                      <button 
                        type="button" 
                        onClick={handleAssignModulesSave} 
                        className="px-4 py-2 rounded bg-indigo-600 text-white font-bold hover:bg-indigo-700"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === "modules" && (
            <div className="bg-white rounded-lg shadow-md p-5 mb-5">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-black">Manage Modules</h2>
                <button onClick={openAddModuleModal} className="bg-indigo-600 text-white px-4 py-2 rounded font-bold">Add Module</button>
              </div>

              {/* Filter Section */}
              <div className="mb-4 flex gap-4">
                <select 
                  className="border p-2 rounded text-black font-bold"
                  value={filterModuleDept}
                  onChange={(e) => setFilterModuleDept(e.target.value)}
                >
                  <option value="">All Departments</option>
                  {allDepartments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <select 
                  className="border p-2 rounded text-black font-bold"
                  value={filterModuleYear}
                  onChange={(e) => setFilterModuleYear(e.target.value)}
                >
                  <option value="">All Years</option>
                  {YEARS.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <select 
                  className="border p-2 rounded text-black font-bold"
                  value={filterModuleSemester}
                  onChange={(e) => setFilterModuleSemester(e.target.value)}
                >
                  <option value="">All Semesters</option>
                  {SEMESTERS.map((sem) => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>

              {modulesLoading ? (
                <div className="text-black font-bold">Loading...</div>
              ) : modules.length === 0 ? (
                <div className="text-black font-bold">No modules found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border px-4 py-2 text-black font-bold">Code</th>
                        <th className="border px-4 py-2 text-black font-bold">Name</th>
                        <th className="border px-4 py-2 text-black font-bold">Department</th>
                        <th className="border px-4 py-2 text-black font-bold">Year</th>
                        <th className="border px-4 py-2 text-black font-bold">Semester</th>
                        <th className="border px-4 py-2 text-black font-bold">Credits</th>
                        <th className="border px-4 py-2 text-black font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modules
                        .filter(module => 
                          (!filterModuleDept || module.department === filterModuleDept) &&
                          (!filterModuleYear || module.year === filterModuleYear) &&
                          (!filterModuleSemester || module.semester === filterModuleSemester)
                        )
                        .map((module) => (
                          <tr key={module.id} className="hover:bg-gray-50">
                            <td className="border px-4 py-2 text-black font-bold">{module.code}</td>
                            <td className="border px-4 py-2 text-black font-bold">{module.name}</td>
                            <td className="border px-4 py-2 text-black font-bold">{module.department}</td>
                            <td className="border px-4 py-2 text-black font-bold">{module.year}</td>
                            <td className="border px-4 py-2 text-black font-bold">Semester {module.semester}</td>
                            <td className="border px-4 py-2 text-black font-bold">{module.credits}</td>
                            <td className="border px-4 py-2 text-black font-bold">
                              <button 
                                onClick={() => handleDeleteModule(module.id)} 
                                className="bg-red-500 text-white px-2 py-1 rounded font-bold hover:bg-red-600"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Module Modal */}
              {showModuleModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                  <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
                    <h3 className="text-lg font-bold mb-4 text-black">Add New Module</h3>
                    <form onSubmit={handleModuleSubmit}>
                      <div className="grid grid-cols-2 gap-4">
                        <input 
                          className="border p-2 rounded text-black font-bold" 
                          placeholder="Module Code" 
                          value={moduleForm.code} 
                          onChange={e => setModuleForm(f => ({ ...f, code: e.target.value }))} 
                          required 
                        />
                        <input 
                          className="border p-2 rounded text-black font-bold" 
                          placeholder="Module Name" 
                          value={moduleForm.name} 
                          onChange={e => setModuleForm(f => ({ ...f, name: e.target.value }))} 
                          required 
                        />
                        <select 
                          className="border p-2 rounded text-black font-bold"
                          value={moduleForm.department}
                          onChange={e => setModuleForm(f => ({ ...f, department: e.target.value }))}
                          required
                        >
                          <option value="">Select Department</option>
                          {allDepartments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                        <select 
                          className="border p-2 rounded text-black font-bold"
                          value={moduleForm.year}
                          onChange={e => setModuleForm(f => ({ ...f, year: e.target.value }))}
                          required
                        >
                          <option value="">Select Year</option>
                          {YEARS.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                        <select 
                          className="border p-2 rounded text-black font-bold"
                          value={moduleForm.semester}
                          onChange={e => setModuleForm(f => ({ ...f, semester: e.target.value }))}
                          required
                        >
                          <option value="">Select Semester</option>
                          {SEMESTERS.map(sem => (
                            <option key={sem} value={sem}>Semester {sem}</option>
                          ))}
                        </select>
                        <input 
                          className="border p-2 rounded text-black font-bold" 
                          type="number" 
                          placeholder="Credits" 
                          value={moduleForm.credits} 
                          onChange={e => setModuleForm(f => ({ ...f, credits: e.target.value }))} 
                          required 
                          min="1"
                          max="6"
                        />
                        <textarea 
                          className="border p-2 rounded text-black font-bold col-span-2" 
                          placeholder="Description" 
                          value={moduleForm.description} 
                          onChange={e => setModuleForm(f => ({ ...f, description: e.target.value }))} 
                          rows="3"
                        />
                      </div>
                      <div className="flex justify-end mt-4">
                        <button 
                          type="button" 
                          onClick={() => setShowModuleModal(false)} 
                          className="mr-2 px-4 py-2 rounded bg-gray-300 font-bold hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="px-4 py-2 rounded bg-indigo-600 text-white font-bold hover:bg-indigo-700"
                        >
                          Add Module
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === "attendance" && (
            <div className="bg-white rounded-lg shadow-md p-5 mb-5">
              <h2 className="text-xl font-bold mb-4 text-black">View Attendance</h2>
              
              {/* Filters */}
              <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-black">Department/Course</label>
                  <select 
                    className="border p-2 rounded w-full text-black font-bold"
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                  >
                    <option value="">All Departments</option>
                    {allDepartments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-1 text-black">Year</label>
                  <select 
                    className="border p-2 rounded w-full text-black font-bold"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    <option value="">All Years</option>
                    {YEARS.map((year) => (
                      <option key={year} value={year}>{year} Year</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1 text-black">Module</label>
                  <select 
                    className="border p-2 rounded w-full text-black font-bold"
                    value={selectedModule}
                    onChange={(e) => setSelectedModule(e.target.value)}
                  >
                    <option value="">All Modules</option>
                    {filteredModules.map((module) => (
                      <option key={module.code} value={module.code}>
                        {module.name} ({module.code})
                      </option>
                    ))}
                  </select>
                </div>

                <button 
                  onClick={fetchAttendanceData} 
                  className="bg-[#4154f1] text-white px-4 py-2 rounded font-bold hover:bg-[#4154f1]/90"
                >
                  Refresh
                </button>
              </div>

              {/* Summary Table */}
              {isLoadingAttendance ? (
                <div className="text-center py-4 text-black font-bold">Loading attendance data...</div>
              ) : filteredAttendanceSummary.length === 0 ? (
                <div className="text-center py-4 text-black font-bold">No attendance records found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border px-4 py-2 text-left text-black font-bold">Student ID</th>
                        <th className="border px-4 py-2 text-left text-black font-bold">Name</th>
                        <th className="border px-4 py-2 text-left text-black font-bold">Department</th>
                        <th className="border px-4 py-2 text-left text-black font-bold">Year</th>
                        <th className="border px-4 py-2 text-left text-black font-bold">Module</th>
                        <th className="border px-4 py-2 text-left text-black font-bold">Instructor</th>
                        <th className="border px-4 py-2 text-left text-black font-bold">Total Present</th>
                        <th className="border px-4 py-2 text-left text-black font-bold">Total Absent</th>
                        <th className="border px-4 py-2 text-left text-black font-bold">Attendance %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAttendanceSummary.map((row, idx) => (
                        <tr key={row.studentId + row.moduleCode} className="hover:bg-gray-50">
                          <td className="border px-4 py-2 text-black">{row.studentId}</td>
                          <td className="border px-4 py-2 text-black">{row.studentName}</td>
                          <td className="border px-4 py-2 text-black">{row.department}</td>
                          <td className="border px-4 py-2 text-black">{row.year}</td>
                          <td className="border px-4 py-2 text-black">{row.moduleName} ({row.moduleCode})</td>
                          <td className="border px-4 py-2 text-black">{row.instructor}</td>
                          <td className="border px-4 py-2 text-black">{row.present}</td>
                          <td className="border px-4 py-2 text-black">{row.absent}</td>
                          <td className="border px-4 py-2 text-black font-bold">{row.percent}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 