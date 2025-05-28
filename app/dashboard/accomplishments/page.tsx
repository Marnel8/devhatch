"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Award,
  Plus,
  CalendarIcon,
  Clock,
  FileText,
  Upload,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface Accomplishment {
  id: string
  title: string
  description: string
  category: string
  date: string
  status: "draft" | "submitted" | "approved" | "rejected"
  attachments?: string[]
  feedback?: string
  submittedAt?: string
  reviewedAt?: string
}

export default function AccomplishmentsPage() {
  const { user } = useAuth()
  const [accomplishments, setAccomplishments] = useState<Accomplishment[]>([
    {
      id: "1",
      title: "Completed React Component Library",
      description:
        "Successfully developed a reusable component library for the TRIOE project using React and TypeScript. The library includes 15+ components with proper documentation and testing.",
      category: "development",
      date: "2024-01-23",
      status: "approved",
      submittedAt: "2024-01-23T17:00:00Z",
      reviewedAt: "2024-01-24T09:00:00Z",
      feedback: "Excellent work! The component library is well-structured and will be very useful for the team.",
    },
    {
      id: "2",
      title: "User Interface Design Improvements",
      description:
        "Redesigned the circuit board interface to improve user experience. Conducted user testing and implemented feedback to enhance usability.",
      category: "design",
      date: "2024-01-22",
      status: "submitted",
      submittedAt: "2024-01-22T16:30:00Z",
    },
    {
      id: "3",
      title: "Database Optimization",
      description: "Optimized database queries resulting in 40% performance improvement for the main dashboard.",
      category: "development",
      date: "2024-01-21",
      status: "draft",
    },
  ])

  const [selectedAccomplishment, setSelectedAccomplishment] = useState<Accomplishment | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    date: new Date(),
  })

  const categories = [
    { value: "development", label: "Development" },
    { value: "design", label: "Design" },
    { value: "research", label: "Research" },
    { value: "testing", label: "Testing" },
    { value: "documentation", label: "Documentation" },
    { value: "learning", label: "Learning" },
    { value: "collaboration", label: "Collaboration" },
    { value: "other", label: "Other" },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "submitted":
        return "bg-blue-100 text-blue-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4" />
      case "submitted":
        return <Clock className="w-4 h-4" />
      case "rejected":
        return <AlertCircle className="w-4 h-4" />
      case "draft":
        return <FileText className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      development: "bg-blue-100 text-blue-800",
      design: "bg-purple-100 text-purple-800",
      research: "bg-green-100 text-green-800",
      testing: "bg-yellow-100 text-yellow-800",
      documentation: "bg-orange-100 text-orange-800",
      learning: "bg-pink-100 text-pink-800",
      collaboration: "bg-indigo-100 text-indigo-800",
      other: "bg-gray-100 text-gray-800",
    }
    return colors[category as keyof typeof colors] || colors.other
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const newAccomplishment: Accomplishment = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        category: formData.category,
        date: format(formData.date, "yyyy-MM-dd"),
        status: "draft",
      }

      setAccomplishments((prev) => [newAccomplishment, ...prev])
      setDialogOpen(false)
      setFormData({ title: "", description: "", category: "", date: new Date() })
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to save accomplishment")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (accomplishment: Accomplishment) => {
    setSelectedAccomplishment(accomplishment)
    setFormData({
      title: accomplishment.title,
      description: accomplishment.description,
      category: accomplishment.category,
      date: new Date(accomplishment.date),
    })
    setIsEditing(true)
    setDialogOpen(true)
  }

  const handleView = (accomplishment: Accomplishment) => {
    setSelectedAccomplishment(accomplishment)
    setViewDialogOpen(true)
  }

  const handleSubmitForReview = (id: string) => {
    setAccomplishments((prev) =>
      prev.map((acc) =>
        acc.id === id
          ? {
              ...acc,
              status: "submitted",
              submittedAt: new Date().toISOString(),
            }
          : acc,
      ),
    )
  }

  const handleDelete = (id: string) => {
    setAccomplishments((prev) => prev.filter((acc) => acc.id !== id))
  }

  const stats = {
    total: accomplishments.length,
    approved: accomplishments.filter((a) => a.status === "approved").length,
    submitted: accomplishments.filter((a) => a.status === "submitted").length,
    drafts: accomplishments.filter((a) => a.status === "draft").length,
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">My Accomplishments</h1>
          <p className="text-gray-600 text-sm sm:text-base">Track and submit your daily achievements and learnings</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Accomplishment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Award className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Under Review</p>
                <p className="text-2xl font-bold">{stats.submitted}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Drafts</p>
                <p className="text-2xl font-bold">{stats.drafts}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accomplishments List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Accomplishments</CardTitle>
          <CardDescription>Your submitted work and achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {accomplishments.map((accomplishment) => (
              <div key={accomplishment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{accomplishment.title}</h3>
                      <Badge className={getCategoryColor(accomplishment.category)} variant="secondary">
                        {categories.find((c) => c.value === accomplishment.category)?.label}
                      </Badge>
                      <Badge className={getStatusColor(accomplishment.status)}>
                        {getStatusIcon(accomplishment.status)}
                        <span className="ml-1 capitalize">{accomplishment.status}</span>
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{accomplishment.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Date: {new Date(accomplishment.date).toLocaleDateString()}</span>
                      {accomplishment.submittedAt && (
                        <span>Submitted: {new Date(accomplishment.submittedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                    {accomplishment.feedback && (
                      <Alert className="mt-3 border-green-200 bg-green-50">
                        <AlertDescription className="text-green-800 text-sm">
                          <strong>Feedback:</strong> {accomplishment.feedback}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => handleView(accomplishment)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    {accomplishment.status === "draft" && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(accomplishment)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" onClick={() => handleSubmitForReview(accomplishment.id)}>
                          Submit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(accomplishment.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {accomplishments.length === 0 && (
            <div className="text-center py-12">
              <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No accomplishments yet</h3>
              <p className="text-gray-600 mb-6">Start documenting your achievements and learnings</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Accomplishment
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Accomplishment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Accomplishment" : "Add New Accomplishment"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Update your accomplishment details" : "Document your achievement or learning"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Brief title of your accomplishment"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
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

              <div className="space-y-2">
                <Label>Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => date && setFormData((prev) => ({ ...prev, date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what you accomplished, what you learned, and any challenges you overcame..."
                rows={6}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Attachments (Optional)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Click to upload files or drag and drop</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, PDF up to 10MB</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false)
                  setIsEditing(false)
                  setFormData({ title: "", description: "", category: "", date: new Date() })
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : isEditing ? "Update" : "Save as Draft"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Accomplishment Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Accomplishment Details</DialogTitle>
            <DialogDescription>
              {selectedAccomplishment && `View details for "${selectedAccomplishment.title}"`}
            </DialogDescription>
          </DialogHeader>

          {selectedAccomplishment && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-2">
                <Badge className={getCategoryColor(selectedAccomplishment.category)} variant="secondary">
                  {categories.find((c) => c.value === selectedAccomplishment.category)?.label}
                </Badge>
                <Badge className={getStatusColor(selectedAccomplishment.status)}>
                  {getStatusIcon(selectedAccomplishment.status)}
                  <span className="ml-1 capitalize">{selectedAccomplishment.status}</span>
                </Badge>
              </div>

              <div>
                <h3 className="font-semibold text-lg">{selectedAccomplishment.title}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Date: {new Date(selectedAccomplishment.date).toLocaleDateString()}
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedAccomplishment.description}</p>
                </div>
              </div>

              {selectedAccomplishment.feedback && (
                <div>
                  <h4 className="font-medium mb-2">Supervisor Feedback</h4>
                  <Alert className="border-green-200 bg-green-50">
                    <AlertDescription className="text-green-800">{selectedAccomplishment.feedback}</AlertDescription>
                  </Alert>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                  Close
                </Button>
                {selectedAccomplishment.status === "draft" && (
                  <Button onClick={() => handleEdit(selectedAccomplishment)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
