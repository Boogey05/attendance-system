const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Assignment plan
  const assignments = [
    { userId: 'F001', modules: ['CTE207', 'CTE205', 'CTE204'] },
    { userId: 'F002', modules: ['CTE206', 'NWC202'] },
    { userId: 'F003', modules: ['MAT206'] },
  ];

  for (const { userId, modules } of assignments) {
    // Update instructor's modules
    await prisma.instructor.update({
      where: { userId },
      data: { modules }
    });
    // Get instructor's id
    const instructor = await prisma.instructor.findUnique({ where: { userId } });
    // Update attendance records for these modules
    for (const code of modules) {
      const module = await prisma.module.findUnique({ where: { code } });
      if (module) {
        await prisma.attendance.updateMany({
          where: { moduleId: module.id },
          data: { instructorId: instructor.id }
        });
      }
    }
  }

  console.log('Synced instructor modules and attendance records for IT 2nd year instructors!');
}

main().finally(() => prisma.$disconnect()); 