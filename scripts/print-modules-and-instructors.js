const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Print all modules for IT 2nd year, 2nd semester
  const modules = await prisma.module.findMany({
    where: {
      department: 'Information Technology',
      year: '2nd',
      semester: '2'
    }
  });
  console.log('IT 2nd Year, 2nd Semester Modules:', modules.map(m => `${m.code} (${m.name})`));

  // Print all instructors and their assigned modules
  const instructors = await prisma.instructor.findMany();
  instructors.forEach(i => {
    console.log(`${i.userId} - ${i.name}:`, i.modules);
  });
}

main().finally(() => prisma.$disconnect()); 