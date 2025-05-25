import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    console.log('Fetching instructor dashboard for userId:', userId);

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // First, let's check if the instructor exists
    const instructor = await prisma.instructor.findUnique({
      where: { userId },
    });

    if (!instructor) {
      console.log('Instructor not found for userId:', userId);
      return NextResponse.json({ error: 'Instructor not found' }, { status: 404 });
    }

    console.log('Found instructor:', instructor);

    // Get modules separately since they might be stored as a JSON array
    let moduleCodes = [];
    try {
      if (typeof instructor.modules === 'string') {
        moduleCodes = JSON.parse(instructor.modules);
      } else if (Array.isArray(instructor.modules)) {
        moduleCodes = instructor.modules;
      }
    } catch (err) {
      console.error('Error parsing modules:', err);
      moduleCodes = [];
    }

    console.log('Module codes:', moduleCodes);

    if (moduleCodes.length === 0) {
      console.log('No modules found for instructor');
      // Return empty dashboard data instead of error
      return NextResponse.json({
        instructor: {
          name: instructor.name,
          department: instructor.department,
          totalStudents: 0,
          goodAttendance: 0,
          warningAttendance: 0,
          criticalAttendance: 0,
          modules: [],
        },
        studentsAtRisk: [],
      }, { status: 200 });
    }

    // Get module IDs for the instructor's modules
    const moduleEntities = await prisma.module.findMany({
      where: { code: { in: moduleCodes } },
      select: { id: true, code: true, name: true },
    });
    const moduleIdToCode = Object.fromEntries(moduleEntities.map(m => [m.id, m.code]));
    const moduleIdToName = Object.fromEntries(moduleEntities.map(m => [m.id, m.name]));
    const moduleIds = moduleEntities.map(m => m.id);

    // Get attendance records for the modules
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        moduleId: { in: moduleIds },
      },
      select: {
        studentId: true,
        present: true,
        absent: true,
        moduleId: true,
      },
    });

    console.log('Found attendance records:', attendanceRecords);

    // Group attendance by student and module
    const studentAttendance = {};
    for (const record of attendanceRecords) {
      const key = `${record.studentId}-${record.moduleId}`;
      if (!studentAttendance[key]) {
        studentAttendance[key] = {
          present: 0,
          absent: 0,
          moduleId: record.moduleId,
          studentId: record.studentId,
        };
      }
      studentAttendance[key].present += record.present || 0;
      studentAttendance[key].absent += record.absent || 0;
    }

    // Get unique student IDs
    const studentIds = Array.from(new Set(attendanceRecords.map(r => r.studentId)));
    const students = await prisma.user.findMany({
      where: {
        id: { in: studentIds },
      },
      select: {
        id: true,
        userId: true,
        name: true,
        department: true,
      },
    });
    const studentIdToInfo = Object.fromEntries(students.map(s => [s.id, s]));

    // Create student risk data
    const studentRiskData = Object.values(studentAttendance).map(att => {
      const totalClassesSoFar = att.present + att.absent;
      const attendancePercentage = totalClassesSoFar > 0 
        ? (att.present / totalClassesSoFar) * 100 
        : 0;
      const status = attendancePercentage >= 90 
        ? 'good' 
        : attendancePercentage >= 80 
          ? 'warning' 
          : 'critical';
      const student = studentIdToInfo[att.studentId];
      return {
        id: student?.userId || att.studentId,
        name: student?.name || 'Unknown',
        attendance: parseFloat(attendancePercentage.toFixed(1)),
        present: att.present,
        total: totalClassesSoFar,
        module: moduleIdToName[att.moduleId] ? `${moduleIdToName[att.moduleId]} (${moduleIdToCode[att.moduleId]})` : moduleIdToCode[att.moduleId] || 'Unknown Module',
        status,
      };
    });

    // Calculate statistics
    const totalStudents = studentRiskData.length;
    const goodAttendance = studentRiskData.filter(s => s.status === 'good').length;
    const warningAttendance = studentRiskData.filter(s => s.status === 'warning').length;
    const criticalAttendance = studentRiskData.filter(s => s.status === 'critical').length;

    const response = {
      instructor: {
        name: instructor.name,
        department: instructor.department,
        totalStudents,
        goodAttendance,
        warningAttendance,
        criticalAttendance,
        modules: moduleCodes,
      },
      studentsAtRisk: studentRiskData,
    };

    console.log('Sending response:', response);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching instructor dashboard:', error);
    // Log the full error stack
    console.error('Error stack:', error.stack);
    return NextResponse.json({ 
      error: 'Failed to fetch instructor dashboard',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}