import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const year = searchParams.get('year');
    const moduleCode = searchParams.get('moduleCode');

    // Build the where clause for attendance records
    const whereClause = {};
    if (moduleCode) {
      const foundModule = await prisma.module.findUnique({
        where: { code: moduleCode },
        select: { id: true }
      });
      if (foundModule) {
        whereClause.moduleId = foundModule.id;
      }
    }

    // Get all attendance records with related data
    const attendanceRecords = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            userId: true,
            name: true,
            department: true,
            year: true
          }
        },
        module: {
          select: {
            code: true,
            name: true,
            totalClasses: true
          }
        },
        instructor: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    // Filter records based on department and year if specified
    let filteredRecords = attendanceRecords;
    if (department) {
      filteredRecords = filteredRecords.filter(record => record.student.department === department);
    }
    if (year) {
      filteredRecords = filteredRecords.filter(record => record.student.year === year);
    }

    // Aggregate attendance per student per module
    const summaryMap = {};
    for (const record of filteredRecords) {
      const key = `${record.student.userId}_${record.module.code}`;
      if (!summaryMap[key]) {
        summaryMap[key] = {
          studentId: record.student.userId,
          studentName: record.student.name,
          department: record.student.department,
          year: record.student.year,
          moduleCode: record.module.code,
          moduleName: record.module.name,
          instructor: record.instructor?.name || '',
          totalClasses: record.module.totalClasses || 0,
          present: 0,
          absent: 0
        };
      }
      summaryMap[key].present += record.present || 0;
      summaryMap[key].absent += record.absent || 0;
    }

    // Prepare summary list with percentage
    const summaryList = Object.values(summaryMap).map(item => {
      const totalMarked = item.present + item.absent;
      const percent = totalMarked > 0 ? ((item.present / totalMarked) * 100).toFixed(1) : '0.0';
      return {
        ...item,
        percent
      };
    });

    return NextResponse.json({
      summary: summaryList
    });
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance data' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 