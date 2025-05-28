"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ArrowLeft, 
  Edit,
  Users, 
  Calendar,
  MapPin,
  Briefcase,
  FileText,
  Target,
  CheckCircle,
  AlertCircle,
  Loader2,
  MoreHorizontal,
  Eye,
  EyeOff,
  Download,
  ExternalLink
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { JobPosting } from "@/types"
import { getJobPostingById, toggleJobStatus, deleteJobPosting, duplicateJobPosting } from "@/lib/jobs-service"
import { showSuccessToast, showErrorToast, showLoadingToast } from "@/lib/toast-utils"
import { getFileInfoFromURL } from "@/lib/file-service"

export default function JobDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string
  const [job, setJob] = useState<JobPosting | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load job details
  const loadJob = async () => {
    try {
      setError(null)
      const jobData = await getJobPostingById(jobId)
      if (!jobData) {
        setError("Job posting not found")
        return
      }
      setJob(jobData)
    } catch (error: any) {
      console.error("Error loading job:", error)
      setError(error.message || "Failed to load job details")
      showErrorToast("Failed to load job details")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (jobId) {
      loadJob()
    }
  }, [jobId])

  const handleToggleStatus = async () => {
    if (!job) return
    
    try {
      showLoadingToast(`${job.isActive ? 'Deactivating' : 'Activating'} job posting...`)
      await toggleJobStatus(job.id)
      await loadJob() // Refresh job data
      showSuccessToast(`Job posting ${job.isActive ? 'deactivated' : 'activated'} successfully!`)
    } catch (error: any) {
      showErrorToast(error.message || "Failed to update job status")
    }
  }

  const handleDelete = async () => {
    if (!job) return
    
    if (!confirm(`Are you sure you want to delete "${job.title}"? This action cannot be undone.`)) {
      return
    }
    
    try {
      showLoadingToast("Deleting job posting...")
      await deleteJobPosting(job.id)
      showSuccessToast("Job posting deleted successfully!")
      router.push("/admin/jobs")
    } catch (error: any) {
      showErrorToast(error.message || "Failed to delete job posting")
    }
  }

  const handleDuplicate = async () => {
    if (!job) return
    
    try {
      showLoadingToast("Duplicating job posting...")
      const newJobId = await duplicateJobPosting(job.id)
      showSuccessToast("Job posting duplicated successfully!")
      router.push(`/admin/jobs/${newJobId}/edit`)
    } catch (error: any) {
      showErrorToast(error.message || "Failed to duplicate job posting")
    }
  }

  const getProjectColor = (project: string) => {
    switch (project) {
      case "TRIOE":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "MR. MED":
        return "bg-purple-50 text-purple-700 border-purple-200"
      case "HAPTICS":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getProjectIcon = (project: string) => {
    switch (project) {
      case "TRIOE":
        return "⚡"
      case "MR. MED":
        return "🥽"
      case "HAPTICS":
        return "🤖"
      default:
        return "💼"
    }
  }

  const getStatusBadge = (job: JobPosting) => {
    if (!job.isActive) {
      return <Badge variant="secondary" className="flex items-center gap-1">
        <EyeOff className="w-3 h-3" />
        Inactive
      </Badge>
    }
    if (job.filledSlots >= job.availableSlots) {
      return <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        Full
      </Badge>
    }
    return <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
      <CheckCircle className="w-3 h-3" />
      Available
    </Badge>
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/jobs">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-gray-600">Loading job details...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !job) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/jobs">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            {error || "Job posting not found"}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/jobs">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{job.title}</h1>
            <p className="text-gray-600">Job Details & Management</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Link href={`/admin/jobs/${job.id}/edit`}>
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleToggleStatus}>
                {job.isActive ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>
                <FileText className="w-4 h-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <AlertCircle className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold">{job.title}</h2>
                    <Badge className={getProjectColor(job.project)}>
                      {getProjectIcon(job.project)} {job.project}
                    </Badge>
                    {getStatusBadge(job)}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      BatStateU Campus
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="w-4 h-4 mr-1" />
                      Internship
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {job.filledSlots}/{job.availableSlots} positions
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Created {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                About This Role
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {job.description}
              </p>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {job.requirements}
              </p>
            </CardContent>
          </Card>

          {/* Responsibilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Key Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {job.responsibilities}
              </p>
            </CardContent>
          </Card>

          {/* PDF Attachment */}
          {job.pdfUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Job Description Attachment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* File Info */}
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {getFileInfoFromURL(job.pdfUrl)?.name || "Job Description.pdf"}
                      </p>
                      <p className="text-xs text-gray-500">PDF Document</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(job.pdfUrl, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open in New Tab
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = job.pdfUrl!
                        link.download = getFileInfoFromURL(job.pdfUrl!)?.name || 'Job Description.pdf'
                        link.click()
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>

                {/* PDF Preview */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-700">PDF Preview</p>
                  </div>
                  <div className="relative h-[600px] bg-white">
                    <iframe
                      src={`${job.pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                      className="w-full h-full"
                      title="PDF Preview"
                      onError={(e) => {
                        const target = e.target as HTMLIFrameElement
                        target.style.display = 'none'
                        const fallback = target.nextElementSibling as HTMLDivElement
                        if (fallback) {
                          fallback.style.display = 'flex'
                        }
                      }}
                    />
                    {/* Fallback when iframe fails */}
                    <div className="absolute inset-0 bg-gray-50 flex-col items-center justify-center text-center p-6 hidden">
                      <FileText className="w-16 h-16 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        PDF Preview Not Available
                      </h3>
                      <p className="text-gray-600 mb-6 max-w-md">
                        Your browser blocked the PDF preview. You can still view or download the PDF using the buttons above.
                      </p>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => window.open(job.pdfUrl, '_blank')}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open in New Tab
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            const link = document.createElement('a')
                            link.href = job.pdfUrl!
                            link.download = getFileInfoFromURL(job.pdfUrl!)?.name || 'Job Description.pdf'
                            link.click()
                          }}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Position Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Available Slots</span>
                <span className="font-semibold">{job.availableSlots}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Filled Slots</span>
                <span className="font-semibold">{job.filledSlots}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Remaining</span>
                <span className="font-semibold text-green-600">
                  {job.availableSlots - job.filledSlots}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`font-semibold ${job.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                  {job.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Project Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About {job.project}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600 leading-relaxed">
                {job.project === "TRIOE" && (
                  <p>Advanced circuit board development and intelligent marketing automation systems. Pioneering the future of electronic design.</p>
                )}
                {job.project === "MR. MED" && (
                  <p>Immersive 3D and Mixed Reality solutions for next-generation medical training. Revolutionizing medical education through technology.</p>
                )}
                {job.project === "HAPTICS" && (
                  <p>Revolutionary haptic feedback systems and tactile interface technologies. Developing the next generation of touch-based interfaces.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">
              <div className="space-y-2">
                <p className="font-medium">BatStateU DevOps Office</p>
                <p>devops@g.batstate-u.edu.ph</p>
                <p>3rd Floor, SteerHub Building</p>
                <p>Batangas City, Philippines</p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleToggleStatus}
              >
                {job.isActive ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Deactivate Job
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Activate Job
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleDuplicate}
              >
                <FileText className="w-4 h-4 mr-2" />
                Duplicate Job
              </Button>
              <Link href={`/admin/jobs/${job.id}/edit`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Job
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 