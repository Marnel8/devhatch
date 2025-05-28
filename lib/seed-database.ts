import { ref, set, push } from "firebase/database"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth, database } from "@/app/lib/firebase"
import type { User, Student, JobPosting, Application, AttendanceRecord, Accomplishment } from "@/types"

export async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...")

    // Test database connection and permissions first
    try {
      const testRef = ref(database, "test")
      await set(testRef, { timestamp: Date.now(), test: true })
      console.log("✅ Database connection and permissions verified")

      // Clean up test data
      await set(testRef, null)
    } catch (dbError: any) {
      console.error("❌ Database connection/permission failed:", dbError)

      if (dbError.code === "PERMISSION_DENIED") {
        throw new Error(
          "Database permission denied. Please update your Firebase Realtime Database rules to allow read/write access. " +
            'Go to Firebase Console > Realtime Database > Rules and set: { "rules": { ".read": true, ".write": true } }',
        )
      } else {
        throw new Error(`Database connection failed: ${dbError.message}`)
      }
    }

    // Create demo users in Firebase Auth and Database
    const users = await createDemoUsers()

    // Seed job postings
    await seedJobPostings()

    // Seed applications
    await seedApplications()

    // Seed attendance records
    await seedAttendanceRecords()

    // Seed accomplishments
    await seedAccomplishments()

    console.log("✅ Database seeding completed successfully!")
    return { success: true, users, message: "All demo data created successfully!" }
  } catch (error: any) {
    console.error("❌ Error seeding database:", error)
    return {
      success: false,
      error: error,
      message: error.message || "Unknown error occurred during seeding",
    }
  }
}

async function createDemoUsers() {
  const users = []

  // Admin User
  try {
    const adminCredential = await createUserWithEmailAndPassword(auth, "admin@g.batstate-u.edu.ph", "admin123456")

    const adminUser: User = {
      id: adminCredential.user.uid,
      email: "admin@g.batstate-u.edu.ph",
      role: "admin",
      name: "DevOps Administrator",
      createdAt: new Date().toISOString(),
    }

    await set(ref(database, `users/${adminCredential.user.uid}`), adminUser)
    users.push(adminUser)
    console.log("✅ Created admin user: admin@g.batstate-u.edu.ph")
  } catch (error: any) {
    if (error.code === "auth/email-already-in-use") {
      console.log("ℹ️ Admin user already exists: admin@g.batstate-u.edu.ph")
      // Still add to users array for return
      users.push({
        id: "existing-admin",
        email: "admin@g.batstate-u.edu.ph",
        role: "admin",
        name: "DevOps Administrator",
        createdAt: new Date().toISOString(),
      })
    } else {
      console.error("❌ Error creating admin user:", error)
      throw error
    }
  }

  // Student Users
  const studentData = [
    {
      email: "student@g.batstate-u.edu.ph",
      password: "demo123456",
      name: "Maria Santos",
      ojtNumber: "OJT-2024-001",
      project: "TRIOE",
      position: "Frontend Developer Intern",
      totalHours: 240,
      completedHours: 156,
    },
    {
      email: "john.delacruz@g.batstate-u.edu.ph",
      password: "student123456",
      name: "John Dela Cruz",
      ojtNumber: "OJT-2024-002",
      project: "MR. MED",
      position: "3D Graphics Developer",
      totalHours: 240,
      completedHours: 89,
    },
    {
      email: "anna.reyes@g.batstate-u.edu.ph",
      password: "student123456",
      name: "Anna Reyes",
      ojtNumber: "OJT-2024-003",
      project: "HAPTICS",
      position: "Hardware Interface Developer",
      totalHours: 240,
      completedHours: 203,
    },
    {
      email: "carlos.mendoza@g.batstate-u.edu.ph",
      password: "student123456",
      name: "Carlos Mendoza",
      ojtNumber: "OJT-2024-004",
      project: "TRIOE",
      position: "UI/UX Designer",
      totalHours: 240,
      completedHours: 67,
    },
    {
      email: "sofia.garcia@g.batstate-u.edu.ph",
      password: "student123456",
      name: "Sofia Garcia",
      ojtNumber: "OJT-2024-005",
      project: "MR. MED",
      position: "Mobile App Developer",
      totalHours: 240,
      completedHours: 134,
    },
  ]

  for (const studentInfo of studentData) {
    try {
      const studentCredential = await createUserWithEmailAndPassword(auth, studentInfo.email, studentInfo.password)

      const student: Student = {
        id: studentCredential.user.uid,
        email: studentInfo.email,
        role: "student",
        name: studentInfo.name,
        createdAt: new Date().toISOString(),
        ojtNumber: studentInfo.ojtNumber,
        project: studentInfo.project as "TRIOE" | "MR. MED" | "HAPTICS",
        position: studentInfo.position,
        totalHours: studentInfo.totalHours,
        completedHours: studentInfo.completedHours,
        isActive: true,
        qrCode: `QR-${studentInfo.ojtNumber}`,
        lastTimeIn: new Date().toISOString(),
      }

      await set(ref(database, `users/${studentCredential.user.uid}`), student)
      await set(ref(database, `students/${studentCredential.user.uid}`), student)
      users.push(student)
      console.log(`✅ Created student: ${studentInfo.name} (${studentInfo.email})`)
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        console.log(`ℹ️ Student ${studentInfo.name} already exists (${studentInfo.email})`)
        // Still add to users array for return
        users.push({
          id: `existing-${studentInfo.ojtNumber}`,
          email: studentInfo.email,
          role: "student",
          name: studentInfo.name,
          createdAt: new Date().toISOString(),
        })
      } else {
        console.error(`❌ Error creating student ${studentInfo.name}:`, error)
        // Don't throw here, continue with other students
      }
    }
  }

  return users
}

