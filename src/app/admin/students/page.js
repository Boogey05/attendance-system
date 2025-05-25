'use client';

import { useEffect, useState } from 'react';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [form, setForm] = useState({
    userId: '',
    name: '',
    department: '',
    year: '',
    email: '',
    phone: '',
    address: '',
    emergencyContact: '',
    semester: '',
    program: '',
    password: '',
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    setLoading(true);
    const res = await fetch('/api/admin/students');
    const data = await res.json();
    setStudents(data);
    setLoading(false);
  }

  function openAddModal() {
    setEditStudent(null);
    setForm({
      userId: '',
      name: '',
      department: '',
      year: '',
      email: '',
      phone: '',
      address: '',
      emergencyContact: '',
      semester: '',
      program: '',
      password: '',
    });
    setShowModal(true);
  }

  function openEditModal(student) {
    setEditStudent(student);
    setForm({ ...student, password: '' });
    setShowModal(true);
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this student?')) return;
    await fetch(`/api/admin/students/${id}`, { method: 'DELETE' });
    fetchStudents();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (editStudent) {
      await fetch(`/api/admin/students/${editStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } else {
      await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    }
    setShowModal(false);
    fetchStudents();
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Students</h1>
        <button onClick={openAddModal} className="bg-indigo-600 text-white px-4 py-2 rounded">Add Student</button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="border px-4 py-2">User ID</th>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Department</th>
              <th className="border px-4 py-2">Year</th>
              <th className="border px-4 py-2">Email</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td className="border px-4 py-2">{student.userId}</td>
                <td className="border px-4 py-2">{student.name}</td>
                <td className="border px-4 py-2">{student.department}</td>
                <td className="border px-4 py-2">{student.year}</td>
                <td className="border px-4 py-2">{student.email}</td>
                <td className="border px-4 py-2">
                  <button onClick={() => openEditModal(student)} className="bg-yellow-400 text-white px-2 py-1 rounded mr-2">Edit</button>
                  <button onClick={() => handleDelete(student.id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">{editStudent ? 'Edit Student' : 'Add Student'}</h2>
            <div className="grid grid-cols-2 gap-4">
              <input className="border p-2" placeholder="User ID" value={form.userId} onChange={e => setForm(f => ({ ...f, userId: e.target.value }))} required />
              <input className="border p-2" placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              <input className="border p-2" placeholder="Department" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} required />
              <input className="border p-2" placeholder="Year" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} />
              <input className="border p-2" placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              <input className="border p-2" placeholder="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              <input className="border p-2" placeholder="Address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
              <input className="border p-2" placeholder="Emergency Contact" value={form.emergencyContact} onChange={e => setForm(f => ({ ...f, emergencyContact: e.target.value }))} />
              <input className="border p-2" placeholder="Semester" value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))} />
              <input className="border p-2" placeholder="Program" value={form.program} onChange={e => setForm(f => ({ ...f, program: e.target.value }))} />
              <input className="border p-2" placeholder="Password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required={!editStudent} />
            </div>
            <div className="flex justify-end mt-4">
              <button type="button" onClick={() => setShowModal(false)} className="mr-2 px-4 py-2 bg-gray-300 rounded">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">{editStudent ? 'Update' : 'Add'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 