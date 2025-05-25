import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Find student with basic info first
    const student = await prisma.user.findUnique({
      where: { userId },
      select: {
        id: true,
        userId: true,
        name: true,
        department: true,
        year: true,
        semester: true,
        program: true
      }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Print all modules for the student's department for debugging
    const allDeptModules = await prisma.module.findMany({
      where: { department: student.department }
    });
    console.log('All modules for department:', allDeptModules);

    // Get modules for student's department, year, and semester
    console.log('Student year:', student.year, 'semester:', student.semester);
    const modules = await prisma.module.findMany({
      where: {
        department: student.department,
        year: student.year,
        semester: student.semester
      }
    });
    console.log('Modules found:', modules);

    // Get attendance records for all modules
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        studentId: student.id,
        moduleId: {
          in: modules.map(m => m.id)
        }
      },
      include: {
        module: true,
        instructor: {
          select: {
            name: true,
            userId: true
          }
        }
      }
    });

    // Calculate module attendance and statistics
    const enrolledModules = modules.map(module => {
      const moduleAttendance = attendanceRecords.filter(record => record.moduleId === module.id);
      const totalClasses = moduleAttendance.length;
      const presentClasses = moduleAttendance.filter(record => record.present > 0).length;
      const attendancePercentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;

      // Find the instructor for this module
      const moduleInstructor = attendanceRecords.find(record => 
        record.moduleId === module.id && record.instructor
      )?.instructor;

      return {
        id: module.id,
        name: module.name,
        code: module.code,
        department: module.department,
        teacher: moduleInstructor?.name || 'Not Assigned',
        schedule: 'Not Scheduled', // Default value since schedule is not in schema
        semester: module.semester,
        attendance: Math.round(attendancePercentage * 100) / 100,
        totalClasses,
        presentClasses
      };
    });

    // Calculate overall statistics
    const totalClasses = attendanceRecords.length;
    const presentClasses = attendanceRecords.filter(record => record.present > 0).length;
    const absentClasses = totalClasses - presentClasses;
    const averageAttendance = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;

    // Calculate module status counts
    const goodModules = enrolledModules.filter(m => m.attendance >= 90).length;
    const warningModules = enrolledModules.filter(m => m.attendance >= 80 && m.attendance < 90).length;
    const criticalModules = enrolledModules.filter(m => m.attendance < 80).length;

    return NextResponse.json({
      student: {
        ...student,
        averageAttendance: Math.round(averageAttendance * 100) / 100,
        goodModules,
        warningModules,
        criticalModules
      },
      enrolledModules,
      attendanceHistory: attendanceRecords.map(record => ({
        id: record.id,
        date: record.date,
        status: record.present > 0 ? 'present' : 'absent',
        moduleName: record.module.name,
        moduleCode: record.module.code,
        time: record.time
      }))
    });
  } catch (error) {
    console.error('Error fetching student dashboard:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch dashboard data',
      details: error.message 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}