async function seedJobPostings() {
  const jobPostings: Omit<JobPosting, "id">[] = [
    {
      title: "Frontend Developer Intern",
      project: "TRIOE",
      description:
        "Work on circuit board development interfaces and marketing websites using modern web technologies. You'll be part of a dynamic team creating user-friendly interfaces for complex electronic design tools.",
      requirements:
        "React, TypeScript, Tailwind CSS experience preferred. Basic understanding of responsive design and modern web development practices. Knowledge of Git version control is a plus.",
      availableSlots: 3,
      filledSlots: 2,
      createdAt: "2024-01-15",
      isActive: true,
      createdBy: "admin",
    },
    {
      title: "3D Graphics Developer",
      project: "MR. MED",
      description:
        "Develop 3D and Mixed Reality applications for medical training using cutting-edge technologies. Create immersive experiences that help medical students learn complex procedures.",
      requirements:
        "Unity, C#, 3D modeling experience. Knowledge of VR/AR development is a plus. Understanding of medical terminology and procedures would be beneficial.",
      availableSlots: 2,
      filledSlots: 1,
      createdAt: "2024-01-14",
      isActive: true,
      createdBy: "admin",
    },
    {
      title: "Hardware Interface Developer",
      project: "HAPTICS",
      description:
        "Create haptic feedback systems and interfaces for next-generation user experiences. Work with sensors, actuators, and embedded systems to create tactile interfaces.",
      requirements:
        "Arduino, C++, electronics knowledge. Experience with sensor integration preferred. Understanding of embedded systems and microcontroller programming.",
      availableSlots: 2,
      filledSlots: 1,
      createdAt: "2024-01-13",
      isActive: true,
      createdBy: "admin",
    },
    {
      title: "UI/UX Designer",
      project: "TRIOE",
      description:
        "Design user interfaces for circuit board development tools and create intuitive user experiences. Focus on making complex technical tools accessible to engineers.",
      requirements:
        "Figma, Adobe Creative Suite, design thinking. Portfolio showcasing UI/UX work required. Understanding of user research and usability testing principles.",
      availableSlots: 1,
      filledSlots: 1,
      createdAt: "2024-01-12",
      isActive: true,
      createdBy: "admin",
    },
    {
      title: "Mobile App Developer",
      project: "MR. MED",
      description:
        "Build mobile applications that complement our VR medical training platform. Create companion apps for students and instructors.",
      requirements:
        "React Native or Flutter experience. Knowledge of mobile UI patterns and performance optimization. Experience with REST APIs and mobile app deployment.",
      availableSlots: 2,
      filledSlots: 1,
      createdAt: "2024-01-11",
      isActive: true,
      createdBy: "admin",
    },
    {
      title: "Backend Developer",
      project: "HAPTICS",
      description:
        "Develop server-side applications and APIs for haptic feedback systems. Work with real-time data processing and device communication protocols.",
      requirements:
        "Node.js, Python, or Java experience. Knowledge of databases and API development. Understanding of real-time systems and WebSocket communication.",
      availableSlots: 1,
      filledSlots: 0,
      createdAt: "2024-01-10",
      isActive: true,
      createdBy: "admin",
    },
  ]

  try {
    for (const job of jobPostings) {
      const jobRef = push(ref(database, "jobPostings"))
      const jobWithId = { ...job, id: jobRef.key }
      await set(jobRef, jobWithId)
    }
    console.log("✅ Seeded job postings")
  } catch (error) {
    console.error("❌ Error seeding job postings:", error)
    throw error
  }
}

