const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Update all students with semester '1st' to '1'
  await prisma.user.updateMany({
    where: { semester: '1st' },
    data: { semester: '1' }
  });
  // Update all students with semester '2nd' to '2'
  await prisma.user.updateMany({
    where: { semester: '2nd' },
    data: { semester: '2' }
  });
  // Update all students with semester '3rd' to '3'
  await prisma.user.updateMany({
    where: { semester: '3rd' },
    data: { semester: '3' }
  });
  // Update all students with semester '4th' to '4'
  await prisma.user.updateMany({
    where: { semester: '4th' },
    data: { semester: '4' }
  });
  console.log('Updated student semesters!');
}

main().finally(() => prisma.$disconnect()); 