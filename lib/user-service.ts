import { createUserWithEmailAndPassword } from "firebase/auth"
import { ref, set, get, query, orderByChild, equalTo } from "firebase/database"
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

export async function getProjectAdmins(projectName: string): Promise<string[]> {
  try {
    const usersRef = ref(database, "users");
    
    // Log the entire project name for debugging
    console.log(`🔍 Searching for project admins for project: ${projectName}`);

    // First, try querying by role
    const projectAdminsQuery = query(
      usersRef, 
      orderByChild("role"), 
      equalTo("project_admin")
    );

    const snapshot = await get(projectAdminsQuery);
    
    // Log raw snapshot data
    console.log('🔍 Raw Snapshot Exists:', snapshot.exists());
    if (snapshot.exists()) {
      console.log('🔍 Raw Snapshot Keys:', Object.keys(snapshot.val() || {}));
    }

    if (!snapshot.exists()) {
      console.log(`❌ No project admins found for role query`);
      
      // Fallback: get all users and manually filter
      const allUsersSnapshot = await get(usersRef);
      
      if (!allUsersSnapshot.exists()) {
        console.log('❌ No users found in the database');
        return [];
      }

      const allUsersData = allUsersSnapshot.val();
      console.log('🔍 Fallback - Total Users:', Object.keys(allUsersData || {}).length);

      // Log all users for debugging
      Object.entries(allUsersData || {}).forEach(([key, user]: [string, any]) => {
        console.log(`🔍 User ${key} Details:`, {
          role: user.role,
          projectAccess: user.projectAccess,
          email: user.email
        });
      });

      const adminEmails = Object.values(allUsersData || {})
        .filter((user: any) => 
          user.role === "project_admin" && 
          user.projectAccess && 
          user.projectAccess.includes(projectName)
        )
        .map((user: any) => user.email)
        .filter(Boolean);

      console.log(`🔍 Fallback - Found ${adminEmails.length} admins for project: ${projectName}`);
      console.log('📧 Fallback Admin Emails:', adminEmails);

      return adminEmails;
    }

    const adminsData = snapshot.val();
    console.log('🔍 Project Admin Users:', Object.keys(adminsData || {}));

    const adminEmails = Object.values(adminsData || {})
      .filter((user: any) => 
        user.projectAccess && 
        user.projectAccess.includes(projectName)
      )
      .map((user: any) => user.email)
      .filter(Boolean);

    console.log(`🔍 Found ${adminEmails.length} admins for project: ${projectName}`);
    console.log('📧 Admin Emails:', adminEmails);

    return adminEmails;
  } catch (error) {
    console.error(`❌ Error fetching admins for project ${projectName}:`, error);
    return [];
  }
} 