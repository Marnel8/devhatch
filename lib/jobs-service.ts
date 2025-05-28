import { ref, push, set, get, update, remove, query, orderByChild, equalTo } from "firebase/database"
import { database } from "@/app/lib/firebase"
import type { JobPosting } from "@/types"

// Create a new job posting
export async function createJobPosting(jobData: Omit<JobPosting, "id">): Promise<string> {
  try {
    const jobsRef = ref(database, "jobPostings")
    const newJobRef = push(jobsRef)
    
    const jobWithId: JobPosting = {
      ...jobData,
      id: newJobRef.key!,
      createdAt: new Date().toISOString(),
    }
    
    await set(newJobRef, jobWithId)
    console.log("✅ Job posting created:", jobWithId.id)
    return jobWithId.id
  } catch (error) {
    console.error("❌ Error creating job posting:", error)
    throw new Error("Failed to create job posting")
  }
}

// Get all job postings
export async function getAllJobPostings(): Promise<JobPosting[]> {
  try {
    const jobsRef = ref(database, "jobPostings")
    const snapshot = await get(jobsRef)
    
    if (!snapshot.exists()) {
      return []
    }
    
    const jobsData = snapshot.val()
    const jobs: JobPosting[] = Object.values(jobsData)
    
    // Sort by creation date (newest first)
    jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    console.log("✅ Retrieved job postings:", jobs.length)
    return jobs
  } catch (error) {
    console.error("❌ Error fetching job postings:", error)
    throw new Error("Failed to fetch job postings")
  }
}

// Get a single job posting by ID
export async function getJobPostingById(id: string): Promise<JobPosting | null> {
  try {
    const jobRef = ref(database, `jobPostings/${id}`)
    const snapshot = await get(jobRef)
    
    if (!snapshot.exists()) {
      return null
    }
    
    const job = snapshot.val() as JobPosting
    console.log("✅ Retrieved job posting:", job.id)
    return job
  } catch (error) {
    console.error("❌ Error fetching job posting:", error)
    throw new Error("Failed to fetch job posting")
  }
}