async function seedApplications() {
  const applications: Omit<Application, "id">[] = [
    {
      jobId: "job1",
      studentId: "student1",
      studentName: "Maria Santos",
      studentEmail: "student@g.batstate-u.edu.ph",
      coverLetter:
        "I am very interested in this Frontend Developer position. I have experience with React and TypeScript from my coursework and personal projects. I'm excited to contribute to the TRIOE project and learn from experienced developers.",
      status: "approved",
      appliedAt: "2024-01-20",
      reviewedAt: "2024-01-21",
      reviewedBy: "admin",
    },
    {
      jobId: "job2",
      studentId: "student2",
      studentName: "John Dela Cruz",
      studentEmail: "john.delacruz@g.batstate-u.edu.ph",
      coverLetter:
        "I have a strong background in 3D graphics and Unity development. I've worked on several VR projects during my studies and I'm passionate about using technology to improve medical education.",
      status: "approved",
      appliedAt: "2024-01-19",
      reviewedAt: "2024-01-20",
      reviewedBy: "admin",
    },
    {
      jobId: "job3",
      studentId: "student3",
      studentName: "Anna Reyes",
      studentEmail: "anna.reyes@g.batstate-u.edu.ph",
      coverLetter:
        "My experience with Arduino and embedded systems makes me a great fit for the HAPTICS project. I've built several IoT projects and I'm excited to work on haptic feedback systems.",
      status: "approved",
      appliedAt: "2024-01-18",
      reviewedAt: "2024-01-19",
      reviewedBy: "admin",
    },
    {
      jobId: "job1",
      studentId: "pending1",
      studentName: "Miguel Torres",
      studentEmail: "miguel.torres@g.batstate-u.edu.ph",
      coverLetter:
        "I'm a Computer Science student with a passion for web development. I've been learning React and would love to gain real-world experience with the TRIOE project.",
      status: "pending",
      appliedAt: "2024-01-22",
    },
    {
      jobId: "job6",
      studentId: "pending2",
      studentName: "Isabella Cruz",
      studentEmail: "isabella.cruz@g.batstate-u.edu.ph",
      coverLetter:
        "I have experience with Node.js and database development. I'm interested in working on backend systems for the HAPTICS project and learning about real-time data processing.",
      status: "pending",
      appliedAt: "2024-01-21",
    },
  ]

  try {
    for (const application of applications) {
      const appRef = push(ref(database, "applications"))
      const appWithId = { ...application, id: appRef.key }
      await set(appRef, appWithId)
    }
    console.log("✅ Seeded applications")
  } catch (error) {
    console.error("❌ Error seeding applications:", error)
    throw error
  }
}

