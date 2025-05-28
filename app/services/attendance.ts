import { ref, push, set, get, query, orderByChild, equalTo } from "firebase/database"
import { database } from "@/app/lib/firebase"

export interface AttendanceRecord {
  id?: string
  studentId: string
  studentName: string
  ojtNumber: string
  action: "Time In" | "Time Out"
  timestamp: string
  project: string
  status: "in" | "out"
}

export interface DailyStats {
  totalScans: number
  checkedIn: number
  checkedOut: number
  activeStudents: number
}

export interface StudentData {
  id: string
  name: string
  ojtNumber: string
  project: string
}

interface DatabaseStudent {
  name: string
  ojtNumber: string
  project: string
  [key: string]: any
}

export const attendanceService = {
  // Record a new attendance (check-in/check-out)
  async recordAttendance(data: Pick<AttendanceRecord, "studentId" | "studentName" | "ojtNumber" | "project">): Promise<AttendanceRecord> {
    try {
      // Get the student's last attendance record
      const lastRecord = await this.getStudentLastAttendance(data.studentId)
      
      // Determine if this should be a check-in or check-out
      const action = lastRecord?.status === "in" ? "Time Out" : "Time In"
      const status = action === "Time In" ? "in" : "out"

      const record: Omit<AttendanceRecord, 'id'> = {
        ...data,
        action,
        status,
        timestamp: new Date().toISOString(),
      }

      const attendanceRef = ref(database, "attendance")
      const newAttendanceRef = push(attendanceRef)
      
      const recordWithId: AttendanceRecord = {
        ...record,
        id: newAttendanceRef.key!,
      }

      await set(newAttendanceRef, recordWithId)
      return recordWithId
    } catch (error) {
      console.error("Error recording attendance:", error)
      throw new Error("Failed to record attendance")
    }
  },

  // Get a student's last attendance record
  async getStudentLastAttendance(studentId: string): Promise<AttendanceRecord | null> {
    try {
      const attendanceRef = ref(database, "attendance")
      const studentAttendanceQuery = query(
        attendanceRef,
        orderByChild("studentId"),
        equalTo(studentId)
      )

      const snapshot = await get(studentAttendanceQuery)
      if (!snapshot.exists()) return null

      const records = Object.entries(snapshot.val()).map(([id, data]) => ({
        ...(data as Omit<AttendanceRecord, "id">),
        id,
      }))

      // Sort by timestamp descending and get the most recent
      return records.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0]
    } catch (error) {
      console.error("Error getting last attendance:", error)
      throw new Error("Failed to get last attendance")
    }
  },

  // Get recent attendance records
  async getRecentAttendance(limitCount = 10): Promise<AttendanceRecord[]> {
    try {
      const attendanceRef = ref(database, "attendance")
      const snapshot = await get(attendanceRef)

      if (!snapshot.exists()) return []

      const records = Object.entries(snapshot.val()).map(([id, data]) => ({
        ...(data as Omit<AttendanceRecord, "id">),
        id,
      }))

      // Sort by timestamp descending and limit
      return records
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limitCount)
    } catch (error) {
      console.error("Error getting recent attendance:", error)
      throw new Error("Failed to get recent attendance")
    }
  },

  // Get today's attendance statistics
  async getTodayStats(): Promise<DailyStats> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const attendanceRef = ref(database, "attendance")
      const snapshot = await get(attendanceRef)

      if (!snapshot.exists()) {
        return {
          totalScans: 0,
          checkedIn: 0,
          checkedOut: 0,
          activeStudents: 0,
        }
      }

      const records = Object.values(snapshot.val() as Record<string, AttendanceRecord>)
        .filter(record => {
          const recordDate = new Date(record.timestamp)
          return recordDate >= today
        })

      const stats = {
        totalScans: records.length,
        checkedIn: records.filter(r => r.action === "Time In").length,
        checkedOut: records.filter(r => r.action === "Time Out").length,
        activeStudents: new Set(records.filter(r => r.status === "in").map(r => r.studentId)).size,
      }

      return stats
    } catch (error) {
      console.error("Error getting today's stats:", error)
      throw new Error("Failed to get today's statistics")
    }
  },

  // Validate student QR code and get student info
  async validateStudentQR(qrCode: string): Promise<{
    isValid: boolean
    studentData?: StudentData
    message?: string
  }> {
    try {
      console.log("Validating QR code:", qrCode)
      const studentsRef = ref(database, "students")
      const studentQuery = query(
        studentsRef,
        orderByChild("ojtNumber"),
        equalTo(qrCode)
      )

      const snapshot = await get(studentQuery)
      console.log("Query snapshot:", {
        exists: snapshot.exists(),
        val: snapshot.val(),
      })

      if (!snapshot.exists()) {
        console.log("No student found with ojtNumber:", qrCode)
        return {
          isValid: false,
          message: "Invalid QR code or student not found",
        }
      }

      const entries = Object.entries(snapshot.val())
      console.log("Student entries:", entries)

      if (entries.length === 0) {
        console.log("No entries found in snapshot")
        return {
          isValid: false,
          message: "No student data found",
        }
      }

      const [studentId, studentData] = entries[0] as [string, DatabaseStudent]
      console.log("Student data:", { studentId, studentData })
      
      return {
        isValid: true,
        studentData: {
          id: studentId,
          name: studentData.name,
          ojtNumber: studentData.ojtNumber,
          project: studentData.project,
        },
      }
    } catch (error) {
      console.error("Error validating student QR:", error)
      throw new Error("Failed to validate student QR code")
    }
  },
} 