"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MobileHeader } from "@/components/mobile-header"
import { CheckCircle, Upload, FileText } from "lucide-react"
import { database } from "../lib/firebase"
import { ref as dbRef, push, set, get } from "firebase/database"
import { JobPosting } from "../../types"

export default function ApplyPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    studentId: "",
    course: "",
    year: "",
    jobId: "",
    coverLetter: "",
  })
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [jobsLoading, setJobsLoading] = useState(true)

  const router = useRouter()
  const searchParams = useSearchParams()
  const jobId = searchParams.get("job")

  // Fetch available jobs on component mount
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobsRef = dbRef(database, "jobPostings")
        const snapshot = await get(jobsRef)
        
        if (snapshot.exists()) {
          const jobsData = Object.entries(snapshot.val()).map(([id, data]) => ({
            id,
            ...(data as Omit<JobPosting, "id">)
          }))
          
          // Filter for active jobs with available slots
          const availableJobs = jobsData.filter(job => 
            job.isActive && job.filledSlots < job.availableSlots
          )
          
          setJobs(availableJobs)
        }
      } catch (error) {
        console.error("Error fetching jobs:", error)
        setError("Failed to load available positions. Please refresh the page.")
      } finally {
        setJobsLoading(false)
      }
    }

    fetchJobs()
  }, [])

  // Set initial job selection if coming from URL parameter
  useEffect(() => {
    if (jobId && jobs.length > 0) {
      const selectedJob = jobs.find(job => job.id === jobId)
      if (selectedJob) {
        setFormData(prev => ({ ...prev, jobId: jobId }))
      }
    }
  }, [jobId, jobs])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setResumeFile(file)
      setError("")
    } else {
      setError("Please upload a PDF file for your resume")
    }
  }

  const uploadResumeFile = async (file: File, applicationId: string): Promise<string> => {
    try {
      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error("File size must be less than 10MB")
      }

      console.log("📤 Uploading resume to Cloudinary:", file.name)
      
      // Create form data for upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('applicationId', applicationId)
      
      // Upload to Cloudinary via API route
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Upload failed')
      }
      
      console.log("✅ Resume uploaded successfully:", result.url)
      return result.url
    } catch (error: any) {
      console.error("❌ Error uploading file:", error)
      
      // Provide specific error messages
      if (error.message?.includes('size')) {
        throw new Error("File size must be less than 10MB")
      } else if (error.message?.includes('PDF')) {
        throw new Error("Only PDF files are allowed")
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        throw new Error("Network error. Please check your connection and try again.")
      } else {
        throw new Error(`Upload failed: ${error.message || 'Unknown error occurred'}`)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate email domain for students
    if (formData.email && !formData.email.endsWith("@g.batstate-u.edu.ph")) {
      setError("Please use your official BatStateU email address (@g.batstate-u.edu.ph)")
      return
    }

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || 
        !formData.studentId || !formData.course || !formData.year || !formData.coverLetter) {
      setError("Please fill in all required fields")
      return
    }

    if (!resumeFile) {
      setError("Please upload your resume (PDF format)")
      return
    }

    if (!formData.jobId) {
      setError("Please select a preferred position")
      return
    }

    setLoading(true)

    try {
      // Create a new application reference in the database
      const applicationsRef = dbRef(database, 'applications')
      const newApplicationRef = push(applicationsRef)
      const applicationId = newApplicationRef.key

      if (!applicationId) {
        throw new Error("Failed to generate application ID")
      }

      // Upload resume file to Cloudinary
      const resumeURL = await uploadResumeFile(resumeFile, applicationId)

      // Get job details for reference
      const selectedJob = jobs.find(job => job.id === formData.jobId)
      const jobTitle = selectedJob ? selectedJob.title : "Unknown Position"
      const jobProject = selectedJob ? selectedJob.project : ""

      // Prepare application data
      const applicationData = {
        id: applicationId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        studentId: formData.studentId,
        course: formData.course,
        year: formData.year,
        jobId: formData.jobId,
        jobTitle: jobTitle,
        jobProject: jobProject,
        coverLetter: formData.coverLetter,
        resumeURL: resumeURL,
        resumeFileName: resumeFile.name,
        submittedAt: new Date().toISOString(),
        status: "pending" // pending, reviewed, accepted, rejected
      }

      // Save application data to Realtime Database
      await set(newApplicationRef, applicationData)

      console.log("Application submitted successfully with ID:", applicationId)
      setSubmitted(true)
    } catch (error) {
      console.error("Error submitting application:", error)
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("Failed to submit application. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  // Helper function to get project icon
  const getProjectIcon = (project: string) => {
    switch (project) {
      case "TRIOE":
        return "🔌"
      case "MR. MED":
        return "🥽"
      case "HAPTICS":
        return "🤖"
      default:
        return "��"
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileHeader showAuth={false} />
        <div className="flex items-center justify-center py-12 px-4">
          <Card className="max-w-md w-full">
            <CardContent className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold mb-2">Application Submitted!</h2>
              <p className="text-gray-600 mb-6 text-sm sm:text-base leading-relaxed">
                Thank you for your interest in joining DevHatch. We'll review your application and get back to you soon.
              </p>
              <div className="space-y-3">
                <Button variant="outline" className="w-full" onClick={() => router.push("/jobs")}>
                  Browse More Opportunities
                </Button>
                <Button className="w-full" onClick={() => router.push("/")}>
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader showAuth={false} />

      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Apply for OJT</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Fill out the form below to apply for an OJT position at DevHatch
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">OJT Application Form</CardTitle>
            <CardDescription>Complete all required fields to submit your application</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-medium border-b pb-2">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium">
                      First Name *
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="h-11"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">
                      Last Name *
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="h-11"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.name@g.batstate-u.edu.ph"
                    className="h-11"
                    required
                  />
                  <p className="text-xs text-slate-500">Please use your official BatStateU email address</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="h-11"
                    required
                  />
                </div>
              </div>

              {/* Academic Information */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-medium border-b pb-2">Academic Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="studentId" className="text-sm font-medium">
                    Student ID *
                  </Label>
                  <Input
                    id="studentId"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    className="h-11"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course" className="text-sm font-medium">
                    Course/Program *
                  </Label>
                  <Select onValueChange={(value) => handleSelectChange("course", value)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select your course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bsit">BS Information Technology</SelectItem>
                      <SelectItem value="bscs">BS Computer Science</SelectItem>
                      <SelectItem value="bsce">BS Computer Engineering</SelectItem>
                      <SelectItem value="bsee">BS Electrical Engineering</SelectItem>
                      <SelectItem value="bsme">BS Mechanical Engineering</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year" className="text-sm font-medium">
                    Year Level *
                  </Label>
                  <Select onValueChange={(value) => handleSelectChange("year", value)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select your year level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3rd">3rd Year</SelectItem>
                      <SelectItem value="4th">4th Year</SelectItem>
                      <SelectItem value="graduate">Graduate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Position Interest */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-medium border-b pb-2">Position Interest</h3>
                <div className="space-y-2">
                  <Label htmlFor="jobId" className="text-sm font-medium">
                    Preferred Position *
                  </Label>
                  {jobsLoading ? (
                    <div className="h-11 bg-gray-100 rounded-md flex items-center px-3 text-gray-500">
                      Loading available positions...
                    </div>
                  ) : (
                    <Select value={formData.jobId} onValueChange={(value) => handleSelectChange("jobId", value)}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select a position" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobs.length === 0 ? (
                          <SelectItem value="" disabled>
                            No positions available at the moment
                          </SelectItem>
                        ) : (
                          jobs.map((job) => (
                            <SelectItem key={job.id} value={job.id}>
                              <div className="flex items-center gap-2">
                                <span>{getProjectIcon(job.project)}</span>
                                <span>{job.title} - {job.project}</span>
                                <span className="text-xs text-gray-500">
                                  ({job.availableSlots - job.filledSlots} slots available)
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                  {!jobsLoading && jobs.length === 0 && (
                    <p className="text-xs text-amber-600">
                      No positions are currently available for applications. Please check back later.
                    </p>
                  )}
                  {formData.jobId && jobs.length > 0 && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      {(() => {
                        const selectedJob = jobs.find(job => job.id === formData.jobId)
                        if (!selectedJob) return null
                        
                        return (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getProjectIcon(selectedJob.project)}</span>
                              <span className="font-medium text-blue-900">{selectedJob.title}</span>
                              <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                                {selectedJob.project}
                              </span>
                            </div>
                            <p className="text-sm text-blue-700 leading-relaxed">
                              {selectedJob.description}
                            </p>
                            <div className="text-xs text-blue-600">
                              <strong>Available slots:</strong> {selectedJob.availableSlots - selectedJob.filledSlots} of {selectedJob.availableSlots}
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {/* Documents */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-medium border-b pb-2">Documents</h3>
                <div className="space-y-2">
                  <Label htmlFor="resume" className="text-sm font-medium">
                    Resume (PDF) *
                  </Label>
                  <div className="relative">
                    <Input id="resume" type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-11 justify-start"
                      onClick={() => document.getElementById("resume")?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {resumeFile ? resumeFile.name : "Choose PDF file"}
                    </Button>
                    {resumeFile && (
                      <div className="flex items-center mt-2 text-sm text-green-600">
                        <FileText className="w-4 h-4 mr-1" />
                        File selected: {resumeFile.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-medium border-b pb-2">Cover Letter</h3>
                <div className="space-y-2">
                  <Label htmlFor="coverLetter" className="text-sm font-medium">
                    Tell us why you're interested in this position *
                  </Label>
                  <Textarea
                    id="coverLetter"
                    name="coverLetter"
                    value={formData.coverLetter}
                    onChange={handleInputChange}
                    placeholder="Describe your interest, relevant experience, and what you hope to learn..."
                    rows={6}
                    className="resize-none"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                {loading ? "Submitting Application..." : "Submit Application"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
