import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { userId, password, role } = await request.json();

    console.log('Login Attempt - userId:', userId, 'role:', role, 'password:', password);

    if (!userId || !password || !role) {
      console.log('Missing required fields:', { userId, password, role });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let user, userRole, tableName;
    if (role.toLowerCase() === 'faculty') {
      // First check if the user is an admin
      const admin = await prisma.admin.findUnique({ where: { userId } });
      if (admin) {
        if (admin.password !== password) {
          console.log('Admin password mismatch for userId:', userId);
          return NextResponse.json({ error: 'Wrong credentials' }, { status: 401 });
        }
        const { password: _, ...adminData } = admin;
        return NextResponse.json({
          success: true,
          redirect: '/admin_dashboard',
          user: { ...adminData, role: 'admin' }
        });
      }
      // If not an admin, proceed to check instructor
      tableName = 'instructor';
      user = await prisma.instructor.findUnique({ where: { userId } });
      userRole = 'instructor';
    } else if (role.toLowerCase() === 'student') {
      tableName = 'user';
      user = await prisma.user.findUnique({ where: { userId } });
      userRole = 'student';
    } else {
      console.log('Invalid role:', role);
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    if (!user) {
      console.log(`${tableName} not found for userId:`, userId);
      return NextResponse.json({ error: 'Wrong credentials' }, { status: 401 });
    }

    console.log(`${tableName} found:`, user);

    if (user.password !== password) {
      console.log('Password mismatch for userId:', userId, 'stored:', user.password, 'provided:', password);
      return NextResponse.json({ error: 'Wrong credentials' }, { status: 401 });
    }

    const { password: _, ...userData } = user;
    const response = {
      success: true,
      redirect: role.toLowerCase() === 'faculty' ? '/instructor_dashboard' : '/student_dashboard',
      user: { ...userData, role: userRole, year: user.year || '', modules: user.modules || [], facultyRole: user.facultyRole || '' },
    };
    console.log('Sending Response:', response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Login Error - Details:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}