async function seedAttendanceRecords() {
  const attendanceRecords: Omit<AttendanceRecord, "id">[] = []

  // Generate attendance records for the past 2 weeks
  const students = ["student1", "student2", "student3", "student4", "student5"]
  const ojtNumbers = ["OJT-2024-001", "OJT-2024-002", "OJT-2024-003", "OJT-2024-004", "OJT-2024-005"]

  for (let i = 0; i < 14; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue

    students.forEach((studentId, index) => {
      // Random chance of attendance (90% attendance rate)
      if (Math.random() > 0.1) {
        const timeIn = new Date(date)
        timeIn.setHours(8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60))

        const timeOut = new Date(timeIn)
        timeOut.setHours(timeIn.getHours() + 8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60))

        const hoursWorked = (timeOut.getTime() - timeIn.getTime()) / (1000 * 60 * 60)

        attendanceRecords.push({
          studentId,
          ojtNumber: ojtNumbers[index],
          timeIn: timeIn.toISOString(),
          timeOut: timeOut.toISOString(),
          date: date.toISOString().split("T")[0],
          hoursWorked: Math.round(hoursWorked * 100) / 100,
        })
      }
    })
  }

  try {
    for (const record of attendanceRecords) {
      const recordRef = push(ref(database, "attendanceRecords"))
      const recordWithId = { ...record, id: recordRef.key }
      await set(recordRef, recordWithId)
    }
    console.log("✅ Seeded attendance records")
  } catch (error) {
    console.error("❌ Error seeding attendance records:", error)
    throw error
  }
}

async function seedAccomplishments() {
  const accomplishments: Omit<Accomplishment, "id">[] = [
    {
      studentId: "student1",
      ojtNumber: "OJT-2024-001",
      date: "2024-01-22",
      description:
        "Completed responsive design implementation for the circuit board interface. Fixed cross-browser compatibility issues and optimized for mobile devices.",
      submittedAt: "2024-01-22T17:00:00Z",
    },
    {
      studentId: "student1",
      ojtNumber: "OJT-2024-001",
      date: "2024-01-21",
      description:
        "Implemented user authentication system with proper validation and error handling. Added password reset functionality.",
      submittedAt: "2024-01-21T17:00:00Z",
    },
    {
      studentId: "student2",
      ojtNumber: "OJT-2024-002",
      date: "2024-01-22",
      description:
        "Created 3D models for medical training scenarios. Implemented realistic lighting and material systems in Unity.",
      submittedAt: "2024-01-22T17:00:00Z",
    },
    {
      studentId: "student2",
      ojtNumber: "OJT-2024-002",
      date: "2024-01-21",
      description:
        "Developed VR interaction system for medical equipment simulation. Added haptic feedback integration.",
      submittedAt: "2024-01-21T17:00:00Z",
    },
    {
      studentId: "student3",
      ojtNumber: "OJT-2024-003",
      date: "2024-01-22",
      description: "Designed and implemented sensor calibration system for haptic devices. Improved accuracy by 15%.",
      submittedAt: "2024-01-22T17:00:00Z",
    },
  ]

  try {
    for (const accomplishment of accomplishments) {
      const accomplishmentRef = push(ref(database, "accomplishments"))
      const accomplishmentWithId = { ...accomplishment, id: accomplishmentRef.key }
      await set(accomplishmentRef, accomplishmentWithId)
    }
    console.log("✅ Seeded accomplishments")
  } catch (error) {
    console.error("❌ Error seeding accomplishments:", error)
    throw error
  }
}
