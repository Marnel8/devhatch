"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, Eye, Upload, FileText, Loader2, X } from "lucide-react"
import Link from "next/link"
import { createJobPosting, updateJobPosting } from "@/lib/jobs-service"
import { showSuccessToast, showErrorToast, showLoadingToast } from "@/lib/toast-utils"
import type { JobPosting } from "@/types"

export default function CreateJobPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    project: "",
    description: "",
    requirements: "",
    responsibilities: "",
    qualifications: "",
    availableSlots: 1,
    isActive: true,
    location: "BatStateU Campus",
    duration: "240",
    workingHours: "8 hours/day",
    benefits: "",
    applicationDeadline: "",
  })

  const [attachedFile, setAttachedFile] = useState<File | null>(null)

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
    // Reset file input
    const fileInput = document.getElementById("file-upload") as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
      formData.append('jobId', jobId) // Use jobId instead of applicationId
      
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Validation
    if (!formData.title || !formData.project || !formData.description || !formData.requirements) {
      setError("Please fill in all required fields")
      setLoading(false)
      return
    }

    if (!user) {
      setError("You must be logged in to create a job posting")
      setLoading(false)
      return
    }

    try {
      showLoadingToast("Creating job posting...")

      // Prepare job data
      const jobData: Omit<JobPosting, "id"> = {
        title: formData.title,
        project: formData.project as "TRIOE" | "MR. MED" | "HAPTICS",
        description: formData.description,
        requirements: formData.requirements,
        responsibilities: formData.responsibilities || "",
        availableSlots: Number(formData.availableSlots),
        filledSlots: 0,
        isActive: formData.isActive,
        createdBy: user.id,
        createdAt: new Date().toISOString(),
      }

      // Create job posting in Firebase first to get the job ID
      const jobId = await createJobPosting(jobData)
      
      // Upload PDF attachment if one is selected
      if (attachedFile) {
        setIsUploading(true)
        showLoadingToast("Uploading PDF attachment...")
        
        try {
          const pdfUrl = await uploadJobAttachment(attachedFile, jobId)
          
          // Update the job posting with the PDF URL
          await updateJobPosting(jobId, { pdfUrl })
          
          console.log("PDF uploaded successfully:", pdfUrl)
          showSuccessToast("PDF attachment uploaded successfully!")
        } catch (uploadError: any) {
          console.error("PDF upload failed:", uploadError)
          showErrorToast("Job created but PDF upload failed: " + uploadError.message)
        } finally {
          setIsUploading(false)
        }
      }
      
      showSuccessToast("Job posting created successfully!")
      setSuccess(true)
      
      setTimeout(() => {
        router.push("/admin/jobs")
      }, 2000)
    } catch (error: any) {
      console.error("Error creating job:", error)
      setError(error.message || "Failed to create job posting. Please try again.")
      showErrorToast(error.message || "Failed to create job posting")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDraft = async () => {
    setLoading(true)
    try {
      // Simulate saving draft
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSuccess(true)
    } catch (error) {
      setError("Failed to save draft")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Save className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Job Posted Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Your job posting has been created and is now live. Students can start applying immediately.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/admin/jobs">
                <Button variant="outline">View All Jobs</Button>
              </Link>
              <Button onClick={() => window.location.reload()}>Create Another Job</Button>
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
        <Link href="/admin/jobs">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Create Job Posting</h1>
          <p className="text-gray-600 text-sm sm:text-base">Add a new OJT position for students to apply</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
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
                  <Select onValueChange={(value) => handleSelectChange("project", value)}>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (hours)</Label>
                    <Input
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      placeholder="240"
                    />
                  </div>
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
                  <Label htmlFor="qualifications">Educational Qualifications</Label>
                  <Textarea
                    id="qualifications"
                    name="qualifications"
                    value={formData.qualifications}
                    onChange={handleInputChange}
                    placeholder="Specify year level, course requirements, etc..."
                    rows={3}
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

            {/* Additional Details */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
                <CardDescription>Extra details about the position</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" name="location" value={formData.location} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workingHours">Working Hours</Label>
                    <Input
                      id="workingHours"
                      name="workingHours"
                      value={formData.workingHours}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="benefits">Benefits & Learning Opportunities</Label>
                  <Textarea
                    id="benefits"
                    name="benefits"
                    value={formData.benefits}
                    onChange={handleInputChange}
                    placeholder="What will students gain from this experience..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="applicationDeadline">Application Deadline</Label>
                  <Input
                    id="applicationDeadline"
                    name="applicationDeadline"
                    type="date"
                    value={formData.applicationDeadline}
                    onChange={handleInputChange}
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
                <CardTitle>Publishing</CardTitle>
                <CardDescription>Control when this job goes live</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="isActive">Publish immediately</Label>
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

            {/* File Attachment */}
            <Card>
              <CardHeader>
                <CardTitle>Attachments</CardTitle>
                <CardDescription>Optional job description PDF</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Upload PDF Attachment (Optional)
                  </Label>
                  
                  {!attachedFile ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <input 
                        type="file" 
                        accept=".pdf" 
                        onChange={handleFileChange} 
                        className="hidden" 
                        id="file-upload"
                        disabled={loading || isUploading}
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click to upload PDF</p>
                        <p className="text-xs text-gray-500 mt-1">Max 10MB • PDF format only</p>
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
                          disabled={loading || isUploading}
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
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Publish Job"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleSaveDraft}
                    disabled={loading}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save as Draft
                  </Button>
                  <Button type="button" variant="ghost" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
