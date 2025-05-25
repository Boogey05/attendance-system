import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('Fetching modules...'); // Debug log

    // First check if we can connect to the database
    await prisma.$connect();
    console.log('Database connected successfully'); // Debug log

    const modules = await prisma.module.findMany({
      orderBy: [
        { department: 'asc' },
        { year: 'asc' },
        { semester: 'asc' },
        { code: 'asc' }
      ],
      select: {
        id: true,
        code: true,
        name: true,
        department: true,
        year: true,
        semester: true,
        credits: true,
        description: true,
        totalClasses: true,
        requirement: true
      }
    });

    console.log('Modules fetched:', modules.length); // Debug log

    if (!modules || modules.length === 0) {
      console.log('No modules found'); // Debug log
      return NextResponse.json([]);
    }

    return NextResponse.json(modules);
  } catch (error) {
    console.error('Detailed error in GET /api/admin/modules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch modules', details: error.message },
      { status: 500 }
    );
  } finally {
    try {
      await prisma.$disconnect();
      console.log('Database disconnected successfully'); // Debug log
    } catch (error) {
      console.error('Error disconnecting from database:', error);
    }
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.code || !data.name || !data.department || !data.year || !data.semester || !data.credits) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if module code already exists
    const existingModule = await prisma.module.findFirst({
      where: { code: data.code }
    });

    if (existingModule) {
      return NextResponse.json({ error: 'Module code already exists' }, { status: 400 });
    }

    const foundModule = await prisma.module.create({
      data: {
        code: data.code,
        name: data.name,
        department: data.department,
        year: data.year,
        semester: data.semester,
        credits: parseInt(data.credits),
        description: data.description || '',
        totalClasses: data.totalClasses || 40,
        requirement: data.requirement || 90
      },
    });
    return NextResponse.json(foundModule);
  } catch (error) {
    console.error('Error creating module:', error);
    return NextResponse.json({ error: 'Failed to create module' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.id || !data.code || !data.name || !data.department || !data.year || !data.semester || !data.credits) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if module code already exists for a different module
    const existingModule = await prisma.module.findFirst({
      where: {
        code: data.code,
        id: { not: data.id }
      }
    });

    if (existingModule) {
      return NextResponse.json({ error: 'Module code already exists' }, { status: 400 });
    }

    const foundModule = await prisma.module.update({
      where: { id: data.id },
      data: {
        code: data.code,
        name: data.name,
        department: data.department,
        year: data.year,
        semester: data.semester,
        credits: parseInt(data.credits),
        description: data.description || '',
        totalClasses: data.totalClasses || 40,
        requirement: data.requirement || 90
      },
    });
    return NextResponse.json(foundModule);
  } catch (error) {
    console.error('Error updating module:', error);
    return NextResponse.json({ error: 'Failed to update module' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Module ID is required' }, { status: 400 });
    }

    // Check if module exists
    const foundModule = await prisma.module.findUnique({
      where: { id }
    });

    if (!foundModule) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    await prisma.module.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting module:', error);
    return NextResponse.json({ error: 'Failed to delete module' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 