// Update a job posting
export async function updateJobPosting(id: string, updates: Partial<JobPosting>): Promise<void> {
  try {
    const jobRef = ref(database, `jobPostings/${id}`)
    
    // Add updatedAt timestamp
    const updatesWithTimestamp = {
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    
    await update(jobRef, updatesWithTimestamp)
    console.log("✅ Job posting updated:", id)
  } catch (error) {
    console.error("❌ Error updating job posting:", error)
    throw new Error("Failed to update job posting")
  }
}

// Delete a job posting
export async function deleteJobPosting(id: string): Promise<void> {
  try {
    const jobRef = ref(database, `jobPostings/${id}`)
    await remove(jobRef)
    console.log("✅ Job posting deleted:", id)
  } catch (error) {
    console.error("❌ Error deleting job posting:", error)
    throw new Error("Failed to delete job posting")
  }
}

// Toggle job posting active status
export async function toggleJobStatus(id: string): Promise<void> {
  try {
    const jobRef = ref(database, `jobPostings/${id}`)
    const snapshot = await get(jobRef)
    
    if (!snapshot.exists()) {
      throw new Error("Job posting not found")
    }
    
    const job = snapshot.val() as JobPosting
    await update(jobRef, {
      isActive: !job.isActive,
      updatedAt: new Date().toISOString(),
    })
    
    console.log("✅ Job status toggled:", id, "Active:", !job.isActive)
  } catch (error) {
    console.error("❌ Error toggling job status:", error)
    throw new Error("Failed to toggle job status")
  }
}

// Get jobs by project
export async function getJobsByProject(project: string): Promise<JobPosting[]> {
  try {
    const jobsRef = ref(database, "jobPostings")
    const projectQuery = query(jobsRef, orderByChild("project"), equalTo(project))
    const snapshot = await get(projectQuery)
    
    if (!snapshot.exists()) {
      return []
    }
    
    const jobsData = snapshot.val()
    const jobs: JobPosting[] = Object.values(jobsData)
    
    // Sort by creation date (newest first)
    jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    console.log("✅ Retrieved jobs for project:", project, jobs.length)
    return jobs
  } catch (error) {
    console.error("❌ Error fetching jobs by project:", error)
    throw new Error("Failed to fetch jobs by project")
  }
}

// Get active job postings only
export async function getActiveJobPostings(): Promise<JobPosting[]> {
  try {
    const jobsRef = ref(database, "jobPostings")
    const activeQuery = query(jobsRef, orderByChild("isActive"), equalTo(true))
    const snapshot = await get(activeQuery)
    
    if (!snapshot.exists()) {
      return []
    }
    
    const jobsData = snapshot.val()
    const jobs: JobPosting[] = Object.values(jobsData)
    
    // Sort by creation date (newest first)
    jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    console.log("✅ Retrieved active job postings:", jobs.length)
    return jobs
  } catch (error) {
    console.error("❌ Error fetching active job postings:", error)
    throw new Error("Failed to fetch active job postings")
  }
}

// Duplicate a job posting
export async function duplicateJobPosting(id: string): Promise<string> {
  try {
    const originalJob = await getJobPostingById(id)
    if (!originalJob) {
      throw new Error("Original job posting not found")
    }
    
    // Create a copy with modified title and reset fields
    const duplicatedJob: Omit<JobPosting, "id"> = {
      ...originalJob,
      title: `${originalJob.title} (Copy)`,
      filledSlots: 0,
      isActive: false, // Start as inactive
      createdBy: originalJob.createdBy,
      // Remove timestamps to get new ones
    }
    
    // Remove id and timestamps from the duplicated job
    delete (duplicatedJob as any).id
    delete (duplicatedJob as any).createdAt
    delete (duplicatedJob as any).updatedAt
    
    const newJobId = await createJobPosting(duplicatedJob)
    console.log("✅ Job posting duplicated:", id, "->", newJobId)
    return newJobId
  } catch (error) {
    console.error("❌ Error duplicating job posting:", error)
    throw new Error("Failed to duplicate job posting")
  }
}

// Increment filled slots for a job posting
export async function incrementJobFilledSlots(jobId: string): Promise<void> {
  try {
    const jobRef = ref(database, `jobPostings/${jobId}`)
    const snapshot = await get(jobRef)
    
    if (!snapshot.exists()) {
      throw new Error("Job posting not found")
    }
    
    const job = snapshot.val() as JobPosting
    const newFilledSlots = job.filledSlots + 1
    
    // Ensure we don't exceed available slots
    if (newFilledSlots > job.availableSlots) {
      throw new Error("Cannot exceed available slots")
    }
    
    await update(jobRef, {
      filledSlots: newFilledSlots,
      updatedAt: new Date().toISOString(),
    })
    
    console.log("✅ Job filled slots incremented:", jobId, "New count:", newFilledSlots)
  } catch (error) {
    console.error("❌ Error incrementing job filled slots:", error)
    throw new Error("Failed to increment job filled slots")
  }
}

// Decrement filled slots for a job posting
export async function decrementJobFilledSlots(jobId: string): Promise<void> {
  try {
    const jobRef = ref(database, `jobPostings/${jobId}`)
    const snapshot = await get(jobRef)
    
    if (!snapshot.exists()) {
      throw new Error("Job posting not found")
    }
    
    const job = snapshot.val() as JobPosting
    const newFilledSlots = Math.max(0, job.filledSlots - 1)
    
    await update(jobRef, {
      filledSlots: newFilledSlots,
      updatedAt: new Date().toISOString(),
    })
    
    console.log("✅ Job filled slots decremented:", jobId, "New count:", newFilledSlots)
  } catch (error) {
    console.error("❌ Error decrementing job filled slots:", error)
    throw new Error("Failed to decrement job filled slots")
  }
}

// Get job statistics
export async function getJobStatistics() {
  try {
    const jobs = await getAllJobPostings()
    
    const stats = {
      total: jobs.length,
      active: jobs.filter(job => job.isActive).length,
      inactive: jobs.filter(job => !job.isActive).length,
      full: jobs.filter(job => job.filledSlots >= job.availableSlots).length,
      available: jobs.filter(job => job.filledSlots < job.availableSlots && job.isActive).length,
      totalSlots: jobs.reduce((sum, job) => sum + job.availableSlots, 0),
      filledSlots: jobs.reduce((sum, job) => sum + job.filledSlots, 0),
      byProject: {
        TRIOE: jobs.filter(job => job.project === "TRIOE").length,
        "MR. MED": jobs.filter(job => job.project === "MR. MED").length,
        HAPTICS: jobs.filter(job => job.project === "HAPTICS").length,
      }
    }
    
    console.log("✅ Job statistics calculated:", stats)
    return stats
  } catch (error) {
    console.error("❌ Error calculating job statistics:", error)
    throw new Error("Failed to calculate job statistics")
  }
} 