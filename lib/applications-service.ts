import { ref, push, set, get, update, remove, query, orderByChild, equalTo } from "firebase/database"
import { database } from "@/app/lib/firebase"
import type { Application } from "@/types"
import { emailService, type EmailNotificationData } from "./email-service"
import { getAllJobPostings, incrementJobFilledSlots, decrementJobFilledSlots } from "./jobs-service"

// Create a new application
export async function createApplication(applicationData: Omit<Application, "id">): Promise<string> {
  try {
    const applicationsRef = ref(database, "applications")
    const newApplicationRef = push(applicationsRef)
    
    const applicationWithId: Application = {
      ...applicationData,
      id: newApplicationRef.key!,
      appliedAt: new Date().toISOString(),
    }
    
    await set(newApplicationRef, applicationWithId)
    console.log("✅ Application created:", applicationWithId.id)
    return applicationWithId.id
  } catch (error) {
    console.error("❌ Error creating application:", error)
    throw new Error("Failed to create application")
  }
}

// Get all applications
export async function getAllApplications(): Promise<Application[]> {
  try {
    const applicationsRef = ref(database, "applications")
    const snapshot = await get(applicationsRef)
    
    if (!snapshot.exists()) {
      console.log("ℹ️ No applications found")
      return []
    }
    
    const applicationsData = snapshot.val()
    const applications: Application[] = Object.values(applicationsData)
    
    console.log(`✅ Retrieved ${applications.length} applications`)
    return applications.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
  } catch (error) {
    console.error("❌ Error fetching applications:", error)
    throw new Error("Failed to fetch applications")
  }
}

// Get a single application by ID
export async function getApplicationById(id: string): Promise<Application | null> {
  try {
    const applicationRef = ref(database, `applications/${id}`)
    const snapshot = await get(applicationRef)
    
    if (!snapshot.exists()) {
      return null
    }
    
    const application = snapshot.val() as Application
    console.log("✅ Retrieved application:", application.id)
    return application
  } catch (error) {
    console.error("❌ Error fetching application:", error)
    throw new Error("Failed to fetch application")
  }
}

