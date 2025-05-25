const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function generateRandomAttendance() {
  try {
    // Get all modules
    const modules = await prisma.module.findMany();
    console.log('Found modules:', modules.length);
    
    // Get all students
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' }
    });
    console.log('Found students:', students.length);
    
    // Get all instructors
    const instructors = await prisma.instructor.findMany();
    console.log('Found instructors:', instructors.length);

    // Generate attendance for each module
    for (const module of modules) {
      console.log(`Processing module: ${module.code}`);
      
      // Find an instructor for this module
      const moduleInstructor = instructors.find(instructor => 
        instructor.modules && instructor.modules.includes(module.code)
      ) || instructors[0];

      // Generate 10 hours of attendance
      for (let hour = 0; hour < 10; hour++) {
        // For each student in the module's department and year
        const eligibleStudents = students.filter(student => 
          student.department === module.department && 
          student.year === module.year
        );

        console.log(`Found ${eligibleStudents.length} eligible students for ${module.code}`);

        for (const student of eligibleStudents) {
          // Randomly determine if student is present (80% chance)
          const isPresent = Math.random() < 0.8;
          
          // Create attendance record
          await prisma.attendance.create({
            data: {
              studentId: student.id,
              moduleId: module.id,
              instructorId: moduleInstructor.id,
              date: new Date(), // Today's date
              time: `${8 + hour}:00`, // Starting from 8 AM
              present: isPresent ? 1 : 0,
              absent: isPresent ? 0 : 1,
              markedBy: moduleInstructor.userId // required field
            }
          });
        }
      }
    }

    console.log('Successfully generated random attendance data');
  } catch (error) {
    console.error('Error generating attendance data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
generateRandomAttendance(); 