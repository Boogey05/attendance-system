'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEdit, faKey, faBook, faGraduationCap, faBuilding, faMapMarkerAlt, faTachometerAlt, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

export default function InstructorProfile() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, error: authError, user, logout } = useAuth('instructor');
  const [instructorData, setInstructorData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [avatarSrc, setAvatarSrc] = useState('');

  useEffect(() => {
    if (!isAuthenticated || authLoading || !user?.userId) return;

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/instructor/profile?userId=${user.userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }
        const data = await response.json();
        setInstructorData(data.profile);
        setError(null);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, authLoading, user]);

  useEffect(() => {
    if (instructorData && instructorData.profilePicture) {
      setAvatarSrc(instructorData.profilePicture);
    } else {
      setAvatarSrc('/default-avatar.png');
    }
  }, [instructorData]);

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
  };

  const handleSaveProfile = async () => {
    try {
      const name = document.getElementById('editName').value;
      const email = document.getElementById('editEmail').value;
      const phone = document.getElementById('editPhone').value;
      const address = document.getElementById('editAddress').value;
      const qualification = document.getElementById('editQualification').value;
      const specialization = document.getElementById('editSpecialization').value;
      const officeNumber = document.getElementById('editOfficeNumber').value;

      const response = await fetch('/api/instructor/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.userId,
          name,
          email,
          phone,
          address,
          qualification,
          specialization,
          officeNumber,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setInstructorData(data.profile);

      const modal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
      modal.hide();

      showAlert('Profile updated successfully!', 'success');
    } catch (err) {
      console.error('Error updating profile:', err);
      showAlert('Failed to update profile: ' + err.message, 'danger');
    }
  };

  const handleShowChangePassword = () => {
    setShowChangePassword((prev) => !prev);
    setPasswordMessage(null);
    setPasswordError(null);
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage(null);
    setPasswordError(null);
    setPasswordLoading(true);
    const currentPassword = document.getElementById('currentPassword')?.value;
    const newPassword = document.getElementById('newPassword')?.value;
    const confirmPassword = document.getElementById('confirmPassword')?.value;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all password fields');
      setPasswordLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      setPasswordLoading(false);
      return;
    }
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.userId,
          currentPassword,
          newPassword,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to change password');
      }
      setPasswordMessage('Password changed successfully!');
      setShowChangePassword(false);
    } catch (err) {
      setPasswordError('Failed to change password: ' + err.message);
    } finally {
      setPasswordLoading(false);
      // Clear fields
      if (document.getElementById('currentPassword')) document.getElementById('currentPassword').value = '';
      if (document.getElementById('newPassword')) document.getElementById('newPassword').value = '';
      if (document.getElementById('confirmPassword')) document.getElementById('confirmPassword').value = '';
    }
  };

  const showAlert = (message, type) => {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    const contentArea = document.querySelector('.content-area');
    contentArea.insertBefore(alertDiv, contentArea.firstChild);
    setTimeout(() => {
      const alert = bootstrap.Alert.getOrCreateInstance(alertDiv);
      alert.close();
    }, 5000);
  };

  if (authLoading || isLoading) return <div className="text-center text-gray-600 py-4">Loading...</div>;
  if (!isAuthenticated) return null;
  if (authError) return <div className="text-center text-red-500 py-4">Error: {authError}</div>;
  if (error) return <div className="text-center text-red-500 py-4">Error: {error}</div>;
  if (!instructorData) return <div className="text-center text-gray-600 py-4">No profile data found</div>;

  return (
    <div className="font-sans bg-gray-100 min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#4154f1] text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center">
          <Image
            src="/images/logo.png"
            alt="College Logo"
            width={40}
            height={40}
            className="rounded-full mr-2"
          />
          <Link href="/instructor_dashboard" className="text-xl font-bold text-white no-underline">
            College Attendance System
          </Link>
        </div>
        <div className="flex items-center">
          <div className="rounded-full bg-gray-200 flex items-center justify-center mr-2" style={{ width: 40, height: 40 }}>
            <FontAwesomeIcon icon={faUser} className="text-gray-500" style={{ fontSize: 24 }} />
          </div>
          <div>
            <h6 className="mb-0 text-sm font-medium">{instructorData.name}</h6>
            <small className="text-gray-200 text-xs">{instructorData.userId}</small>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 flex-grow">
        {/* Navigation Menu */}
        <div className="bg-white rounded-lg shadow-md mb-5 p-2">
          <ul className="flex flex-wrap">
            <li className="mr-2">
              <Link
                href="/instructor_dashboard"
                className="flex items-center text-[#4154f1] px-3 py-2 rounded-md hover:bg-[#4154f1]/10"
              >
                <FontAwesomeIcon icon={faTachometerAlt} className="mr-2" /> Dashboard
              </Link>
            </li>
            <li className="mr-2">
              <Link
                href="/instructor_profile"
                className="flex items-center text-[#4154f1] px-3 py-2 rounded-md bg-[#4154f1]/10"
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
          {/* Welcome Section */}
          <div className="bg-white rounded-lg shadow-md p-5 mb-5">
            <div className="flex flex-col md:flex-row justify-between">
              <div className="flex items-center">
                <div className="rounded-full bg-gray-200 flex items-center justify-center mr-3 shadow-md object-cover" style={{ width: 80, height: 80 }}>
                  <FontAwesomeIcon icon={faUser} className="text-gray-400" style={{ fontSize: 48 }} />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    Welcome, <span className="font-bold">{instructorData.name.split(' ')[0]}!</span>
                  </h4>
                  <p className="text-gray-700 text-base">{instructorData.department} Department</p>
                  <p className="text-gray-600 text-sm">Role: {instructorData.facultyRole}</p>
                </div>
              </div>
            </div>
          </div>
          {/* Profile Details */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-5">
            <h5 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <FontAwesomeIcon icon={faUser} className="mr-3 text-[#4154f1] text-xl" /> Profile Details
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border-b border-gray-200 pb-4">
                <div className="text-sm font-medium text-gray-600">Instructor ID</div>
                <div className="text-lg text-gray-900 font-medium">{instructorData.userId}</div>
              </div>
              <div className="border-b border-gray-200 pb-4">
                <div className="text-sm font-medium text-gray-600">Name</div>
                <div className="text-lg text-gray-900 font-medium">{instructorData.name}</div>
              </div>
              <div className="border-b border-gray-200 pb-4">
                <div className="text-sm font-medium text-gray-600">Email</div>
                <div className="text-lg text-gray-900 font-medium">{instructorData.email}</div>
              </div>
              <div className="border-b border-gray-200 pb-4">
                <div className="text-sm font-medium text-gray-600">Phone</div>
                <div className="text-lg text-gray-900 font-medium">{instructorData.phone}</div>
              </div>
              <div className="border-b border-gray-200 pb-4">
                <div className="text-sm font-medium text-gray-600">Department</div>
                <div className="text-lg text-gray-900 font-medium">{instructorData.department}</div>
              </div>
              <div className="border-b border-gray-200 pb-4">
                <div className="text-sm font-medium text-gray-600">Role</div>
                <div className="text-lg text-gray-900 font-medium">{instructorData.facultyRole}</div>
              </div>
              <div className="border-b border-gray-200 pb-4">
                <div className="text-sm font-medium text-gray-600">Qualification</div>
                <div className="text-lg text-gray-900 font-medium">{instructorData.qualification}</div>
              </div>
              <div className="border-b border-gray-200 pb-4">
                <div className="text-sm font-medium text-gray-600">Specialization</div>
                <div className="text-lg text-gray-900 font-medium">{instructorData.specialization}</div>
              </div>
              <div className="border-b border-gray-200 pb-4">
                <div className="text-sm font-medium text-gray-600">Office Number</div>
                <div className="text-lg text-gray-900 font-medium">{instructorData.officeNumber}</div>
              </div>
              <div className="border-b border-gray-200 pb-4">
                <div className="text-sm font-medium text-gray-600">Address</div>
                <div className="text-lg text-gray-900 font-medium">{instructorData.address}</div>
              </div>
            </div>
            {/* Assigned Modules */}
            <div className="mt-8">
              <h5 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <FontAwesomeIcon icon={faBook} className="mr-3 text-[#4154f1] text-xl" /> Assigned Modules
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {instructorData.modules.map((module) => (
                  <div key={module.code} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h6 className="font-semibold text-gray-900">{module.name}</h6>
                    <p className="text-sm text-gray-600">Code: {module.code}</p>
                    <p className="text-sm text-gray-600">Total Classes: {module.totalClasses}</p>
                    <p className="text-sm text-gray-600">Requirement: {module.requirement}%</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6">
              <button
                className="bg-[#4154f1] text-white px-6 py-3 rounded-lg hover:bg-[#3141e1] text-lg font-semibold transition-colors flex items-center"
                onClick={handleShowChangePassword}
              >
                <FontAwesomeIcon icon={faKey} className="mr-2" /> Change Password
              </button>
              {showChangePassword && (
                <form className="mt-6 bg-gray-50 p-4 rounded-lg shadow-inner max-w-lg" onSubmit={handleSavePassword}>
                <div className="mb-4">
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-black mb-2">Current Password</label>
                  <input
                      type="password"
                      id="currentPassword"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#4154f1] focus:border-[#4154f1] text-black placeholder-black"
                      placeholder="Enter your current password"
                  />
                </div>
                <div className="mb-4">
                    <label htmlFor="newPassword" className="block text-sm font-medium text-black mb-2">New Password</label>
                  <input
                      type="password"
                      id="newPassword"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#4154f1] focus:border-[#4154f1] text-black placeholder-black"
                      placeholder="Enter your new password"
                  />
                </div>
                <div className="mb-4">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-black mb-2">Confirm New Password</label>
                  <input
                      type="password"
                      id="confirmPassword"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#4154f1] focus:border-[#4154f1] text-black placeholder-black"
                      placeholder="Confirm your new password"
                  />
                </div>
                  {passwordError && <div className="mb-2 text-red-600 text-sm">{passwordError}</div>}
                  <div className="flex gap-2">
              <button
                type="button"
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                      onClick={() => setShowChangePassword(false)}
                      disabled={passwordLoading}
              >
                Cancel
              </button>
              <button
                      type="submit"
                      className="px-4 py-2 bg-[#4154f1] text-white rounded-lg hover:bg-[#3141e1] font-medium transition-colors"
                      disabled={passwordLoading}
              >
                      {passwordLoading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
                </form>
              )}
              {passwordMessage && (
                <div className="mt-4 text-green-600 font-medium">{passwordMessage}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#2c3e50] text-white py-4 text-center">
        <div className="container mx-auto">
          <p className="mb-0">© 2025 College Attendance System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}