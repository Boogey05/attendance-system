const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getRandomDateInPastMonth() {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  const date = new Date(now);
  date.setDate(now.getDate() - daysAgo);
  return date;
}

async function main() {
  // Get all students
  const students = await prisma.user.findMany();

  for (const student of students) {
    // Get modules for the student's department and year
    const modules = await prisma.module.findMany({
      where: { department: student.department },
    });
    // Get instructors for the department
    const instructors = await prisma.instructor.findMany({
      where: { department: student.department },
    });
    for (const module of modules) {
      // Only assign if module code matches year (3rd char)
      if (
        (student.year === '1st' && module.code.charAt(2) === '1') ||
        (student.year === '2nd' && module.code.charAt(2) === '2') ||
        (student.year === '3rd' && module.code.charAt(2) === '3') ||
        (student.year === '4th' && module.code.charAt(2) === '4')
      ) {
        // Up to 10 random attendance records
        const numRecords = Math.floor(Math.random() * 10) + 1;
        for (let i = 0; i < numRecords; i++) {
          const present = Math.random() > 0.2; // 80% chance present
          const hours = Math.floor(Math.random() * 2) + 1; // 1 or 2 hours
          const instructor = instructors[Math.floor(Math.random() * instructors.length)];
          const date = await getRandomDateInPastMonth();
          const startHour = 8 + Math.floor(Math.random() * 8); // 8am-3pm
          const time = `${startHour.toString().padStart(2, '0')}:00 - ${(startHour + hours).toString().padStart(2, '0')}:00`;
          await prisma.attendance.create({
            data: {
              studentId: student.id,
              instructorId: instructor.id,
              moduleId: module.id,
              date,
              present: present ? hours : 0,
              absent: present ? 0 : hours,
              time,
              venue: 'Classroom',
            },
          });
        }
      }
    }
  }
  console.log('Random attendance populated!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 