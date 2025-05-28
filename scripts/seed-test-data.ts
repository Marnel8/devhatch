import { ref, set } from "firebase/database"
import { database } from "@/app/lib/firebase"

async function seedTestData() {
  try {
    console.log("🌱 Seeding test data...")

    // Add a test student
    const testStudent = {
      name: "Test Student",
      ojtNumber: "OJT-2024-001",
      project: "TRIOE",
      email: "test.student@g.batstate-u.edu.ph",
      createdAt: new Date().toISOString(),
    }

    const studentRef = ref(database, "students/test-student-1")
    await set(studentRef, testStudent)
    console.log("✅ Added test student:", testStudent)

    console.log("✅ Test data seeding completed!")
  } catch (error) {
    console.error("❌ Error seeding test data:", error)
  }
}

// Run the seeding
seedTestData() 