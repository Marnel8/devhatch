import { ref, get, query, orderByChild, equalTo } from "firebase/database"
import { database } from "@/app/lib/firebase"
import type { Student, AttendanceRecord, Accomplishment } from "@/types"

// Get all students
export async function getAllStudents(): Promise<Student[]> {
  try {
    const studentsRef = ref(database, "students")
    const snapshot = await get(studentsRef)
    
    if (!snapshot.exists()) {
      return []
    }
    
    const studentsData = snapshot.val()
    const students: Student[] = Object.values(studentsData)
    
    console.log(`✅ Retrieved ${students.length} students`)
    return students.sort((a, b) => a.name.localeCompare(b.name))
  } catch (error) {
    console.error("❌ Error fetching students:", error)
    throw new Error("Failed to fetch students")
  }
}

// Get student by ID
export async function getStudentById(studentId: string): Promise<Student | null> {
  try {
    const studentRef = ref(database, `students/${studentId}`)
    const snapshot = await get(studentRef)
    
    if (!snapshot.exists()) {
      return null
    }
    
    const student = snapshot.val()
    console.log(`✅ Retrieved student: ${student.name}`)
    return student
  } catch (error) {
    console.error("❌ Error fetching student:", error)
    throw new Error("Failed to fetch student")
  }
}

// Get all attendance records
export async function getAllAttendanceRecords(): Promise<AttendanceRecord[]> {
  try {
    const attendanceRef = ref(database, "attendanceRecords")
    const snapshot = await get(attendanceRef)
    
    if (!snapshot.exists()) {
      return []
    }
    
    const attendanceData = snapshot.val()
    const records: AttendanceRecord[] = Object.values(attendanceData)
    
    console.log(`✅ Retrieved ${records.length} attendance records`)
    return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch (error) {
    console.error("❌ Error fetching attendance records:", error)
    throw new Error("Failed to fetch attendance records")
  }
}

// Get attendance records by student ID
export async function getAttendanceRecordsByStudentId(studentId: string): Promise<AttendanceRecord[]> {
  try {
    const attendanceRef = ref(database, "attendanceRecords")
    const studentAttendanceQuery = query(attendanceRef, orderByChild("studentId"), equalTo(studentId))
    const snapshot = await get(studentAttendanceQuery)
    
    if (!snapshot.exists()) {
      return []
    }
    
    const attendanceData = snapshot.val()
    const records: AttendanceRecord[] = Object.values(attendanceData)
    
    console.log(`✅ Retrieved ${records.length} attendance records for student ${studentId}`)
    return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch (error) {
    console.error("❌ Error fetching attendance records by student ID:", error)
    throw new Error("Failed to fetch attendance records")
  }
}

// Get all accomplishments
export async function getAllAccomplishments(): Promise<Accomplishment[]> {
  try {
    const accomplishmentsRef = ref(database, "accomplishments")
    const snapshot = await get(accomplishmentsRef)
    
    if (!snapshot.exists()) {
      return []
    }
    
    const accomplishmentsData = snapshot.val()
    const accomplishments: Accomplishment[] = Object.values(accomplishmentsData)
    
    console.log(`✅ Retrieved ${accomplishments.length} accomplishments`)
    return accomplishments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch (error) {
    console.error("❌ Error fetching accomplishments:", error)
    throw new Error("Failed to fetch accomplishments")
  }
}

// Get accomplishments by student ID
export async function getAccomplishmentsByStudentId(studentId: string): Promise<Accomplishment[]> {
  try {
    const accomplishmentsRef = ref(database, "accomplishments")
    const studentAccomplishmentsQuery = query(accomplishmentsRef, orderByChild("studentId"), equalTo(studentId))
    const snapshot = await get(studentAccomplishmentsQuery)
    
    if (!snapshot.exists()) {
      return []
    }
    
    const accomplishmentsData = snapshot.val()
    const accomplishments: Accomplishment[] = Object.values(accomplishmentsData)
    
    console.log(`✅ Retrieved ${accomplishments.length} accomplishments for student ${studentId}`)
    return accomplishments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch (error) {
    console.error("❌ Error fetching accomplishments by student ID:", error)
    throw new Error("Failed to fetch accomplishments")
  }
}

// Calculate completed hours from attendance records
export function calculateCompletedHours(attendanceRecords: AttendanceRecord[]): number {
  return attendanceRecords.reduce((total, record) => total + (record.hoursWorked || 0), 0)
}

// Update student completed hours based on attendance
export async function updateStudentHours(studentId: string): Promise<void> {
  try {
    const attendanceRecords = await getAttendanceRecordsByStudentId(studentId)
    const completedHours = calculateCompletedHours(attendanceRecords)
    
    // This would update the student record in the database
    // For now, we'll just calculate and return the value
    console.log(`✅ Calculated ${completedHours} completed hours for student ${studentId}`)
  } catch (error) {
    console.error("❌ Error updating student hours:", error)
    throw new Error("Failed to update student hours")
  }
} 