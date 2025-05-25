import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
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

    // Delete the module
    await prisma.module.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting module:', error);
    return NextResponse.json({ error: 'Failed to delete module' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 