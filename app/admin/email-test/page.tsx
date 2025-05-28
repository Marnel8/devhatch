"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Mail, Send, Eye, Loader2 } from "lucide-react"
import { emailService } from "@/lib/email-service"
import type { Application, JobPosting } from "@/types"

export default function EmailTestPage() {
  const [loading, setLoading] = useState(false)
  const [testData, setTestData] = useState({
    recipientEmail: "",
    recipientName: "John Doe",
    jobTitle: "Frontend Developer",
    jobProject: "TRIOE",
    status: "for_interview" as Application["status"],
    adminName: "DevHatch Team",
    interviewDate: "2024-02-15",
    interviewTime: "14:00",
    interviewLocation: "3rd Floor, SteerHub Building",
    interviewType: "in_person",
    rejectionReason: "After careful consideration, we have decided to move forward with other candidates who more closely match our current project requirements."
  })

  const mockApplication: Application = {
    id: "test-app-123",
    jobId: "test-job-456",
    studentId: "2021-123456",
    studentName: testData.recipientName,
    studentEmail: testData.recipientEmail,
    firstName: testData.recipientName.split(' ')[0],
    lastName: testData.recipientName.split(' ')[1] || "",
    email: testData.recipientEmail,
    phone: "+63 123 456 7890",
    course: "Computer Science",
    year: "4th",
    coverLetter: "I am very interested in this position and excited to contribute to the project.",
    status: testData.status,
    appliedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const mockJobPosting: JobPosting = {
    id: "test-job-456",
    title: testData.jobTitle,
    project: testData.jobProject as "TRIOE" | "MR. MED" | "HAPTICS",
    description: "Join our innovative team working on cutting-edge projects.",
    requirements: "React, TypeScript, Node.js",
    responsibilities: "Develop web applications, Collaborate with team",
    availableSlots: 5,
    filledSlots: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "admin"
  }

  const handleSendTestEmail = async () => {
    if (!testData.recipientEmail) {
      toast.error("Please enter a recipient email address")
      return
    }

    setLoading(true)
    try {
      const emailData = {
        application: mockApplication,
        jobPosting: mockJobPosting,
        adminName: testData.adminName,
        interviewDetails: testData.status === "for_interview" ? {
          date: testData.interviewDate,
          time: testData.interviewTime,
          location: testData.interviewLocation,
          type: testData.interviewType
        } : undefined,
        rejectionReason: testData.status === "rejected" ? testData.rejectionReason : undefined
      }

      await emailService.sendApplicationStatusUpdate(emailData)
      toast.success(`Test email sent successfully to ${testData.recipientEmail}`)
    } catch (error) {
      console.error("Error sending test email:", error)
      toast.error("Failed to send test email. Check console for details.")
    } finally {
      setLoading(false)
    }
  }

  const getEmailSubject = () => {
    switch (testData.status) {
      case "for_interview":
        return `Interview Scheduled - ${testData.jobTitle} at DevHatch`
      case "hired":
        return `Congratulations! You've been selected for ${testData.jobTitle} at DevHatch`
      case "rejected":
        return `Application Update - ${testData.jobTitle} at DevHatch`
      default:
        return `Application Status Update - ${testData.jobTitle} at DevHatch`
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Email Template Testing</h1>
          <p className="text-gray-600 text-sm sm:text-base">Test and preview email notifications</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email Configuration
            </CardTitle>
            <CardDescription>
              Configure the test email parameters
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recipientEmail">Recipient Email *</Label>
                <Input
                  id="recipientEmail"
                  type="email"
                  placeholder="test@example.com"
                  value={testData.recipientEmail}
                  onChange={(e) => setTestData(prev => ({ ...prev, recipientEmail: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipientName">Recipient Name</Label>
                <Input
                  id="recipientName"
                  placeholder="John Doe"
                  value={testData.recipientName}
                  onChange={(e) => setTestData(prev => ({ ...prev, recipientName: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  placeholder="Frontend Developer"
                  value={testData.jobTitle}
                  onChange={(e) => setTestData(prev => ({ ...prev, jobTitle: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobProject">Project</Label>
                <Select value={testData.jobProject} onValueChange={(value) => setTestData(prev => ({ ...prev, jobProject: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRIOE">TRIOE</SelectItem>
                    <SelectItem value="MR. MED">MR. MED</SelectItem>
                    <SelectItem value="HAPTICS">HAPTICS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Email Type / Status</Label>
              <Select 
                value={testData.status} 
                onValueChange={(value: Application["status"]) => setTestData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Status Update - Pending</SelectItem>
                  <SelectItem value="for_review">Status Update - For Review</SelectItem>
                  <SelectItem value="for_interview">Interview Scheduled</SelectItem>
                  <SelectItem value="hired">Application Approved</SelectItem>
                  <SelectItem value="rejected">Application Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {testData.status === "for_interview" && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border">
                <h4 className="font-medium text-blue-900">Interview Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="interviewDate">Date</Label>
                    <Input
                      id="interviewDate"
                      type="date"
                      value={testData.interviewDate}
                      onChange={(e) => setTestData(prev => ({ ...prev, interviewDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interviewTime">Time</Label>
                    <Input
                      id="interviewTime"
                      type="time"
                      value={testData.interviewTime}
                      onChange={(e) => setTestData(prev => ({ ...prev, interviewTime: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interviewLocation">Location</Label>
                  <Input
                    id="interviewLocation"
                    placeholder="3rd Floor, SteerHub Building"
                    value={testData.interviewLocation}
                    onChange={(e) => setTestData(prev => ({ ...prev, interviewLocation: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interviewType">Type</Label>
                  <Select value={testData.interviewType} onValueChange={(value) => setTestData(prev => ({ ...prev, interviewType: value }))}>
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
              </div>
            )}

            {testData.status === "rejected" && (
              <div className="space-y-2">
                <Label htmlFor="rejectionReason">Rejection Reason</Label>
                <Textarea
                  id="rejectionReason"
                  placeholder="Provide reason for rejection..."
                  value={testData.rejectionReason}
                  onChange={(e) => setTestData(prev => ({ ...prev, rejectionReason: e.target.value }))}
                  rows={3}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="adminName">Sender Name</Label>
              <Input
                id="adminName"
                placeholder="DevHatch Team"
                value={testData.adminName}
                onChange={(e) => setTestData(prev => ({ ...prev, adminName: e.target.value }))}
              />
            </div>

            <Button 
              onClick={handleSendTestEmail} 
              disabled={loading || !testData.recipientEmail}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Send Test Email
            </Button>
          </CardContent>
        </Card>

        {/* Email Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Email Preview
            </CardTitle>
            <CardDescription>
              Preview of the email that will be sent
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">To:</span> {testData.recipientEmail || "recipient@example.com"}
                </div>
                <div className="text-sm">
                  <span className="font-medium">From:</span> DevHatch OJT Portal &lt;noreply@devhatch.batstate-u.edu.ph&gt;
                </div>
                <div className="text-sm">
                  <span className="font-medium">Subject:</span> {getEmailSubject()}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Email Content</h4>
              <div className="text-sm text-gray-600 space-y-2">
                {testData.status === "for_interview" && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded">
                    <p className="font-medium text-green-800">🎉 Interview Scheduled!</p>
                    <p className="text-green-700">
                      Interview details with date, time, location, and preparation tips.
                    </p>
                  </div>
                )}

                {testData.status === "hired" && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="font-medium text-blue-800">🎉 Congratulations!</p>
                    <p className="text-blue-700">
                      Welcome message with next steps and onboarding information.
                    </p>
                  </div>
                )}

                {testData.status === "rejected" && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                    <p className="font-medium text-orange-800">📄 Application Update</p>
                    <p className="text-orange-700">
                      Professional rejection message with encouragement and feedback.
                    </p>
                  </div>
                )}

                {(testData.status === "pending" || testData.status === "for_review") && (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                    <p className="font-medium text-gray-800">📊 Status Update</p>
                    <p className="text-gray-700">
                      General status update notification.
                    </p>
                  </div>
                )}

                <p className="text-xs text-gray-500">
                  * This is a simplified preview. The actual email contains full formatting, 
                  university branding, and complete content.
                </p>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Make sure you have configured the RESEND_API_KEY environment 
                variable. Without it, emails will only be logged to the console.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 