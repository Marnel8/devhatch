"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  HelpCircle,
  MessageCircle,
  Book,
  Video,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  Search,
  ExternalLink,
  Download,
  FileText,
  Users,
  Lightbulb,
} from "lucide-react"

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  helpful: number
}

interface SupportTicket {
  id: string
  subject: string
  status: "open" | "in-progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high"
  createdAt: string
  lastUpdate: string
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    category: "",
    priority: "medium",
    description: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Mock FAQ data
  const faqs: FAQ[] = [
    {
      id: "1",
      question: "How do I scan the QR code for attendance?",
      answer:
        "To scan the QR code for attendance, go to your dashboard and click on the 'QR Scanner' button. Allow camera permissions when prompted, then point your camera at the QR code displayed at your workstation. The system will automatically record your time in/out.",
      category: "attendance",
      helpful: 45,
    },
    {
      id: "2",
      question: "How do I submit my daily accomplishments?",
      answer:
        "Navigate to the 'Accomplishments' section in your dashboard. Click 'Add Accomplishment', fill in the title, description, category, and date. You can attach files if needed. Save as draft to edit later, or submit directly for supervisor review.",
      category: "accomplishments",
      helpful: 38,
    },
    {
      id: "3",
      question: "What should I do if I forgot to time out?",
      answer:
        "If you forgot to time out, contact your supervisor immediately. They can manually adjust your attendance record through the admin portal. In the future, set up attendance reminders in your notification settings to avoid this issue.",
      category: "attendance",
      helpful: 52,
    },
    {
      id: "4",
      question: "How can I view my OJT progress?",
      answer:
        "Your OJT progress is displayed on your main dashboard. You can see your completed hours, remaining hours, and progress percentage. For detailed attendance history, visit the 'Attendance' section.",
      category: "progress",
      helpful: 29,
    },
    {
      id: "5",
      question: "How do I update my profile information?",
      answer:
        "Go to your 'Profile' page from the dashboard sidebar. Click 'Edit Profile' to modify your personal information, bio, and skills. Remember to save your changes when done.",
      category: "profile",
      helpful: 33,
    },
    {
      id: "6",
      question: "What are the different accomplishment categories?",
      answer:
        "Accomplishment categories include: Development (coding tasks), Design (UI/UX work), Research (investigation tasks), Testing (QA activities), Documentation (writing docs), Learning (training/courses), Collaboration (teamwork), and Other (miscellaneous tasks).",
      category: "accomplishments",
      helpful: 41,
    },
  ]

