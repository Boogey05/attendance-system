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

    // Find student with all necessary fields
    const student = await prisma.user.findUnique({
      where: { userId },
      select: {
        id: true,
        userId: true,
        name: true,
        department: true,
        year: true,
        email: true,
        phone: true,
        address: true,
        emergencyContact: true,
        semester: true,
        program: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Determine default profile picture based on name
    const isMale = student.name.split(' ')[1]?.toLowerCase().endsWith('i') || 
                  student.name.split(' ')[1]?.toLowerCase().endsWith('o');
    const defaultProfilePicture = isMale ? '/default-male.png' : '/default-female.png';

    // Return formatted profile data with defaults
    return NextResponse.json({
      profile: {
        ...student,
        email: student.email || `${student.userId.toLowerCase()}@example.com`,
        phone: student.phone || `+975 ${student.userId.slice(-8)}`,
        address: student.address || 'Not Provided',
        profilePicture: defaultProfilePicture,
        emergencyContact: student.emergencyContact || 'Not Provided',
        semester: student.semester || 'Not Specified',
        program: student.program || student.department,
        year: student.year || 'Not Specified'
      },
    });
  } catch (error) {
    console.error('Error fetching student profile:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch profile data',
      details: error.message 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request) {
  try {
    const {
      userId,
      name,
      email,
      phone,
      address,
      profilePicture,
      emergencyContact,
      semester,
      program
    } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Update student profile
    const updatedStudent = await prisma.user.update({
      where: { userId },
      data: {
        name: name || undefined,
        email: email || undefined,
        phone: phone || undefined,
        address: address || undefined,
        profilePicture: profilePicture || undefined,
        emergencyContact: emergencyContact || undefined,
        semester: semester || undefined,
        program: program || undefined,
      },
      select: {
        id: true,
        userId: true,
        name: true,
        department: true,
        year: true,
        email: true,
        phone: true,
        address: true,
        profilePicture: true,
        emergencyContact: true,
        semester: true,
        program: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      profile: {
        ...updatedStudent,
        email: updatedStudent.email || `${updatedStudent.userId.toLowerCase()}@example.com`,
        phone: updatedStudent.phone || `+975 ${updatedStudent.userId.slice(-8)}`,
        address: updatedStudent.address || 'Not Provided',
        profilePicture: updatedStudent.profilePicture || '/default-male.png',
        emergencyContact: updatedStudent.emergencyContact || 'Not Provided',
        semester: updatedStudent.semester || 'Not Specified',
        program: updatedStudent.program || updatedStudent.department,
      },
    });
  } catch (error) {
    console.error('Error updating student profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 