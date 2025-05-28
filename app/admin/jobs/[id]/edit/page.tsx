"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, Loader2, AlertCircle, FileText, Eye, Download, Upload, X } from "lucide-react"
import Link from "next/link"
import { getJobPostingById, updateJobPosting } from "@/lib/jobs-service"
import { showSuccessToast, showErrorToast, showLoadingToast } from "@/lib/toast-utils"
import type { JobPosting } from "@/types"

export default function EditJobPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const jobId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [originalJob, setOriginalJob] = useState<JobPosting | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    project: "",
    description: "",
    requirements: "",
    responsibilities: "",
    availableSlots: 1,
    isActive: true,
  })

  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string>("")

  // Load job data
  useEffect(() => {
    const loadJob = async () => {
      try {
        setError("")
        const job = await getJobPostingById(jobId)
        if (!job) {
          setError("Job posting not found")
          return
        }
        
        setOriginalJob(job)
        setCurrentPdfUrl(job.pdfUrl || "")
        setFormData({
          title: job.title,
          project: job.project,
          description: job.description,
          requirements: job.requirements,
          responsibilities: job.responsibilities || "",
          availableSlots: job.availableSlots,
          isActive: job.isActive,
        })
      } catch (error: any) {
        console.error("Error loading job:", error)
        setError(error.message || "Failed to load job details")
        showErrorToast("Failed to load job details")
      } finally {
        setLoading(false)
      }
    }

    if (jobId) {
      loadJob()
    }
  }, [jobId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        setError("File size must be less than 10MB")
        return
      }
      setAttachedFile(file)
      setError("")
    } else {
      setError("Please upload a PDF file")
    }
  }

  const removeAttachedFile = () => {
    setAttachedFile(null)
    const fileInput = document.getElementById('file-upload') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileInfoFromURL = (url: string) => {
    try {
      const urlParts = url.split('/')
      const filename = urlParts[urlParts.length - 1]
      const nameWithoutQuery = filename.split('?')[0]
      return { name: nameWithoutQuery }
    } catch {
      return { name: "attachment.pdf" }
    }
  }

  const uploadJobAttachment = async (file: File, jobId: string): Promise<string> => {
    try {
      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        throw new Error("File size must be less than 10MB")
      }

      console.log("📤 Uploading job attachment to Cloudinary:", file.name)
      
      // Create form data for upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('jobId', jobId)
      
      // Upload to Cloudinary via API route
      const response = await fetch('/api/upload-job-attachment', {
        method: 'POST',
        body: formData,
      })
      
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Upload failed')
      }
      
      console.log("✅ Job attachment uploaded successfully:", result.url)
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

  const removeCurrentPdf = async () => {
    if (!currentPdfUrl || !originalJob) return
    
    try {
      showLoadingToast("Removing PDF attachment...")
      
      // Update job posting to remove PDF URL
      await updateJobPosting(jobId, { pdfUrl: "" })
      
      setCurrentPdfUrl("")
      showSuccessToast("PDF attachment removed successfully!")
    } catch (error: any) {
      showErrorToast("Failed to remove PDF attachment: " + error.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSaving(true)

    // Validation
    if (!formData.title || !formData.project || !formData.description || !formData.requirements) {
      setError("Please fill in all required fields")
      setSaving(false)
      return
    }

    if (!user || !originalJob) {
      setError("Unable to update job posting")
      setSaving(false)
      return
    }

    try {
      showLoadingToast("Updating job posting...")

      // Prepare update data
      const updateData: Partial<JobPosting> = {
        title: formData.title,
        project: formData.project as "TRIOE" | "MR. MED" | "HAPTICS",
        description: formData.description,
        requirements: formData.requirements,
        responsibilities: formData.responsibilities,
        availableSlots: Number(formData.availableSlots),
        isActive: formData.isActive,
      }

      // Handle PDF upload if new file is attached
      if (attachedFile) {
        setIsUploading(true)
        showLoadingToast("Uploading new PDF attachment...")
        
        try {
          // Upload new PDF to Cloudinary
          const newPdfUrl = await uploadJobAttachment(attachedFile, jobId)
          updateData.pdfUrl = newPdfUrl
          
          showSuccessToast("PDF uploaded successfully!")
        } catch (uploadError: any) {
          console.error("PDF upload failed:", uploadError)
          showErrorToast("Job updated but PDF upload failed: " + uploadError.message)
        } finally {
          setIsUploading(false)
        }
      }

      // Update job posting in Firebase
      await updateJobPosting(jobId, updateData)
      
      showSuccessToast("Job posting updated successfully!")
      setSuccess(true)
      
      setTimeout(() => {
        router.push(`/admin/jobs/${jobId}`)
      }, 2000)
    } catch (error: any) {
      console.error("Error updating job:", error)
      setError(error.message || "Failed to update job posting. Please try again.")
      showErrorToast(error.message || "Failed to update job posting")
    } finally {
      setSaving(false)
      setIsUploading(false)
    }
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
  if (error && !originalJob) {
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
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Save className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Job Updated Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Your changes have been saved and the job posting has been updated.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href={`/admin/jobs/${jobId}`}>
                <Button variant="outline">View Job</Button>
              </Link>
              <Link href="/admin/jobs">
                <Button>Back to Jobs</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/admin/jobs/${jobId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Job
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Edit Job Posting</h1>
          <p className="text-gray-600 text-sm sm:text-base">Update the details for "{originalJob?.title}"</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Essential details about the position</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Frontend Developer Intern"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project">Project *</Label>
                  <Select value={formData.project} onValueChange={(value) => handleSelectChange("project", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TRIOE">TRIOE</SelectItem>
                      <SelectItem value="MR. MED">MR. MED</SelectItem>
                      <SelectItem value="HAPTICS">HAPTICS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availableSlots">Available Positions *</Label>
                  <Input
                    id="availableSlots"
                    name="availableSlots"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.availableSlots}
                    onChange={handleInputChange}
                    required
                  />
                  {originalJob && (
                    <p className="text-sm text-gray-600">
                      Currently {originalJob.filledSlots} positions are filled
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe what the intern will be working on..."
                    rows={4}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Detailed Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Requirements & Qualifications</CardTitle>
                <CardDescription>Skills and qualifications needed for this position</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="requirements">Technical Requirements *</Label>
                  <Textarea
                    id="requirements"
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    placeholder="List the technical skills and tools required..."
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsibilities">Key Responsibilities</Label>
                  <Textarea
                    id="responsibilities"
                    name="responsibilities"
                    value={formData.responsibilities}
                    onChange={handleInputChange}
                    placeholder="What will the intern be responsible for..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publishing Options */}
            <Card>
              <CardHeader>
                <CardTitle>Publishing Status</CardTitle>
                <CardDescription>Control job visibility</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="isActive">Active Status</Label>
                    <p className="text-sm text-gray-600">Make this job visible to students</p>
                  </div>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleSwitchChange("isActive", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Job Stats */}
            {originalJob && (
              <Card>
                <CardHeader>
                  <CardTitle>Current Statistics</CardTitle>
                  <CardDescription>Job posting metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Filled Positions</span>
                    <span className="font-semibold">{originalJob.filledSlots}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Available Positions</span>
                    <span className="font-semibold">{originalJob.availableSlots}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Created</span>
                    <span className="font-semibold text-sm">
                      {new Date(originalJob.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className={`font-semibold text-sm ${originalJob.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                      {originalJob.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* PDF Attachment Management */}
            <Card>
              <CardHeader>
                <CardTitle>PDF Attachment</CardTitle>
                <CardDescription>Manage job description PDF</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current PDF */}
                {currentPdfUrl && (
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-medium">Current PDF</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeCurrentPdf}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      {getFileInfoFromURL(currentPdfUrl)?.name || "attachment.pdf"}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(currentPdfUrl, '_blank')}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement('a')
                          link.href = currentPdfUrl
                          link.download = getFileInfoFromURL(currentPdfUrl)?.name || "attachment.pdf"
                          link.click()
                        }}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                )}

                {/* Upload New PDF */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    {currentPdfUrl ? "Replace PDF" : "Upload PDF"}
                  </Label>
                  
                  {!attachedFile ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <input 
                        type="file" 
                        accept=".pdf" 
                        onChange={handleFileChange} 
                        className="hidden" 
                        id="file-upload"
                        disabled={saving || isUploading}
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                        <p className="text-xs text-gray-600">Click to upload PDF</p>
                      </label>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-red-500" />
                          <div>
                            <p className="text-sm font-medium">{attachedFile.name}</p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(attachedFile.size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={removeAttachedFile}
                          disabled={saving || isUploading}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {isUploading && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Uploading...
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500">
                    Max 10MB • PDF format only
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button type="submit" className="w-full" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Update Job
                      </>
                    )}
                  </Button>
                  <Link href={`/admin/jobs/${jobId}`} className="block">
                    <Button type="button" variant="outline" className="w-full">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
} 