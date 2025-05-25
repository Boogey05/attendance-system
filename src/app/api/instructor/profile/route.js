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

    const instructor = await prisma.instructor.findUnique({
      where: { userId },
      select: {
        id: true,
        userId: true,
        name: true,
        department: true,
        facultyRole: true,
        email: true,
        phone: true,
        address: true,
        profilePicture: true,
        qualification: true,
        specialization: true,
        officeNumber: true,
        modules: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!instructor) {
      return NextResponse.json({ error: 'Instructor not found' }, { status: 404 });
    }

    // Get module details for the instructor's modules
    const moduleDetails = await prisma.module.findMany({
      where: {
        code: {
          in: instructor.modules,
        },
      },
      select: {
        code: true,
        name: true,
        department: true,
        totalClasses: true,
        requirement: true,
      },
    });

    return NextResponse.json({
      profile: {
        ...instructor,
        email: instructor.email || `${instructor.userId.toLowerCase()}@example.com`,
        phone: instructor.phone || 'Not Provided',
        address: instructor.address || 'Not Provided',
        profilePicture: instructor.profilePicture || '/default-faculty.png',
        qualification: instructor.qualification || 'Not Provided',
        specialization: instructor.specialization || 'Not Provided',
        officeNumber: instructor.officeNumber || 'Not Provided',
        modules: moduleDetails,
      },
    });
  } catch (error) {
    console.error('Error fetching instructor profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile data' }, { status: 500 });
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
      qualification,
      specialization,
      officeNumber,
    } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Update instructor profile
    const updatedInstructor = await prisma.instructor.update({
      where: { userId },
      data: {
        name: name || undefined,
        email: email || undefined,
        phone: phone || undefined,
        address: address || undefined,
        profilePicture: profilePicture || undefined,
        qualification: qualification || undefined,
        specialization: specialization || undefined,
        officeNumber: officeNumber || undefined,
      },
      select: {
        id: true,
        userId: true,
        name: true,
        department: true,
        facultyRole: true,
        email: true,
        phone: true,
        address: true,
        profilePicture: true,
        qualification: true,
        specialization: true,
        officeNumber: true,
        modules: true,
        updatedAt: true,
      },
    });

    // Get updated module details
    const moduleDetails = await prisma.module.findMany({
      where: {
        code: {
          in: updatedInstructor.modules,
        },
      },
      select: {
        code: true,
        name: true,
        department: true,
        totalClasses: true,
        requirement: true,
      },
    });

    return NextResponse.json({
      success: true,
      profile: {
        ...updatedInstructor,
        email: updatedInstructor.email || `${updatedInstructor.userId.toLowerCase()}@example.com`,
        phone: updatedInstructor.phone || 'Not Provided',
        address: updatedInstructor.address || 'Not Provided',
        profilePicture: updatedInstructor.profilePicture || '/default-faculty.png',
        qualification: updatedInstructor.qualification || 'Not Provided',
        specialization: updatedInstructor.specialization || 'Not Provided',
        officeNumber: updatedInstructor.officeNumber || 'Not Provided',
        modules: moduleDetails,
      },
    });
  } catch (error) {
    console.error('Error updating instructor profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 