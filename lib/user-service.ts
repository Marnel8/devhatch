import { createUserWithEmailAndPassword } from "firebase/auth"
import { ref, set, get } from "firebase/database"
import { auth, database } from "@/app/lib/firebase"
import type { User } from "@/types"

export interface CreateInternData {
  email: string
  password: string
  name: string
  studentId: string
  role?: "student" | "project_admin"
  projectAccess?: string[]
  firstName?: string
  lastName?: string
  course?: string
  year?: string
  project?: string
  resumeUrl?: string
}

// Create a new intern user account
export async function createInternAccount(internData: CreateInternData): Promise<User> {
  try {
    // Check if user already exists in database
    const existingUserQuery = ref(database, "users")
    const usersSnapshot = await get(existingUserQuery)
    
    if (usersSnapshot.exists()) {
      const users = Object.values(usersSnapshot.val()) as User[]
      const existingUser = users.find(user => user.email === internData.email)
      
      if (existingUser) {
        throw new Error("User already exists with this email")
      }
    }

    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      internData.email, 
      internData.password
    )
    
    const firebaseUser = userCredential.user

    // Create user data for database
    const userData: User = {
      id: firebaseUser.uid,
      email: internData.email,
      name: internData.name,
      role: internData.role || "student",
      createdAt: new Date().toISOString(),
      // Project access for admins
      projectAccess: internData.projectAccess,
      // Additional intern-specific data
      studentId: internData.studentId,
      firstName: internData.firstName || "",
      lastName: internData.lastName || "",
      course: internData.course || "",
      year: internData.year || "",
      project: internData.project || "",
      resumeUrl: internData.resumeUrl || "",
      isIntern: true,
    }

    // Save user data to database
    const userRef = ref(database, `users/${firebaseUser.uid}`)
    await set(userRef, userData)

    console.log("✅ Intern account created:", userData.email)
    return userData
  } catch (error: any) {
    console.error("❌ Error creating intern account:", error)
    
    // Handle specific Firebase Auth errors
    if (error.code === "auth/email-already-in-use") {
      throw new Error("An account with this email already exists")
    } else if (error.code === "auth/weak-password") {
      throw new Error("Password is too weak. Please use a stronger password")
    } else if (error.code === "auth/invalid-email") {
      throw new Error("Invalid email address")
    }
    
    throw new Error(error.message || "Failed to create intern account")
  }
}

// Check if user already exists by email
export async function checkUserExists(email: string): Promise<boolean> {
  try {
    const usersRef = ref(database, "users")
    const snapshot = await get(usersRef)
    
    if (!snapshot.exists()) {
      return false
    }
    
    const users = Object.values(snapshot.val()) as User[]
    return users.some(user => user.email === email)
  } catch (error) {
    console.error("❌ Error checking user existence:", error)
    return false
  }
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const usersRef = ref(database, "users")
    const snapshot = await get(usersRef)
    
    if (!snapshot.exists()) {
      return null
    }
    
    const users = Object.values(snapshot.val()) as User[]
    return users.find(user => user.email === email) || null
  } catch (error) {
    console.error("❌ Error fetching user by email:", error)
    return null
  }
} 