// Update an application
export async function updateApplication(id: string, updates: Partial<Application>): Promise<void> {
  try {
    const applicationRef = ref(database, `applications/${id}`)
    
    // Add updatedAt timestamp for updates
    const updatesWithTimestamp = {
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    
    await update(applicationRef, updatesWithTimestamp)
    console.log("✅ Application updated:", id)
  } catch (error) {
    console.error("❌ Error updating application:", error)
    throw new Error("Failed to update application")
  }
}

// Delete an application
export async function deleteApplication(id: string): Promise<void> {
  try {
    // Get the application before deleting to check if it was hired
    const application = await getApplicationById(id)
    if (application && application.status === "hired") {
      try {
        await decrementJobFilledSlots(application.jobId)
        console.log(`✅ Decremented filled slots for job ${application.jobId} - hired application deleted`)
      } catch (slotError) {
        console.error(`⚠️ Failed to update job slots when deleting hired application ${id}:`, slotError)
        // Don't throw the error - deletion should proceed even if slot update fails
      }
    }

    const applicationRef = ref(database, `applications/${id}`)
    await remove(applicationRef)
    console.log("✅ Application deleted:", id)
  } catch (error) {
    console.error("❌ Error deleting application:", error)
    throw new Error("Failed to delete application")
  }
}

// Get applications by job ID
export async function getApplicationsByJobId(jobId: string): Promise<Application[]> {
  try {
    const applicationsRef = ref(database, "applications")
    const jobApplicationsQuery = query(applicationsRef, orderByChild("jobId"), equalTo(jobId))
    const snapshot = await get(jobApplicationsQuery)
    
    if (!snapshot.exists()) {
      return []
    }
    
    const applicationsData = snapshot.val()
    const applications: Application[] = Object.values(applicationsData)
    
    console.log(`✅ Retrieved ${applications.length} applications for job ${jobId}`)
    return applications.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
  } catch (error) {
    console.error("❌ Error fetching applications by job ID:", error)
    throw new Error("Failed to fetch applications")
  }
}

// Get applications by student ID
export async function getApplicationsByStudentId(studentId: string): Promise<Application[]> {
  try {
    const applicationsRef = ref(database, "applications")
    const studentApplicationsQuery = query(applicationsRef, orderByChild("studentId"), equalTo(studentId))
    const snapshot = await get(studentApplicationsQuery)
    
    if (!snapshot.exists()) {
      return []
    }
    
    const applicationsData = snapshot.val()
    const applications: Application[] = Object.values(applicationsData)
    
    console.log(`✅ Retrieved ${applications.length} applications for student ${studentId}`)
    return applications.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
  } catch (error) {
    console.error("❌ Error fetching applications by student ID:", error)
    throw new Error("Failed to fetch applications")
  }
}

// Get applications by status
export async function getApplicationsByStatus(status: Application["status"]): Promise<Application[]> {
  try {
    const applicationsRef = ref(database, "applications")
    const statusApplicationsQuery = query(applicationsRef, orderByChild("status"), equalTo(status))
    const snapshot = await get(statusApplicationsQuery)
    
    if (!snapshot.exists()) {
      return []
    }
    
    const applicationsData = snapshot.val()
    const applications: Application[] = Object.values(applicationsData)
    
    console.log(`✅ Retrieved ${applications.length} applications with status ${status}`)
    return applications.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
  } catch (error) {
    console.error("❌ Error fetching applications by status:", error)
    throw new Error("Failed to fetch applications")
  }
}

// Update application status with notification
export async function updateApplicationStatus(
  id: string,
  status: Application["status"],
  reviewedBy?: string,
  notes?: string,
  sendNotification: boolean = true
): Promise<void> {
  try {
    // Get current application to check for status changes
    const currentApplication = await getApplicationById(id)
    if (!currentApplication) {
      throw new Error("Application not found")
    }

    const updates: Partial<Application> = {
      status,
      reviewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    if (reviewedBy) {
      updates.reviewedBy = reviewedBy
    }
    
    if (notes) {
      // Store notes based on status
      if (status === "rejected") {
        updates.rejectionReason = notes
      } else {
        updates.reviewNotes = notes
      }
    }

    await updateApplication(id, updates)

    // Handle job slot updates based on status change
    const previousStatus = currentApplication.status
    const newStatus = status

    try {
      // If changing TO hired status, increment filled slots
      if (newStatus === "hired" && previousStatus !== "hired") {
        await incrementJobFilledSlots(currentApplication.jobId)
        console.log(`✅ Incremented filled slots for job ${currentApplication.jobId} - candidate hired`)
      }
      // If changing FROM hired status, decrement filled slots
      else if (previousStatus === "hired" && newStatus !== "hired") {
        await decrementJobFilledSlots(currentApplication.jobId)
        console.log(`✅ Decremented filled slots for job ${currentApplication.jobId} - candidate status changed from hired`)
      }
    } catch (slotError) {
      console.error(`⚠️ Failed to update job slots for application ${id}:`, slotError)
      // Don't throw the error - status update should succeed even if slot update fails
      // This ensures the application status is still updated for tracking purposes
    }
    
    // Send email notification if requested
    if (sendNotification) {
      try {
        // Get the updated application data
        const application = await getApplicationById(id)
        if (application) {
          // Get job posting details for email
          const jobPostings = await getAllJobPostings()
          const jobPosting = jobPostings.find(job => job.id === application.jobId)
          
          const emailData: EmailNotificationData = {
            application: { ...application, ...updates },
            jobPosting,
            adminName: reviewedBy || 'DevHatch Team',
            rejectionReason: notes
          }
          
          await emailService.sendApplicationStatusUpdate(emailData)
          console.log(`✅ Email notification sent for application ${id} status change to ${status}`)
        }
      } catch (emailError) {
        console.error(`⚠️ Failed to send email notification for application ${id}:`, emailError)
        // Don't throw the error - status update should succeed even if email fails
      }
    }
    
    console.log("✅ Application status updated:", id)
  } catch (error) {
    console.error("❌ Error updating application status:", error)
    throw new Error("Failed to update application status")
  }
}

// Schedule interview for application with notification
export async function scheduleInterview(
  id: string,
  interviewData: {
    date: string
    time: string
    location: string
    type: "in_person" | "online" | "phone"
    notes?: string
  },
  scheduledBy?: string,
  sendNotification: boolean = true
): Promise<void> {
  try {
    const updates: Partial<Application> = {
      status: "for_interview",
      interviewDate: interviewData.date,
      interviewTime: interviewData.time,
      interviewLocation: interviewData.location,
      interviewType: interviewData.type,
      interviewScheduledAt: new Date().toISOString(),
      reviewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    if (interviewData.notes) {
      updates.interviewNotes = interviewData.notes
    }
    
    if (scheduledBy) {
      updates.reviewedBy = scheduledBy
    }
    
    await updateApplication(id, updates)
    
    // Send email notification if requested
    if (sendNotification) {
      try {
        // Get the updated application data
        const application = await getApplicationById(id)
        if (application) {
          // Get job posting details for email
          const jobPostings = await getAllJobPostings()
          const jobPosting = jobPostings.find(job => job.id === application.jobId)
          
          const emailData: EmailNotificationData = {
            application: { ...application, ...updates },
            jobPosting,
            adminName: scheduledBy || 'DevHatch Team',
            interviewDetails: {
              date: interviewData.date,
              time: interviewData.time,
              location: interviewData.location,
              type: interviewData.type
            }
          }
          
          await emailService.sendApplicationStatusUpdate(emailData)
          console.log(`✅ Interview notification email sent for application ${id}`)
        }
      } catch (emailError) {
        console.error(`⚠️ Failed to send interview notification email for application ${id}:`, emailError)
        // Don't throw the error - interview scheduling should succeed even if email fails
      }
    }
    
    console.log("✅ Interview scheduled for application:", id)
  } catch (error) {
    console.error("❌ Error scheduling interview:", error)
    throw new Error("Failed to schedule interview")
  }
}

// Get application statistics
export async function getApplicationStatistics(): Promise<{
  total: number
  pending: number
  for_review: number
  for_interview: number
  hired: number
  rejected: number
}> {
  try {
    const applications = await getAllApplications()
    
    const stats = {
      total: applications.length,
      pending: applications.filter(app => app.status === "pending").length,
      for_review: applications.filter(app => app.status === "for_review").length,
      for_interview: applications.filter(app => app.status === "for_interview").length,
      hired: applications.filter(app => app.status === "hired").length,
      rejected: applications.filter(app => app.status === "rejected").length,
    }
    
    console.log("✅ Application statistics calculated:", stats)
    return stats
  } catch (error) {
    console.error("❌ Error calculating application statistics:", error)
    throw new Error("Failed to calculate application statistics")
  }
} 