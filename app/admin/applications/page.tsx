"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Download,
  Mail,
  User,
  Calendar,
  Briefcase,
  Video,
  Phone,
  MapPin,
  Star,
  MessageSquare,
  Loader2,
  Trash2,
  GraduationCap,
  ExternalLink,
} from "lucide-react"
import type { Application, JobPosting } from "@/types"
import { 
  getAllApplications, 
  updateApplicationStatus, 
  scheduleInterview, 
  getApplicationStatistics,
  deleteApplication 
} from "@/lib/applications-service"
import { getAllJobPostings } from "@/lib/jobs-service"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { PDFViewer } from "@/components/ui/pdf-viewer"
import { Checkbox } from "@/components/ui/checkbox"

export default function ApplicationsPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [projectFilter, setProjectFilter] = useState("all")
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [interviewDialogOpen, setInterviewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [resumePreviewOpen, setResumePreviewOpen] = useState(false)
  const [previewResumeUrl, setPreviewResumeUrl] = useState("")
  const [reviewAction, setReviewAction] = useState<"for_review" | "for_interview" | "hired" | "rejected" | null>(null)
  const [reviewNotes, setReviewNotes] = useState("")
  const [sendEmailNotification, setSendEmailNotification] = useState(true)
  
  // Data state
  const [applications, setApplications] = useState<Application[]>([])
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Interview form state
  const [interviewData, setInterviewData] = useState({
    date: "",
    time: "",
    location: "",
    type: "in_person" as "in_person" | "online" | "phone",
    notes: "",
    highlights: "",
    score: 0,
  })

  // Load data from Firebase
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [applicationsData, jobsData] = await Promise.all([
        getAllApplications(),
        getAllJobPostings()
      ])

      setApplications(applicationsData)
      setJobPostings(jobsData)
    } catch (err) {
      console.error("Error loading data:", err)
      setError("Failed to load applications data")
      toast.error("Failed to load applications data")
    } finally {
      setLoading(false)
    }
  }

  // Create job titles lookup from job postings
  const jobTitles = jobPostings.reduce((acc, job) => {
    acc[job.id] = `${job.title} - ${job.project}`
    return acc
  }, {} as Record<string, string>)

  const filteredApplications = applications.filter((app) => {
    const fullName = app.firstName && app.lastName ? `${app.firstName} ${app.lastName}` : (app.studentName || "")
    const email = app.email || app.studentEmail || ""
    
    const matchesSearch =
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.studentId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.course || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || app.status === statusFilter
    const jobTitle = jobTitles[app.jobId] || ""
    const matchesProject = projectFilter === "all" || jobTitle.includes(projectFilter)

    return matchesSearch && matchesStatus && matchesProject
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "for_review":
        return "bg-orange-100 text-orange-800"
      case "for_interview":
        return "bg-blue-100 text-blue-800"
      case "hired":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />
      case "for_review":
        return <FileText className="w-4 h-4" />
      case "for_interview":
        return <Video className="w-4 h-4" />
      case "hired":
        return <CheckCircle className="w-4 h-4" />
      case "rejected":
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const handleReviewApplication = (application: Application, action: "for_review" | "for_interview" | "hired" | "rejected") => {
    setSelectedApplication(application)
    setReviewAction(action)
    setReviewDialogOpen(true)
  }

  const confirmReview = async () => {
    if (!selectedApplication || !reviewAction || !user) return

    try {
      if (reviewAction === "for_interview") {
        // Schedule interview if date/time provided
        if (interviewData.date && interviewData.time) {
          try {
          await scheduleInterview(
            selectedApplication.id,
            {
              date: interviewData.date,
              time: interviewData.time,
              location: interviewData.location || "TBD",
              type: interviewData.type,
              notes: reviewNotes,
            },
            user.id,
            sendEmailNotification
          )
          } catch (error) {
            console.error("Interview scheduling error:", error)
            // Continue with the status update even if email fails
            await updateApplicationStatus(
              selectedApplication.id,
              reviewAction,
              user.id,
              reviewNotes,
              false // Don't try to send email again
            )
          }
        } else {
          await updateApplicationStatus(
            selectedApplication.id,
            reviewAction,
            user.id,
            reviewNotes,
            sendEmailNotification
          )
        }
      } else {
        try {
        await updateApplicationStatus(
          selectedApplication.id,
          reviewAction,
          user.id,
          reviewNotes,
          sendEmailNotification
        )
        } catch (error) {
          console.error("Status update error:", error)
          // Try updating without email if it failed
          if (error instanceof Error && error.message.includes("email")) {
            await updateApplicationStatus(
              selectedApplication.id,
              reviewAction,
              user.id,
              reviewNotes,
              false // Don't try to send email
            )
          } else {
            throw error // Re-throw if it's not an email error
          }
        }
      }

      // Refresh data to show updated status
      await loadData()
      
      const emailMessage = sendEmailNotification 
        ? " (email notification may have failed)" 
        : " (no email sent)"
      
      toast.success(
        reviewAction === "for_interview" 
          ? `Interview scheduled successfully${emailMessage}` 
          : `Application ${reviewAction === "hired" ? "approved" : "rejected"} successfully${emailMessage}`
      )

      setReviewDialogOpen(false)
      setSelectedApplication(null)
      setReviewAction(null)
      setReviewNotes("")
      setSendEmailNotification(true)
      setInterviewData({
        date: "",
        time: "",
        location: "",
        type: "in_person",
        notes: "",
        highlights: "",
        score: 0,
      })
    } catch (error) {
      console.error("Error in confirmReview:", error)
      toast.error("Failed to update application status. Please try again.")
    }
  }

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application)
    setReviewAction(null)
    setReviewDialogOpen(true)
  }

  const handleDeleteApplication = (application: Application) => {
    setSelectedApplication(application)
    setDeleteDialogOpen(true)
  }

  const handlePreviewResume = (resumeUrl: string) => {
    setPreviewResumeUrl(resumeUrl)
    setResumePreviewOpen(true)
  }

  const handlePreviewError = () => {
    console.error("Failed to load PDF preview - attempting fallback")
    // If iframe fails, open in new tab as fallback
    if (previewResumeUrl) {
      window.open(previewResumeUrl, '_blank')
      setResumePreviewOpen(false)
    }
  }

  const confirmDelete = async () => {
    if (!selectedApplication) return

    try {
      await deleteApplication(selectedApplication.id)
      
      // Refresh data to remove deleted application
      await loadData()
      
      toast.success("Application deleted successfully")
      setDeleteDialogOpen(false)
      setSelectedApplication(null)
    } catch (error) {
      console.error("Error deleting application:", error)
      toast.error("Failed to delete application")
    }
  }

  const stats = {
    total: applications.length,
    pending: applications.filter((app) => app.status === "pending").length,
    for_review: applications.filter((app) => app.status === "for_review").length,
    for_interview: applications.filter((app) => app.status === "for_interview").length,
    hired: applications.filter((app) => app.status === "hired").length,
    rejected: applications.filter((app) => app.status === "rejected").length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadData} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Application Management</h1>
          <p className="text-gray-600 text-sm sm:text-base">Review and manage student applications</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">For Review</p>
                <p className="text-2xl font-bold">{stats.for_review}</p>
              </div>
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">For Interview</p>
                <p className="text-2xl font-bold">{stats.for_interview}</p>
              </div>
              <Video className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hired</p>
                <p className="text-2xl font-bold">{stats.hired}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="for_review">For Review</SelectItem>
                <SelectItem value="for_interview">For Interview</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                <SelectItem value="TRIOE">TRIOE</SelectItem>
                <SelectItem value="MR. MED">MR. MED</SelectItem>
                <SelectItem value="HAPTICS">HAPTICS</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600 text-sm sm:text-base">
          Showing {filteredApplications.length} of {applications.length} applications
        </p>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
            {stats.pending} Pending
          </Badge>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.map((application) => {
          const fullName = application.firstName && application.lastName 
            ? `${application.firstName} ${application.lastName}` 
            : (application.studentName || "Unknown Student")
          const email = application.email || application.studentEmail || "No email provided"
          
          return (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{fullName}</h3>
                        <Badge className={getStatusColor(application.status)}>
                          {getStatusIcon(application.status)}
                          <span className="ml-1 capitalize">{application.status}</span>
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{email}</span>
                      </div>
                      {application.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>{application.phone}</span>
                        </div>
                      )}
                      {application.studentId && (
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>ID: {application.studentId}</span>
                        </div>
                      )}
                      {application.course && (
                        <div className="flex items-center text-sm text-gray-600">
                          <GraduationCap className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>{application.course}</span>
                        </div>
                      )}
                      {application.year && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>{application.year} Year</span>
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-600">
                        <Briefcase className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>Applied for: {application.jobTitle || jobTitles[application.jobId] || "Unknown Position"}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>Applied: {new Date(application.appliedAt || application.submittedAt || new Date()).toLocaleDateString()}</span>
                      </div>
                      {application.reviewedAt && (
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>Reviewed: {new Date(application.reviewedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{application.coverLetter}</p>
                  </div>

                  <div className="flex lg:flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 lg:flex-none"
                      onClick={() => handleViewApplication(application)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>

                    {(application.resumeUrl || application.resumeURL) && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 lg:flex-none"
                          onClick={() => handlePreviewResume(application.resumeUrl || application.resumeURL || "")}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </Button>
                    
                    )}

                    {application.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          className="flex-1 lg:flex-none bg-green-600 hover:bg-green-700"
                          onClick={() => handleReviewApplication(application, "for_interview")}
                        >
                          <Video className="w-4 h-4 mr-2" />
                          Schedule Interview
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 lg:flex-none text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                          onClick={() => handleReviewApplication(application, "rejected")}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}

                    {application.status === "for_interview" && (
                      <>
                        <Button
                          size="sm"
                          className="flex-1 lg:flex-none bg-green-600 hover:bg-green-700"
                          onClick={() => handleReviewApplication(application, "hired")}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Hire
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 lg:flex-none text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                          onClick={() => handleReviewApplication(application, "rejected")}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 lg:flex-none text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                      onClick={() => handleDeleteApplication(application)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredApplications.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== "all" || projectFilter !== "all"
                ? "Try adjusting your search criteria"
                : "No applications have been submitted yet"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {reviewAction
                ? `${reviewAction === "for_interview" 
                    ? "Schedule Interview" 
                    : reviewAction === "hired"
                    ? "Hire Applicant"
                    : "Reject"} Application`
                : "Application Details"}
            </DialogTitle>
            <DialogDescription>
              {selectedApplication && (
                <>
                  Application from {selectedApplication.studentName} for{" "}
                  {jobTitles[selectedApplication.jobId] || "Unknown Position"}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6 mt-4">
              {/* Student Information */}
              <div className="space-y-3">
                <h4 className="font-medium">Student Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <p className="font-medium">
                      {selectedApplication.firstName && selectedApplication.lastName 
                        ? `${selectedApplication.firstName} ${selectedApplication.lastName}` 
                        : (selectedApplication.studentName || "Unknown Student")}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="font-medium">
                      {selectedApplication.email || selectedApplication.studentEmail || "No email provided"}
                    </p>
                  </div>
                  {selectedApplication.phone && (
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <p className="font-medium">{selectedApplication.phone}</p>
                    </div>
                  )}
                  {selectedApplication.studentId && (
                    <div>
                      <span className="text-gray-600">Student ID:</span>
                      <p className="font-medium">{selectedApplication.studentId}</p>
                    </div>
                  )}
                  {selectedApplication.course && (
                    <div>
                      <span className="text-gray-600">Course:</span>
                      <p className="font-medium">{selectedApplication.course}</p>
                    </div>
                  )}
                  {selectedApplication.year && (
                    <div>
                      <span className="text-gray-600">Year Level:</span>
                      <p className="font-medium">{selectedApplication.year} Year</p>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">Applied:</span>
                    <p className="font-medium">
                      {new Date(selectedApplication.appliedAt || selectedApplication.submittedAt || new Date()).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <Badge className={getStatusColor(selectedApplication.status)}>
                      {getStatusIcon(selectedApplication.status)}
                      <span className="ml-1 capitalize">{selectedApplication.status}</span>
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              <div className="space-y-3">
                <h4 className="font-medium">Cover Letter</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedApplication.coverLetter}</p>
                </div>
              </div>

              {/* Resume */}
              {(selectedApplication.resumeUrl || selectedApplication.resumeURL) && (
                <div className="space-y-3">
                  <h4 className="font-medium">Resume</h4>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1 sm:flex-none"
                        onClick={() => handlePreviewResume(selectedApplication.resumeUrl || selectedApplication.resumeURL || "")}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview Resume
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 sm:flex-none"
                        onClick={() => window.open(selectedApplication.resumeUrl || selectedApplication.resumeURL, '_blank')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                        {selectedApplication.resumeFileName && (
                          <span className="ml-1 text-gray-500">({selectedApplication.resumeFileName})</span>
                        )}
                      </Button>
                    </div>
                    {selectedApplication.resumeFileName && (
                      <p className="text-sm text-gray-600">File: {selectedApplication.resumeFileName}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Interview Details Form for scheduling */}
              {reviewAction === "for_interview" && (
                <div className="space-y-4">
                  <h4 className="font-medium">Interview Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="interviewDate">Interview Date</Label>
                      <Input
                        id="interviewDate"
                        type="date"
                        value={interviewData.date}
                        onChange={(e) => setInterviewData(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="interviewTime">Interview Time</Label>
                      <Input
                        id="interviewTime"
                        type="time"
                        value={interviewData.time}
                        onChange={(e) => setInterviewData(prev => ({ ...prev, time: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="interviewType">Interview Type</Label>
                      <Select value={interviewData.type} onValueChange={(value: "in_person" | "online" | "phone") => 
                        setInterviewData(prev => ({ ...prev, type: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in_person">In Person</SelectItem>
                          <SelectItem value="online">Online</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="interviewLocation">Location</Label>
                      <Input
                        id="interviewLocation"
                        placeholder="Room/Meeting link"
                        value={interviewData.location}
                        onChange={(e) => setInterviewData(prev => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Review Notes (if reviewing) */}
              {reviewAction && (
                <div className="space-y-3">
                  <Label htmlFor="reviewNotes">
                    {reviewAction === "for_interview" 
                      ? "Interview Notes" 
                      : reviewAction === "hired"
                      ? "Hiring Notes"
                      : "Rejection Reason"}
                  </Label>
                  <Textarea
                    id="reviewNotes"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder={
                      reviewAction === "for_interview"
                        ? "Add interview notes..."
                        : reviewAction === "hired"
                        ? "Add any notes about the hire..."
                        : "Please provide a reason for rejection..."
                    }
                    rows={3}
                  />
                </div>
              )}

              {/* Email Notification Toggle */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sendEmailNotification"
                    checked={sendEmailNotification}
                    onCheckedChange={(checked) => setSendEmailNotification(checked === true)}
                  />
                  <Label htmlFor="sendEmailNotification">Send Email Notification</Label>
                </div>
                <p className="text-xs text-gray-500 ml-6">
                  {sendEmailNotification 
                    ? "The applicant will receive an email about this status change"
                    : "No email will be sent to the applicant"
                  }
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                  {reviewAction ? "Cancel" : "Close"}
                </Button>
                {reviewAction && (
                  <Button
                    onClick={confirmReview}
                    className={
                      reviewAction === "for_interview" 
                        ? "bg-green-600 hover:bg-green-700" 
                        : reviewAction === "hired"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                    }
                  >
                    {reviewAction === "for_interview" 
                      ? "Schedule Interview" 
                      : reviewAction === "hired"
                      ? "Confirm Hire"
                      : "Reject Application"}
                  </Button>
                )}
                {!reviewAction && selectedApplication.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        setReviewAction("for_interview")
                      }}
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Schedule Interview
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                      onClick={() => {
                        setReviewAction("rejected")
                      }}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}

                {!reviewAction && selectedApplication.status === "for_interview" && (
                  <div className="flex gap-2">
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        setReviewAction("hired")
                      }}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Hire
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                      onClick={() => {
                        setReviewAction("rejected")
                      }}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this application? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-4 mt-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium">{selectedApplication.studentName}</p>
                <p className="text-sm text-gray-600">{selectedApplication.studentEmail}</p>
                <p className="text-sm text-gray-600">
                  Applied for: {jobTitles[selectedApplication.jobId] || "Unknown Position"}
                </p>
                <p className="text-sm text-gray-600">
                  Status: <span className="capitalize">{selectedApplication.status}</span>
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Application
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Resume Preview Modal */}
      <Dialog open={resumePreviewOpen} onOpenChange={setResumePreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Resume Preview</DialogTitle>
            <DialogDescription>
              Preview of the submitted resume
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            {previewResumeUrl && (
              <PDFViewer 
                url={previewResumeUrl}
                filename={selectedApplication?.resumeFileName || "resume.pdf"}
                className="w-full h-[70vh]"
              />
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-600">
              <span>Need help? </span>
              <button 
                className="text-blue-600 hover:underline font-medium"
                onClick={() => {
                  // Create a download link
                  const link = document.createElement('a');
                  link.href = previewResumeUrl;
                  link.download = selectedApplication?.resumeFileName || 'resume.pdf';
                  link.target = '_blank';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                Download PDF
              </button>
              <span> or </span>
              <button 
                className="text-blue-600 hover:underline font-medium"
                onClick={() => window.open(previewResumeUrl, '_blank')}
              >
                open in new tab
              </button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setResumePreviewOpen(false)}>
                Close
              </Button>
              <Button
                onClick={() => window.open(previewResumeUrl, '_blank')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in New Tab
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
