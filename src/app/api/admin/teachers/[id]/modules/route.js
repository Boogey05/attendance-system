import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { modules } = await request.json();
    if (!id || !modules) {
      return NextResponse.json({ error: 'Missing id or modules' }, { status: 400 });
    }
    await prisma.instructor.update({
      where: { id },
      data: { modules },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 