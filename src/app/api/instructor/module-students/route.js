import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const moduleCode = searchParams.get('moduleCode');
    const year = searchParams.get('year');

    if (!moduleCode || !year) {
      return NextResponse.json({ error: 'Module code and year are required' }, { status: 400 });
    }

    // Get the module
    const foundModule = await prisma.module.findUnique({
      where: { code: moduleCode },
    });

    if (!foundModule) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    // Check if the module is assigned to the selected year for the department
    if (foundModule.year !== year) {
      // Not a module for this year, return empty list
      return NextResponse.json({ students: [] }, { status: 200 });
    }

    // Get all students in the department and year
    const students = await prisma.user.findMany({
      where: { department: foundModule.department, year },
      select: {
        id: true,
        userId: true,
        name: true,
        department: true,
      },
    });

    // Get attendance records for these students in this module
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        moduleId: foundModule.id,
        studentId: { in: students.map(s => s.id) }
      },
      select: {
        studentId: true,
        present: true,
        absent: true,
      },
    });

    // Calculate attendance for each student
    const studentAttendance = {};
    attendanceRecords.forEach(record => {
      if (!studentAttendance[record.studentId]) {
        studentAttendance[record.studentId] = { present: 0, absent: 0 };
      }
      studentAttendance[record.studentId].present += record.present || 0;
      studentAttendance[record.studentId].absent += record.absent || 0;
    });

    // Calculate attendance percentage and status for each student
    const studentsWithAttendance = students.map(student => {
      const attendance = studentAttendance[student.id] || { present: 0, absent: 0 };
      const totalClasses = attendance.present + attendance.absent;
      const attendancePercentage = totalClasses > 0 ? (attendance.present / totalClasses) * 100 : 0;
      
      let status = 'pending';
      if (totalClasses > 0) {
        if (attendancePercentage >= 90) status = 'good';
        else if (attendancePercentage >= 80) status = 'warning';
        else status = 'critical';
      }

      return {
        id: student.id,
        userId: student.userId,
        name: student.name,
        department: student.department,
        attendance: parseFloat(attendancePercentage.toFixed(1)),
        status,
      };
    });

    return NextResponse.json({ students: studentsWithAttendance }, { status: 200 });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch students',
      details: error.message 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 