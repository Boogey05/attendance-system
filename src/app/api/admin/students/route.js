import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function GET() {
  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    orderBy: { userId: 'asc' },
  });
  return NextResponse.json(students);
}

export async function POST(request) {
  const data = await request.json();
  const student = await prisma.user.create({
    data: {
      ...data,
      role: 'STUDENT',
    },
  });
  return NextResponse.json(student);
} 