"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MobileHeader } from "@/components/mobile-header"
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Users, 
  Briefcase, 
  Calendar,
  FileText,
  Target,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Download
} from "lucide-react"
import type { JobPosting } from "@/types"
import { ref, get } from "firebase/database"
import { database } from "@/app/lib/firebase"

export default function JobDetailsPage() {
  const params = useParams()
  const jobId = params.id as string
  const [job, setJob] = useState<JobPosting | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const jobRef = ref(database, `jobPostings/${jobId}`)
        const snapshot = await get(jobRef)
        
        if (!snapshot.exists()) {
          setJob(null)
          setError("Job not found")
          return
        }
        
        const jobData = snapshot.val()
        setJob(jobData)
      } catch (error: any) {
        console.error("Error fetching job:", error)
        setError(error.message || "Failed to fetch job details")
      } finally {
        setLoading(false)
      }
    }

    fetchJob()
  }, [jobId])

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileHeader showAuth={true} />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h1>
            <p className="text-gray-600 mb-6">{error || "The job posting you're looking for doesn't exist or has been removed."}</p>
            <Link href="/jobs">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Jobs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const slotsAvailable = job.availableSlots - job.filledSlots

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <MobileHeader showAuth={true} />

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link href="/jobs">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Opportunities
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Header */}
            <Card className="border-0 shadow-xl">
              <CardHeader className="pb-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getProjectIcon(job.project)}</div>
                    <Badge className={`${getProjectColor(job.project)} border font-medium px-3 py-1`}>
                      {job.project}
                    </Badge>
                  </div>
                  <div className="text-right">
                    {slotsAvailable > 0 ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                        {slotsAvailable} slot{slotsAvailable !== 1 ? 's' : ''} available
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 border-red-200">
                        Positions filled
                      </Badge>
                    )}
                  </div>
                </div>
                
                <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                  {job.title}
                </CardTitle>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-4">
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
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Job Description */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  About This Role
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed text-base">
                  {job.description}
                </p>
              </CardContent>
            </Card>

            {/* Key Responsibilities */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Key Responsibilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(job.responsibilities?.split('. ') || []).filter(resp => resp.trim()).map((responsibility, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700 leading-relaxed">
                        {responsibility.trim()}{responsibility.endsWith('.') ? '' : '.'}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Requirements & Qualifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {job.requirements.split('. ').filter(req => req.trim()).map((requirement, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2.5 flex-shrink-0"></div>
                      <p className="text-gray-700 leading-relaxed">
                        {requirement.trim()}{requirement.endsWith('.') ? '' : '.'}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Job Description Attachment */}
            {job.pdfUrl && (
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Additional Information
                  </CardTitle>
                  <CardDescription>
                    Detailed job description and requirements document
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* File Info */}
                  <div className="flex items-center flex-col md:flex-row gap-4 md:gap-0 justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-blue-900">
                          Job Description Document
                        </p>
                        <p className="text-xs text-blue-700">PDF Document • View for complete details</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => window.open(job.pdfUrl, '_blank')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement('a')
                          link.href = job.pdfUrl!
                          link.download = 'Job-Description.pdf'
                          link.click()
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>

                  {/* PDF Preview */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-700">Document Preview</p>
                        <p className="text-xs text-gray-500">Full details in PDF</p>
                      </div>
                    </div>
                    <div className="relative h-[700px] sm:h-[600px]">
                      <iframe
                        src={`${job.pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH&zoom=page-width`}
                        className="w-full h-full"
                        title="Job Description PDF"
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
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-slate-50 flex-col items-center justify-center text-center p-6 hidden">
                        <FileText className="w-16 h-16 text-blue-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Document Preview Unavailable
                        </h3>
                        <p className="text-gray-600 mb-6 max-w-md">
                          Your browser cannot display the PDF preview. Click the buttons below to view or download the complete job description.
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
                              link.download = 'Job-Description.pdf'
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
            {/* Application Card */}
            <Card className="border-0 shadow-xl top-6">
              <CardHeader>
                <CardTitle className="text-xl">Ready to Apply?</CardTitle>
                <CardDescription>
                  Join our innovative team and start your career journey with us.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {slotsAvailable > 0 ? (
                  <>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <span className="font-medium text-emerald-800">Position Available</span>
                      </div>
                      <p className="text-sm text-emerald-700">
                        {slotsAvailable} slot{slotsAvailable !== 1 ? 's' : ''} remaining out of {job.availableSlots}
                      </p>
                    </div>
                    
                    <Link href={`/apply?job=${job.id}`} className="block">
                      <Button className="w-full h-12 text-lg font-semibold">
                        Apply Now
                        <ExternalLink className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                  </>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="font-medium text-red-800">Positions Filled</span>
                    </div>
                    <p className="text-sm text-red-700">
                      All {job.availableSlots} position{job.availableSlots !== 1 ? 's have' : ' has'} been filled for this role.
                    </p>
                  </div>
                )}

                <Separator />

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Project:</span>
                    <span className="font-medium">{job.project}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">OJT Internship</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">240 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">BatStateU Campus</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Info */}
            <Card className="border-0 shadow-lg">
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
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Questions?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                <p className="mb-3">
                  Have questions about this position? Feel free to reach out to our team.
                </p>
                <div className="space-y-2">
                  <p className="font-medium">BatStateU DevOps Office</p>
                  <p>devops@g.batstate-u.edu.ph</p>
                  <p>3rd Floor, SteerHub Building</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 