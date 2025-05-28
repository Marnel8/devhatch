import { database } from '@/app/lib/firebase'
import { ref, onValue, off, DataSnapshot } from 'firebase/database'
import type { DashboardStats, RecentActivity } from '@/types'

export const subscribeToDashboardStats = (callback: (stats: DashboardStats) => void) => {
  const calculateStats = (
    studentsSnapshot: DataSnapshot | null,
    jobsSnapshot: DataSnapshot | null,
    applicationsSnapshot: DataSnapshot | null,
    attendanceSnapshot: DataSnapshot | null
  ) => {
    // Get total students
    const totalStudents = studentsSnapshot?.exists() ? Object.keys(studentsSnapshot.val()).length : 0

    // Get active jobs
    const jobs = jobsSnapshot?.exists() ? Object.values(jobsSnapshot.val()) as any[] : []
    const activeJobs = jobs.filter(job => job.status === 'active').length

    // Get applications
    const applications = applicationsSnapshot?.exists() ? Object.values(applicationsSnapshot.val()) as any[] : []
    const totalApplications = applications.length
    const pendingApplications = applications.filter(app => app.status === 'pending').length

    // Calculate attendance rate (using last 7 days)
    let attendanceRate = 0
    if (attendanceSnapshot?.exists()) {
      const records = Object.values(attendanceSnapshot.val()) as any[]
      // Filter records for last 7 days
      const now = new Date()
      const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7))
      const recentRecords = records.filter(record => {
        const recordDate = new Date(record.date)
        return recordDate >= sevenDaysAgo
      })
      const totalPresent = recentRecords.filter(record => record.status === 'present').length
      const totalRecords = recentRecords.length
      attendanceRate = totalRecords > 0 ? (totalPresent / totalRecords) * 100 : 0
    }

    callback({
      totalStudents,
      activeJobs,
      totalApplications,
      pendingApplications,
      attendanceRate: Math.round(attendanceRate)
    })
  }

  // Set up listeners
  let studentsSnapshot: DataSnapshot | null = null
  let jobsSnapshot: DataSnapshot | null = null
  let applicationsSnapshot: DataSnapshot | null = null
  let attendanceSnapshot: DataSnapshot | null = null

  const studentsRef = ref(database, 'students')
  const jobsRef = ref(database, 'jobs')
  const applicationsRef = ref(database, 'applications')
  const attendanceRef = ref(database, 'attendance')

  const unsubscribeStudents = onValue(studentsRef, (snapshot) => {
    studentsSnapshot = snapshot
    calculateStats(studentsSnapshot, jobsSnapshot, applicationsSnapshot, attendanceSnapshot)
  })

  const unsubscribeJobs = onValue(jobsRef, (snapshot) => {
    jobsSnapshot = snapshot
    calculateStats(studentsSnapshot, jobsSnapshot, applicationsSnapshot, attendanceSnapshot)
  })

  const unsubscribeApplications = onValue(applicationsRef, (snapshot) => {
    applicationsSnapshot = snapshot
    calculateStats(studentsSnapshot, jobsSnapshot, applicationsSnapshot, attendanceSnapshot)
  })

  const unsubscribeAttendance = onValue(attendanceRef, (snapshot) => {
    attendanceSnapshot = snapshot
    calculateStats(studentsSnapshot, jobsSnapshot, applicationsSnapshot, attendanceSnapshot)
  })

  // Return cleanup function
  return () => {
    unsubscribeStudents()
    unsubscribeJobs()
    unsubscribeApplications()
    unsubscribeAttendance()
  }
}

export const subscribeToRecentActivities = (callback: (activities: RecentActivity[]) => void, limit: number = 4) => {
  const processActivities = (
    applicationsSnapshot: DataSnapshot | null,
    attendanceSnapshot: DataSnapshot | null
  ) => {
    const activities: RecentActivity[] = []

    // Process applications
    if (applicationsSnapshot?.exists()) {
      const applications = Object.entries(applicationsSnapshot.val())
        .map(([id, data]: [string, any]) => ({
          id,
          type: 'application' as const,
          message: `New application from ${data.studentName}`,
          time: new Date(data.createdAt).getTime(),
          displayTime: new Date(data.createdAt).toLocaleString(),
          status: data.status === 'pending' ? ('pending' as const) : ('info' as const)
        }))
        // Sort by time descending
        .sort((a, b) => b.time - a.time)
        // Take only the most recent ones
        .slice(0, limit)
        // Transform to final format
        .map(({ id, type, message, displayTime, status }) => ({
          id,
          type,
          message,
          time: displayTime,
          status
        }))
      
      activities.push(...applications)
    }

    // Process attendance records
    if (attendanceSnapshot?.exists()) {
      const attendance = Object.entries(attendanceSnapshot.val())
        .map(([id, data]: [string, any]) => ({
          id,
          type: 'attendance' as const,
          message: `${data.studentsPresent || 0} students checked in`,
          time: new Date(data.date).getTime(),
          displayTime: new Date(data.date).toLocaleString(),
          status: 'success' as const
        }))
        // Sort by time descending
        .sort((a, b) => b.time - a.time)
        // Take only the most recent ones
        .slice(0, limit)
        // Transform to final format
        .map(({ id, type, message, displayTime, status }) => ({
          id,
          type,
          message,
          time: displayTime,
          status
        }))
      
      activities.push(...attendance)
    }

    // Sort all activities by time and limit
    const sortedActivities = activities
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, limit)

    callback(sortedActivities)
  }

  // Set up listeners
  let applicationsSnapshot: DataSnapshot | null = null
  let attendanceSnapshot: DataSnapshot | null = null

  const applicationsRef = ref(database, 'applications')
  const attendanceRef = ref(database, 'attendance')

  const unsubscribeApplications = onValue(applicationsRef, (snapshot) => {
    applicationsSnapshot = snapshot
    processActivities(applicationsSnapshot, attendanceSnapshot)
  })

  const unsubscribeAttendance = onValue(attendanceRef, (snapshot) => {
    attendanceSnapshot = snapshot
    processActivities(applicationsSnapshot, attendanceSnapshot)
  })

  // Return cleanup function
  return () => {
    unsubscribeApplications()
    unsubscribeAttendance()
  }
}

export const subscribeToSystemStatus = (callback: (status: { database: string, authentication: string, qrScanner: string }) => void) => {
  const connectedRef = ref(database, '.info/connected')
  
  const unsubscribeConnected = onValue(connectedRef, (snapshot) => {
    const dbConnected = snapshot.val()
    
    callback({
      database: dbConnected ? 'operational' : 'down',
      authentication: 'operational', // Auth is working as confirmed
      qrScanner: 'operational'
    })
  })

  // Return cleanup function
  return () => {
    unsubscribeConnected()
  }
} 