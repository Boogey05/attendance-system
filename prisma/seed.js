const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Create admin account
  await prisma.admin.upsert({
    where: { userId: 'admin' },
    update: {
      password: 'admin123',
      name: 'System Administrator',
      email: 'admin@college.edu',
      phone: '+975 17123456',
    },
    create: {
      userId: 'admin',
      password: 'admin123',
      name: 'System Administrator',
      email: 'admin@college.edu',
      phone: '+975 17123456',
    },
  });

  // Define department modules by year
  const departmentModules = {
    "Information Technology": {
      "1st": [
        {
          code: "IT101",
          name: "Introduction to Programming",
          year: "1st",
          semester: "1",
          credits: 3,
          totalClasses: 50,
          requirement: 90,
          department: "Information Technology"
        },
        {
          code: "IT102",
          name: "Web Development",
          year: "1st",
          semester: "2",
          credits: 3,
          totalClasses: 45,
          requirement: 85,
          department: "Information Technology"
        },
        { code: "IT103", name: "Digital Logic Design", totalClasses: 50, requirement: 90 },
        { code: "IT104", name: "Data Structures", totalClasses: 50, requirement: 90 },
        { code: "IT105", name: "Database Management", totalClasses: 50, requirement: 90 }
      ],
      "2nd": [
      { code: "CTE204", name: "Web Application Development", totalClasses: 50, requirement: 90 },
      { code: "NWC202", name: "Introduction to IoT", totalClasses: 50, requirement: 90 },
      { code: "CTE206", name: "Software Engineering", totalClasses: 50, requirement: 90 },
      { code: "CTE205", name: "Operating Systems", totalClasses: 50, requirement: 90 },
      { code: "MAT206", name: "Computational Mathematics", totalClasses: 50, requirement: 90 },
        { code: "CTE207", name: "Artificial Intelligence", totalClasses: 50, requirement: 90 }
    ],
      "3rd": [
        { code: "IT301", name: "Cloud Computing", totalClasses: 50, requirement: 90 },
        { code: "IT302", name: "Mobile App Development", totalClasses: 50, requirement: 90 },
        { code: "IT303", name: "Cybersecurity", totalClasses: 50, requirement: 90 },
        { code: "IT304", name: "Blockchain Technology", totalClasses: 50, requirement: 90 },
        { code: "IT305", name: "Data Science", totalClasses: 50, requirement: 90 }
      ],
      "4th": [
        { code: "IT401", name: "Machine Learning", totalClasses: 50, requirement: 90 },
        { code: "IT402", name: "Big Data Analytics", totalClasses: 50, requirement: 90 },
        { code: "IT403", name: "Digital Signal Processing", totalClasses: 50, requirement: 90 },
        { code: "IT404", name: "Embedded Systems", totalClasses: 50, requirement: 90 },
        { code: "IT405", name: "Wireless Networks", totalClasses: 50, requirement: 90 }
      ]
    },
    "Software Engineering": {
      "1st": [
        { code: "SE101", name: "Programming Fundamentals", totalClasses: 50, requirement: 90 },
        { code: "SE102", name: "Software Design", totalClasses: 50, requirement: 90 },
        { code: "SE103", name: "Computer Architecture", totalClasses: 50, requirement: 90 },
        { code: "SE104", name: "Object-Oriented Programming", totalClasses: 50, requirement: 90 },
        { code: "SE105", name: "Database Systems", totalClasses: 50, requirement: 90 }
      ],
      "2nd": [
        { code: "SE201", name: "Software Development Lifecycle", totalClasses: 50, requirement: 90 },
        { code: "SE202", name: "Software Testing", totalClasses: 50, requirement: 90 },
        { code: "SE203", name: "Software Architecture", totalClasses: 50, requirement: 90 },
        { code: "SE204", name: "Operating Systems", totalClasses: 50, requirement: 90 },
        { code: "SE205", name: "Computational Mathematics", totalClasses: 50, requirement: 90 },
        { code: "SE206", name: "Software Project Management", totalClasses: 50, requirement: 90 }
      ],
      "3rd": [
        { code: "SE301", name: "Software Architecture", totalClasses: 50, requirement: 90 },
        { code: "SE302", name: "DevOps Practices", totalClasses: 50, requirement: 90 },
        { code: "SE303", name: "Cloud Native Development", totalClasses: 50, requirement: 90 },
        { code: "SE304", name: "Software Testing", totalClasses: 50, requirement: 90 },
        { code: "SE305", name: "Agile Development", totalClasses: 50, requirement: 90 }
      ],
      "4th": [
        { code: "SE401", name: "Enterprise Software", totalClasses: 50, requirement: 90 },
        { code: "SE402", name: "Software Security", totalClasses: 50, requirement: 90 },
        { code: "SE403", name: "Distributed Systems", totalClasses: 50, requirement: 90 },
        { code: "SE404", name: "Software Project Management", totalClasses: 50, requirement: 90 },
        { code: "SE405", name: "Software Quality Assurance", totalClasses: 50, requirement: 90 }
      ]
    },
    "Civil Engineering": {
      "1st": [
        { code: "CE101", name: "Engineering Mechanics", totalClasses: 50, requirement: 90 },
        { code: "CE102", name: "Engineering Drawing", totalClasses: 50, requirement: 90 },
        { code: "CE103", name: "Building Materials", totalClasses: 50, requirement: 90 },
        { code: "CE104", name: "Surveying I", totalClasses: 50, requirement: 90 },
        { code: "CE105", name: "Engineering Mathematics", totalClasses: 50, requirement: 90 }
      ],
      "2nd": [
      { code: "TSM203", name: "Transportation Systems", totalClasses: 50, requirement: 90 },
      { code: "MAT207", name: "Engineering Mathematics", totalClasses: 50, requirement: 90 },
      { code: "STG202", name: "Structural Geology", totalClasses: 50, requirement: 90 },
      { code: "S202", name: "Surveying", totalClasses: 50, requirement: 90 },
      { code: "FM1202", name: "Fluid Mechanics", totalClasses: 50, requirement: 90 },
        { code: "SUR202", name: "Surveying II", totalClasses: 50, requirement: 90 }
      ],
      "3rd": [
        { code: "CE301", name: "Structural Analysis", totalClasses: 50, requirement: 90 },
        { code: "CE302", name: "Construction Management", totalClasses: 50, requirement: 90 },
        { code: "CE303", name: "Hydraulics", totalClasses: 50, requirement: 90 },
        { code: "CE304", name: "Environmental Engineering", totalClasses: 50, requirement: 90 },
        { code: "CE305", name: "Geotechnical Engineering", totalClasses: 50, requirement: 90 }
    ],
      "4th": [
        { code: "CE401", name: "Transportation Engineering", totalClasses: 50, requirement: 90 },
        { code: "CE402", name: "Structural Design", totalClasses: 50, requirement: 90 },
        { code: "CE403", name: "Water Resources", totalClasses: 50, requirement: 90 },
        { code: "CE404", name: "Construction Technology", totalClasses: 50, requirement: 90 },
        { code: "CE405", name: "Project Planning", totalClasses: 50, requirement: 90 }
      ]
    },
    "Electrical Engineering": {
      "1st": [
        { code: "EE101", name: "Basic Electronics", totalClasses: 50, requirement: 90 },
        { code: "EE102", name: "Circuit Theory", totalClasses: 50, requirement: 90 },
        { code: "EE103", name: "Digital Electronics", totalClasses: 50, requirement: 90 },
        { code: "EE104", name: "Electrical Machines", totalClasses: 50, requirement: 90 },
        { code: "EE105", name: "Engineering Mathematics", totalClasses: 50, requirement: 90 }
      ],
      "2nd": [
      { code: "EFT201", name: "Electrical Fundamentals", totalClasses: 50, requirement: 90 },
      { code: "MAT209", name: "Advanced Mathematics", totalClasses: 50, requirement: 90 },
      { code: "CKT202", name: "Circuit Theory", totalClasses: 50, requirement: 90 },
      { code: "SNP201", name: "Signal Processing", totalClasses: 50, requirement: 90 },
        { code: "ECD203", name: "Electronic Circuit Design", totalClasses: 50, requirement: 90 }
      ],
      "3rd": [
        { code: "EE301", name: "Power Electronics", totalClasses: 50, requirement: 90 },
        { code: "EE302", name: "Control Systems", totalClasses: 50, requirement: 90 },
        { code: "EE303", name: "Microprocessors", totalClasses: 50, requirement: 90 },
        { code: "EE304", name: "Renewable Energy", totalClasses: 50, requirement: 90 },
        { code: "EE305", name: "Instrumentation", totalClasses: 50, requirement: 90 }
      ],
      "4th": [
        { code: "EE401", name: "Power Systems", totalClasses: 50, requirement: 90 },
        { code: "EE402", name: "High Voltage Engineering", totalClasses: 50, requirement: 90 },
        { code: "EE403", name: "Electric Drives", totalClasses: 50, requirement: 90 },
        { code: "EE404", name: "Smart Grid Technology", totalClasses: 50, requirement: 90 },
        { code: "EE405", name: "Power System Protection", totalClasses: 50, requirement: 90 }
      ]
    }
  };

  // Delete all old data before seeding
  console.log('Deleting old data...');
  await prisma.attendance.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.instructor.deleteMany({});
  await prisma.module.deleteMany({});

  // Seed modules
  console.log('Seeding modules...');
  for (const [department, yearModules] of Object.entries(departmentModules)) {
    for (const [year, modules] of Object.entries(yearModules)) {
      // Patch modules to ensure all required fields, with year and semester set last
      const patchedModules = modules.map((module) => ({
        ...module,
        department,
        year,
        semester: '2',
        credits: module.credits || 3,
        totalClasses: module.totalClasses || 40,
        requirement: module.requirement || 90,
        description: module.description || '',
      }));
      // Debug log for 2nd year IT modules
      if (department === 'Information Technology' && year === '2nd') {
        console.log('Patching 2nd Year IT Modules:', patchedModules);
      }
      for (const module of patchedModules) {
        const result = await prisma.module.upsert({
        where: { code: module.code },
          update: { ...module },
          create: { ...module },
        });
        // Debug log for 2nd year IT modules
        if (department === 'Information Technology' && year === '2nd') {
          console.log('Upsert result for 2nd Year IT Module:', result);
        }
      }
    }
  }

  // Year and semester options
  const years = ["1st", "2nd", "3rd", "4th"];
  const semesters = ["1st", "2nd"];
  const yearIdBase = {
    "1st": 2240131,
    "2nd": 2230131,
    "3rd": 2220131,
    "4th": 2210131
  };

  // Bhutanese names for randomization
  const bhutaneseNames = [
    "Sonam Dorji", "Pema Choden", "Tshering Wangmo", "Jigme Tenzin", "Karma Lhamo",
    "Ugyen Dema", "Tashi Phuntsho", "Choki Wangchuk", "Sangay Zangmo", "Passang Dorji",
    "Nima Wangdi", "Choden Lham", "Phurba Tshering", "Lhendup Wangchuk", "Dechen Zangmo",
    "Kezang Dema", "Tandin Wangchuk", "Dawa Lhamo", "Kinley Choden", "Pelden Wangmo"
  ];

  // Custom names for first student in each department/year
  const customNames = {
    "Information Technology": ["Kinley Wangchuk", "Chimi Dema", "Dorji Tshering", "Karma Tenzin"],
    "Software Engineering": ["Tashi", "Nima", "Sonam", "Pema"],
    "Civil Engineering": ["Tshering", "Wangmo", "Lhamo", "Dorji"],
    "Electrical Engineering": ["Sangay", "Tenzin", "Namgay", "Choki"]
  };

  let students = [];
  for (let y = 0; y < years.length; y++) {
    const year = years[y];
    const semester = "2nd";
    let idCounter = yearIdBase[year];
    let passwordCounter = 1;
    for (const department of Object.keys(departmentModules)) {
      for (let i = 1; i <= 5; i++) {
        const userId = String(idCounter);
        const password = `password${passwordCounter}`;
        let name;
        if (i === 1 && customNames[department] && customNames[department][y]) {
          name = customNames[department][y];
        } else {
          name = bhutaneseNames[(idCounter + i) % bhutaneseNames.length];
        }
        students.push({
          userId,
          password,
          name,
          department,
          year,
          semester,
          email: `student${userId}@example.com`,
          phone: `+975 17${userId.slice(-4)}`,
          address: `${department} Hostel`,
          emergencyContact: `+975 77${userId.slice(-4)}`,
          program: `B.Tech ${department.split(' ')[0]}`
        });
        idCounter++;
        passwordCounter++;
      }
    }
  }

  // Insert students into the database
  for (const student of students) {
    await prisma.user.upsert({
      where: { userId: student.userId },
      update: {
        password: student.password,
        name: student.name,
        department: student.department,
        year: student.year,
        semester: student.semester,
        email: student.email,
        phone: student.phone,
        address: student.address,
        emergencyContact: student.emergencyContact,
        program: student.program,
      },
      create: {
        userId: student.userId,
        password: student.password,
        name: student.name,
        department: student.department,
        year: student.year,
        semester: student.semester,
        email: student.email,
        phone: student.phone,
        address: student.address,
        emergencyContact: student.emergencyContact,
        program: student.program,
      },
    });
  }

  // Faculty names - expanded list
  const facultyNames = [
    // Information Technology Faculty
    "Dr. Karma Dorji", "Prof. Pema Wangchuk", "Dr. Sonam Choden", "Prof. Tshering Dema", "Dr. Jigme Phuntsho",
    "Prof. Ugyen Zangmo", "Dr. Tandin Wangdi", "Prof. Choki Lhamo", "Dr. Sangay Dorji", "Prof. Dechen Wangmo",
    "Dr. Kinley Wangdi", "Prof. Pema Lhamo", "Dr. Tashi Tenzin", "Prof. Namgay Dorji", "Dr. Karma Choden",
    // Software Engineering Faculty
    "Dr. Sonam Wangchuk", "Prof. Pema Dema", "Dr. Tshering Phuntsho", "Prof. Jigme Zangmo", "Dr. Ugyen Wangdi",
    "Prof. Tandin Lhamo", "Dr. Choki Dorji", "Prof. Sangay Wangmo", "Dr. Dechen Tenzin", "Prof. Kinley Dorji",
    // Civil Engineering Faculty
    "Dr. Pema Wangdi", "Prof. Sonam Lhamo", "Dr. Tshering Dorji", "Prof. Jigme Wangmo", "Dr. Ugyen Tenzin",
    "Prof. Tandin Dorji", "Dr. Choki Wangdi", "Prof. Sangay Lhamo", "Dr. Dechen Dorji", "Prof. Kinley Wangmo",
    // Electrical Engineering Faculty
    "Dr. Sonam Tenzin", "Prof. Pema Dorji", "Dr. Tshering Wangdi", "Prof. Jigme Lhamo", "Dr. Ugyen Dorji",
    "Prof. Tandin Wangmo", "Dr. Choki Tenzin", "Prof. Sangay Dorji", "Dr. Dechen Wangdi", "Prof. Kinley Lhamo"
  ];

  // Years for faculty distribution
  const facultyYears = ["1st", "3rd", "4th"];

  // Faculty qualifications and specializations
  const facultyDetails = {
    "Information Technology": {
      qualifications: [
        "Ph.D. in Computer Science",
        "Ph.D. in Information Technology",
        "Ph.D. in Artificial Intelligence",
        "M.Tech in Computer Science",
        "M.Tech in Software Engineering"
      ],
      specializations: [
        "Artificial Intelligence",
        "Web Development",
        "Database Systems",
        "Network Security",
        "Cloud Computing",
        "Data Science",
        "Machine Learning",
        "Software Engineering"
      ]
    },
    "Software Engineering": {
      qualifications: [
        "Ph.D. in Software Engineering",
        "Ph.D. in Computer Science",
        "M.Tech in Software Engineering",
        "M.Tech in Computer Science",
        "M.Tech in Information Technology"
      ],
      specializations: [
        "Software Architecture",
        "DevOps",
        "Cloud Computing",
        "Software Testing",
        "Agile Development",
        "Enterprise Software",
        "Software Security",
        "Distributed Systems"
      ]
    },
    "Civil Engineering": {
      qualifications: [
        "Ph.D. in Civil Engineering",
        "Ph.D. in Structural Engineering",
        "M.Tech in Civil Engineering",
        "M.Tech in Construction Management",
        "M.Tech in Transportation Engineering"
      ],
      specializations: [
        "Structural Engineering",
        "Transportation Engineering",
        "Environmental Engineering",
        "Geotechnical Engineering",
        "Construction Management",
        "Water Resources",
        "Surveying",
        "Project Management"
      ]
    },
    "Electrical Engineering": {
      qualifications: [
        "Ph.D. in Electrical Engineering",
        "Ph.D. in Power Systems",
        "M.Tech in Electrical Engineering",
        "M.Tech in Power Electronics",
        "M.Tech in Control Systems"
      ],
      specializations: [
        "Power Systems",
        "Control Systems",
        "Power Electronics",
        "Renewable Energy",
        "Microprocessors",
        "Instrumentation",
        "Smart Grid",
        "High Voltage Engineering"
      ]
    }
  };

  // Distribute faculty across departments and years
  let facultyIndex = 0;
  let instructors = [];

  // First, add the existing 2nd year faculty
  const secondYearFaculty = [
    {
      userId: "F001",
      password: "faculty1",
      name: "Dr. Tashi Dorji",
      department: "Information Technology",
      facultyRole: "HEAD",
      modules: ["IT201", "IT206", "IT204"],
      email: "tashi.dorji@example.com",
      phone: "+975 17123456",
      address: "Thimphu, Bhutan",
      qualification: "Ph.D. in Computer Science",
      specialization: "Artificial Intelligence",
      officeNumber: "IT-101"
    },
    {
      userId: "F002",
      password: "faculty2",
      name: "Prof. Sonam Lhamo",
      department: "Information Technology",
      facultyRole: "FACULTY",
      modules: ["IT202"],
      email: "sonam.lhamo@example.com",
      phone: "+975 17234567",
      address: "Paro, Bhutan",
      qualification: "M.Tech in Network Security",
      specialization: "Network Security",
      officeNumber: "IT-102"
    },
    {
      userId: "F003",
      password: "faculty3",
      name: "Mr. Jigme Namgyal",
      department: "Information Technology",
      facultyRole: "FACULTY",
      modules: ["IT203"],
      email: "jigme.namgyal@example.com",
      phone: "+975 17345678",
      address: "Punakha, Bhutan",
      qualification: "M.Tech in Software Engineering",
      specialization: "Software Engineering",
      officeNumber: "IT-103"
    },
    {
      userId: "F004",
      password: "faculty4",
      name: "Dr. Tshering Yangdon",
      department: "Software Engineering",
      facultyRole: "HEAD",
      modules: ["SE201"],
      email: "tshering.yangdon@example.com",
      phone: "+975 17456789",
      address: "Thimphu, Bhutan",
      qualification: "Ph.D. in Software Engineering",
      specialization: "Software Architecture",
      officeNumber: "SE-101"
    },
    {
      userId: "F005",
      password: "faculty5",
      name: "Prof. Pema Lhamo",
      department: "Software Engineering",
      facultyRole: "FACULTY",
      modules: ["SE204"],
      email: "pema.lhamo@example.com",
      phone: "+975 17567890",
      address: "Wangdue, Bhutan",
      qualification: "M.Tech in Computer Science",
      specialization: "Operating Systems",
      officeNumber: "SE-102"
    },
    {
      userId: "F006",
      password: "faculty6",
      name: "Prof. Jigme Dorji",
      department: "Civil Engineering",
      facultyRole: "HEAD",
      modules: ["TSM203", "STG202", "SUR202"],
      email: "jigme.dorji@example.com",
      phone: "+975 17678901",
      address: "Thimphu, Bhutan",
      qualification: "Ph.D. in Civil Engineering",
      specialization: "Transportation Engineering",
      officeNumber: "CE-101"
    },
    {
      userId: "F007",
      password: "faculty7",
      name: "Dr. Sangay Wangmo",
      department: "Civil Engineering",
      facultyRole: "FACULTY",
      modules: ["FM1202", "S202"],
      email: "sangay.wangmo@example.com",
      phone: "+975 17789012",
      address: "Paro, Bhutan",
      qualification: "Ph.D. in Fluid Mechanics",
      specialization: "Fluid Mechanics",
      officeNumber: "CE-102"
    },
    {
      userId: "F008",
      password: "faculty8",
      name: "Dr. Pema Dolma",
      department: "Electrical Engineering",
      facultyRole: "HEAD",
      modules: ["EFT201", "CKT202", "SNP201"],
      email: "pema.dolma@example.com",
      phone: "+975 17890123",
      address: "Thimphu, Bhutan",
      qualification: "Ph.D. in Electrical Engineering",
      specialization: "Power Systems",
      officeNumber: "EE-101"
    },
    {
      userId: "F009",
      password: "faculty9",
      name: "Prof. Tenzin Phurba",
      department: "Electrical Engineering",
      facultyRole: "FACULTY",
      modules: ["ECD203"],
      email: "tenzin.phurba@example.com",
      phone: "+975 17901234",
      address: "Punakha, Bhutan",
      qualification: "M.Tech in Electronics",
      specialization: "Electronic Circuit Design",
      officeNumber: "EE-102"
    }
  ];

  instructors = [...secondYearFaculty];
  facultyIndex = secondYearFaculty.length;

  // Add new faculty for 1st, 3rd, and 4th years
  for (const year of facultyYears) {
    for (const department of Object.keys(departmentModules)) {
      // Get modules for this department and year
      const yearModules = departmentModules[department][year];
      const modulesPerFaculty = 2; // Each faculty teaches 2 modules
      const numFacultyNeeded = Math.ceil(yearModules.length / modulesPerFaculty);

      for (let i = 0; i < numFacultyNeeded; i++) {
        if (facultyIndex >= facultyNames.length) break;

        // Get modules for this faculty member
        const startIdx = i * modulesPerFaculty;
        const endIdx = Math.min(startIdx + modulesPerFaculty, yearModules.length);
        const assignedModules = yearModules.slice(startIdx, endIdx).map(m => m.code);

        // Get random qualification and specialization
        const deptDetails = facultyDetails[department];
        const qualification = deptDetails.qualifications[Math.floor(Math.random() * deptDetails.qualifications.length)];
        const specialization = deptDetails.specializations[Math.floor(Math.random() * deptDetails.specializations.length)];

        instructors.push({
          userId: `F${(facultyIndex + 1).toString().padStart(3, '0')}`,
          password: `faculty${facultyIndex + 1}`,
          name: facultyNames[facultyIndex],
          department,
          facultyRole: i === 0 ? "HEAD" : "FACULTY",
          modules: assignedModules,
          email: `faculty${facultyIndex + 1}@example.com`,
          phone: `+975 17${(facultyIndex + 1).toString().padStart(4, '0')}`,
          address: `${department} Faculty Residence`,
          qualification,
          specialization,
          officeNumber: `${department.split(' ')[0].toUpperCase()}-${facultyIndex + 1}`
        });
        facultyIndex++;
      }
    }
  }

  // Insert instructors into the database
  for (const instructor of instructors) {
    await prisma.instructor.upsert({
      where: { userId: instructor.userId },
      update: {
        password: instructor.password,
        name: instructor.name,
        department: instructor.department,
        facultyRole: instructor.facultyRole,
        modules: instructor.modules,
        email: instructor.email,
        phone: instructor.phone,
        address: instructor.address,
        qualification: instructor.qualification,
        specialization: instructor.specialization,
        officeNumber: instructor.officeNumber,
      },
      create: {
        userId: instructor.userId,
        password: instructor.password,
        name: instructor.name,
        department: instructor.department,
        facultyRole: instructor.facultyRole,
        modules: instructor.modules,
        email: instructor.email,
        phone: instructor.phone,
        address: instructor.address,
        qualification: instructor.qualification,
        specialization: instructor.specialization,
        officeNumber: instructor.officeNumber,
      },
    });
  }

  console.log('Database seeded successfully with new student structure!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });