import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
  const { id } = params;
  const data = await request.json();
  const student = await prisma.user.update({
    where: { id },
    data,
  });
  return NextResponse.json(student);
}

export async function DELETE(request, { params }) {
  const { id } = params;
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 