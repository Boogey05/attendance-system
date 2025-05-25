import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { userId, currentPassword, newPassword } = await request.json();

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Try to find user in User table
    let user = await prisma.user.findUnique({ where: { userId } });
    let userType = 'user';

    // If not found, try Instructor table
    if (!user) {
      user = await prisma.instructor.findUnique({ where: { userId } });
      userType = 'instructor';
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check current password
    if (user.password !== currentPassword) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    // Update password in the correct table
    if (userType === 'user') {
      await prisma.user.update({
        where: { userId },
        data: { password: newPassword },
      });
    } else {
      await prisma.instructor.update({
        where: { userId },
        data: { password: newPassword },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 