  // Mock support tickets
  const supportTickets: SupportTicket[] = [
    {
      id: "TICK-001",
      subject: "Unable to scan QR code",
      status: "resolved",
      priority: "medium",
      createdAt: "2024-01-20",
      lastUpdate: "2024-01-21",
    },
    {
      id: "TICK-002",
      subject: "Accomplishment submission error",
      status: "in-progress",
      priority: "high",
      createdAt: "2024-01-22",
      lastUpdate: "2024-01-23",
    },
  ]

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "attendance", label: "Attendance" },
    { value: "accomplishments", label: "Accomplishments" },
    { value: "profile", label: "Profile" },
    { value: "progress", label: "Progress" },
    { value: "technical", label: "Technical Issues" },
    { value: "account", label: "Account" },
  ]

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getStatusColor = (status: string) => {
    const colors = {
      open: "bg-blue-100 text-blue-800",
      "in-progress": "bg-yellow-100 text-yellow-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800",
    }
    return colors[status as keyof typeof colors] || colors.open
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800",
    }
    return colors[priority as keyof typeof colors] || colors.medium
  }

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSuccess(true)
      setTicketForm({ subject: "", category: "", priority: "medium", description: "" })
      setTimeout(() => setSuccess(false), 5000)
    } catch (error) {
      console.error("Failed to submit ticket")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Help & Support</h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Find answers to common questions or get help from our support team
        </p>
      </div>

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Support ticket submitted successfully! We'll get back to you within 24 hours.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="faq" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="guides">Guides</TabsTrigger>
          <TabsTrigger value="support">Contact Support</TabsTrigger>
          <TabsTrigger value="tickets">My Tickets</TabsTrigger>
        </TabsList>

        {/* FAQ Section */}
        <TabsContent value="faq" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>Find quick answers to common questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search FAQs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* FAQ List */}
              <Accordion type="single" collapsible className="space-y-2">
                {filteredFAQs.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id} className="border rounded-lg px-4">
                    <AccordionTrigger className="text-left hover:no-underline">
                      <div className="flex items-center gap-2">
                        <span>{faq.question}</span>
                        <Badge variant="outline" className="ml-auto">
                          {categories.find((c) => c.value === faq.category)?.label}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      <div className="space-y-3">
                        <p>{faq.answer}</p>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>Was this helpful?</span>
                            <Button variant="outline" size="sm">
                              👍 Yes
                            </Button>
                            <Button variant="outline" size="sm">
                              👎 No
                            </Button>
                          </div>
                          <span className="text-sm text-gray-500">{faq.helpful} people found this helpful</span>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {filteredFAQs.length === 0 && (
                <div className="text-center py-12">
                  <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No FAQs found</h3>
                  <p className="text-gray-600">Try adjusting your search or category filter</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Guides Section */}
        <TabsContent value="guides" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Book className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-lg">Getting Started Guide</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Complete guide for new OJT students to get started with the platform
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Beginner</Badge>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Read Guide
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-green-600" />
                  <CardTitle className="text-lg">Video Tutorials</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Step-by-step video tutorials for all platform features</p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Visual</Badge>
                  <Button variant="outline" size="sm">
                    <Video className="w-4 h-4 mr-2" />
                    Watch Videos
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <CardTitle className="text-lg">User Manual</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Comprehensive user manual with detailed instructions</p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Complete</Badge>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  <CardTitle className="text-lg">Tips & Tricks</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Pro tips to make the most out of your OJT experience</p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Advanced</Badge>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <CardTitle className="text-lg">Community Forum</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Connect with other students and share experiences</p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Community</Badge>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Join Forum
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-red-600" />
                  <CardTitle className="text-lg">Troubleshooting</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Common issues and their solutions</p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Support</Badge>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Solutions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contact Support */}
        <TabsContent value="support" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Contact Information
                </CardTitle>
                <CardDescription>Get in touch with our support team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Email Support</p>
                      <p className="text-sm text-gray-600">devhatch.support@batstate-u.edu.ph</p>
                      <p className="text-xs text-gray-500">Response within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">Phone Support</p>
                      <p className="text-sm text-gray-600">+63 43 425 0139</p>
                      <p className="text-xs text-gray-500">Mon-Fri, 8:00 AM - 5:00 PM</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Office Hours</p>
                      <p className="text-sm text-gray-600">Monday - Friday</p>
                      <p className="text-xs text-gray-500">8:00 AM - 5:00 PM (GMT+8)</p>
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertDescription>
                    For urgent technical issues during OJT hours, contact your supervisor directly or call the emergency
                    support line.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Support Ticket Form */}
            <Card>
              <CardHeader>
                <CardTitle>Submit Support Ticket</CardTitle>
                <CardDescription>Describe your issue and we'll help you resolve it</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitTicket} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={ticketForm.subject}
                      onChange={(e) => setTicketForm((prev) => ({ ...prev, subject: e.target.value }))}
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={ticketForm.category}
                        onValueChange={(value) => setTicketForm((prev) => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technical">Technical Issue</SelectItem>
                          <SelectItem value="account">Account Problem</SelectItem>
                          <SelectItem value="attendance">Attendance Issue</SelectItem>
                          <SelectItem value="accomplishments">Accomplishments</SelectItem>
                          <SelectItem value="feature">Feature Request</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={ticketForm.priority}
                        onValueChange={(value) => setTicketForm((prev) => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={ticketForm.description}
                      onChange={(e) => setTicketForm((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Please provide detailed information about your issue, including steps to reproduce if applicable..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Submitting..." : "Submit Ticket"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* My Tickets */}
        <TabsContent value="tickets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Support Tickets</CardTitle>
              <CardDescription>Track the status of your submitted tickets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {supportTickets.map((ticket) => (
                  <div key={ticket.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{ticket.subject}</h3>
                          <Badge variant="outline">{ticket.id}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                          <span>Last Update: {new Date(ticket.lastUpdate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                        <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                      </div>
                    </div>
                  </div>
                ))}

                {supportTickets.length === 0 && (
                  <div className="text-center py-12">
                    <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No support tickets</h3>
                    <p className="text-gray-600">You haven't submitted any support tickets yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
