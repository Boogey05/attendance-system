import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    // Get all students
    const students = await prisma.user.findMany({
      where: {
        role: 'STUDENT'
      }
    });

    // Update each student with more complete information
    const updatePromises = students.map(async (student) => {
      const updates = {
        email: student.email || `${student.userId.toLowerCase()}@example.com`,
        phone: student.phone || `+975 ${student.userId.slice(-8)}`,
        address: student.address || 'Not Provided',
        profilePicture: student.profilePicture || (student.name.split(' ')[1]?.toLowerCase().endsWith('i') || student.name.split(' ')[1]?.toLowerCase().endsWith('o') ? '/default-male.png' : '/default-female.png'),
        emergencyContact: student.emergencyContact || 'Not Provided',
        semester: student.semester || 'Not Specified',
        program: student.program || student.department,
        year: student.year || 'Not Specified'
      };

      return prisma.user.update({
        where: { id: student.id },
        data: updates
      });
    });

    const updatedStudents = await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: `Updated ${updatedStudents.length} student records`,
      students: updatedStudents.map(student => ({
        userId: student.userId,
        name: student.name,
        department: student.department,
        email: student.email,
        phone: student.phone,
        program: student.program,
        year: student.year,
        semester: student.semester
      }))
    });
  } catch (error) {
    console.error('Error updating student records:', error);
    return NextResponse.json({ 
      error: 'Failed to update student records',
      details: error.message 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 