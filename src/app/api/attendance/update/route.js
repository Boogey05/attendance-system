import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { studentId, moduleCode, date, hours, present, startHour, instructorId } = await request.json();

    // Validate required fields
    if (!studentId || !moduleCode || !date || !hours || !instructorId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate hours
    const parsedHours = parseInt(hours);
    if (isNaN(parsedHours) || parsedHours <= 0 || parsedHours > 8) {
      return NextResponse.json({ error: 'Invalid hours value. Must be between 1 and 8' }, { status: 400 });
    }

    // Validate date
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    // Validate start hour
    if (startHour < 0 || startHour > 23) {
      return NextResponse.json({ error: 'Invalid start hour. Must be between 0 and 23' }, { status: 400 });
    }

    // Get student and module
    const student = await prisma.user.findUnique({
      where: { userId: studentId }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const foundModule = await prisma.module.findUnique({
      where: { code: moduleCode }
    });

    if (!foundModule) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    // Get instructor
    const instructor = await prisma.instructor.findUnique({
      where: { userId: instructorId }
    });

    if (!instructor) {
      return NextResponse.json({ error: 'Instructor not found' }, { status: 404 });
    }

    // Validate that instructor is assigned to this module
    if (!instructor.modules.includes(moduleCode)) {
      return NextResponse.json({ error: 'Instructor is not assigned to this module' }, { status: 403 });
    }

    // Check for duplicate attendance record
    const existingRecord = await prisma.attendance.findFirst({
      where: {
        studentId: student.id,
        moduleId: foundModule.id,
        date: parsedDate,
        time: {
          startsWith: `${startHour.toString().padStart(2, '0')}:00`
        }
      }
    });

    if (existingRecord) {
      return NextResponse.json({ error: 'Attendance record already exists for this time slot' }, { status: 409 });
    }

    // Create attendance record
    const recordData = {
      studentId: student.id,
      instructorId: instructor.id,
      moduleId: foundModule.id,
      date: parsedDate,
      present: present ? parsedHours : 0,
      absent: present ? 0 : parsedHours,
      time: `${startHour.toString().padStart(2, '0')}:00 - ${(startHour + parsedHours).toString().padStart(2, '0')}:00`,
      markedBy: instructor.userId
    };

    await prisma.attendance.create({ data: recordData });

    return NextResponse.json({ message: 'Attendance recorded successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error recording attendance:', error);
    return NextResponse.json({ 
      error: 'Failed to record attendance',
      details: error.message 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}