const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // CHANGE THESE VALUES to the student userId and module code you want to check
  const studentUserId = '2230132';
  const moduleCode = 'CTE204';

  // Find the student and module
  const student = await prisma.user.findUnique({ where: { userId: studentUserId } });
  const module = await prisma.module.findUnique({ where: { code: moduleCode } });

  if (!student || !module) {
    console.log('Student or module not found!');
    return;
  }

  // Find all attendance records for this student and module
  const records = await prisma.attendance.findMany({
    where: {
      studentId: student.id,
      moduleId: module.id
    },
    orderBy: { date: 'desc' }
  });

  console.log(`Attendance records for student ${studentUserId} in module ${moduleCode}:`);
  records.forEach(r => {
    console.log({
      date: r.date,
      present: r.present,
      absent: r.absent,
      time: r.time,
      markedBy: r.markedBy
    });
  });
}

main().finally(() => prisma.$disconnect()); 