import { createUserWithEmailAndPassword } from "firebase/auth"
import { ref, set, get } from "firebase/database"
import { auth, database } from "../app/lib/firebase"
import type { User } from "../types"

interface AdminData {
  email: string
  password: string
  name: string
  projectAccess: string[]
}

const PROJECT_ADMINS: AdminData[] = [
  {
    email: "trioe.admin@devhatch.com",
    password: "trioe123456",
    name: "TRIOE Project Admin",
    projectAccess: ["TRIOE"]
  },
  {
    email: "mrmed.admin@devhatch.com", 
    password: "mrmed123456",
    name: "MR. MED Project Admin",
    projectAccess: ["MR. MED"]
  },
  {
    email: "haptics.admin@devhatch.com",
    password: "haptics123456",
    name: "HAPTICS Project Admin", 
    projectAccess: ["HAPTICS"]
  },
  {
    email: "multi.admin@devhatch.com",
    password: "multi123456",
    name: "Multi-Project Admin",
    projectAccess: ["TRIOE", "MR. MED"]
  }
]

async function createProjectAdmin(adminData: AdminData): Promise<void> {
  try {
    console.log(`Creating project admin: ${adminData.name}...`)
    
    // Check if user already exists
    const usersRef = ref(database, "users")
    const snapshot = await get(usersRef)
    
    if (snapshot.exists()) {
      const users = Object.values(snapshot.val()) as User[]
      const existingUser = users.find(user => user.email === adminData.email)
      
      if (existingUser) {
        console.log(`✅ User ${adminData.email} already exists, skipping...`)
        return
      }
    }

    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      adminData.email,
      adminData.password
    )
    
    const firebaseUser = userCredential.user

    // Create user data for database
    const userData: User = {
      id: firebaseUser.uid,
      email: adminData.email,
      name: adminData.name,
      role: "project_admin",
      projectAccess: adminData.projectAccess,
      createdAt: new Date().toISOString(),
    }

    // Save user data to database
    const userRef = ref(database, `users/${firebaseUser.uid}`)
    await set(userRef, userData)

    console.log(`✅ Created project admin: ${adminData.name} (${adminData.email})`)
    console.log(`   Project access: ${adminData.projectAccess.join(", ")}`)
  } catch (error: any) {
    if (error.code === "auth/email-already-in-use") {
      console.log(`⚠️ Email ${adminData.email} already in use, skipping...`)
    } else {
      console.error(`❌ Failed to create ${adminData.name}:`, error.message)
    }
  }
}

async function createAllProjectAdmins(): Promise<void> {
  console.log("🚀 Starting project admin creation...")
  console.log("================================================")
  
  for (const adminData of PROJECT_ADMINS) {
    await createProjectAdmin(adminData)
    console.log("") // Empty line for readability
  }
  
  console.log("================================================")
  console.log("✅ Project admin creation completed!")
  console.log("")
  console.log("Demo Login Credentials:")
  console.log("======================")
  
  PROJECT_ADMINS.forEach(admin => {
    console.log(`${admin.name}:`)
    console.log(`  Email: ${admin.email}`)
    console.log(`  Password: ${admin.password}`)
    console.log(`  Projects: ${admin.projectAccess.join(", ")}`)
    console.log("")
  })
  
  console.log("Super Admin:")
  console.log(`  Email: admin@devhatch.com`)
  console.log(`  Password: admin123`)
  console.log(`  Projects: All Projects`)
}

// Run the script
if (require.main === module) {
  createAllProjectAdmins()
    .then(() => {
      console.log("Script completed successfully!")
      process.exit(0)
    })
    .catch((error) => {
      console.error("Script failed:", error)
      process.exit(1)
    })
}

export { createAllProjectAdmins } 