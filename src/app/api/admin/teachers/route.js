import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const teachers = await prisma.instructor.findMany({
      select: {
        id: true,
        userId: true,
        name: true,
        department: true,
        facultyRole: true,
        email: true,
        phone: true,
        address: true,
        qualification: true,
        specialization: true,
        officeNumber: true,
        modules: true,
      },
    });
    
    return NextResponse.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json({ error: 'Failed to fetch teachers' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const teacher = await prisma.instructor.create({
      data: {
        userId: data.userId,
        name: data.name,
        department: data.department,
        facultyRole: data.facultyRole,
        email: data.email,
        phone: data.phone,
        address: data.address,
        qualification: data.qualification,
        specialization: data.specialization,
        officeNumber: data.officeNumber,
        modules: data.modules || [],
      },
    });
    return NextResponse.json(teacher);
  } catch (error) {
    console.error('Error creating teacher:', error);
    return NextResponse.json({ error: 'Failed to create teacher' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 