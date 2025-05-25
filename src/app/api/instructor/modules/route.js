import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const semester = searchParams.get('semester');
    const instructorId = searchParams.get('instructorId');

    if (!year || !semester) {
      return NextResponse.json({ error: 'Year and semester are required' }, { status: 400 });
    }

    // Get the instructor's modules
    const instructor = await prisma.instructor.findUnique({
      where: { userId: instructorId },
      select: { modules: true, department: true }
    });

    if (!instructor) {
      return NextResponse.json({ error: 'Instructor not found' }, { status: 404 });
    }

    // Get all modules for the department and year
    const modules = await prisma.module.findMany({
      where: {
        department: instructor.department,
        code: {
          in: instructor.modules
        }
      },
      select: {
        id: true,
        code: true,
        name: true,
        department: true
      }
    });

    // Filter modules based on year (using module code pattern)
    const yearFilteredModules = modules.filter(module => {
      const moduleYear = module.code.charAt(2); // Assuming module code format like IT101, SE201, etc.
      return (year === '1st' && moduleYear === '1') ||
             (year === '2nd' && moduleYear === '2') ||
             (year === '3rd' && moduleYear === '3') ||
             (year === '4th' && moduleYear === '4');
    });

    return NextResponse.json({ modules: yearFilteredModules }, { status: 200 });
  } catch (error) {
    console.error('Error fetching modules:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch modules',
      details: error.message 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 