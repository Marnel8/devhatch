"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Search, Eye, Edit, MoreHorizontal, Users, Calendar, MapPin, Briefcase, Loader2, RefreshCw, FileText } from "lucide-react"
import Link from "next/link"
import type { JobPosting } from "@/types"
import { 
  getAllJobPostings, 
  deleteJobPosting, 
  toggleJobStatus, 
  duplicateJobPosting,
  getJobStatistics 
} from "@/lib/jobs-service"
import { showSuccessToast, showErrorToast, showLoadingToast } from "@/lib/toast-utils"
import { useAuth } from "@/lib/auth-context"
import { filterByProjectAccess, getAvailableProjects } from "@/lib/permissions"

export default function JobManagementPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [projectFilter, setProjectFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null)
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<any>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Load jobs from Firebase
  const loadJobs = async () => {
    try {
      setError(null)
      const [jobsData, statsData] = await Promise.all([
        getAllJobPostings(),
        getJobStatistics()
      ])
      
      // Filter jobs based on user's project access
      const filteredJobs = user ? filterByProjectAccess(user, jobsData) : jobsData
      setJobs(filteredJobs)
      setStats(statsData)
    } catch (error: any) {
      console.error("Error loading jobs:", error)
      setError(error.message || "Failed to load jobs")
      showErrorToast("Failed to load jobs. Please try again.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Initial load
  useEffect(() => {
    loadJobs()
  }, [user])

  // Refresh jobs
  const handleRefresh = async () => {
    setRefreshing(true)
    await loadJobs()
    showSuccessToast("Jobs refreshed successfully!")
  }

  // Get available projects for filter dropdown
  const availableProjects = user ? getAvailableProjects(user) : ["TRIOE", "MR. MED", "HAPTICS"]

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesProject = projectFilter === "all" || job.project === projectFilter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && job.isActive) ||
      (statusFilter === "inactive" && !job.isActive) ||
      (statusFilter === "full" && job.filledSlots >= job.availableSlots) ||
      (statusFilter === "available" && job.filledSlots < job.availableSlots)

    return matchesSearch && matchesProject && matchesStatus
  })

  const getProjectColor = (project: string) => {
    switch (project) {
      case "TRIOE":
        return "bg-blue-100 text-blue-800"
      case "MR. MED":
        return "bg-purple-100 text-purple-800"
      case "HAPTICS":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusBadge = (job: JobPosting) => {
    if (!job.isActive) {
      return <Badge variant="secondary">Inactive</Badge>
    }
    if (job.filledSlots >= job.availableSlots) {
      return <Badge className="bg-red-100 text-red-800">Full</Badge>
    }
    return <Badge className="bg-green-100 text-green-800">Available</Badge>
  }

  const handleDeleteJob = (job: JobPosting) => {
    setSelectedJob(job)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedJob) return
    
    try {
      showLoadingToast("Deleting job posting...")
      await deleteJobPosting(selectedJob.id)
      await loadJobs() // Refresh the list
      showSuccessToast("Job posting deleted successfully!")
    } catch (error: any) {
      showErrorToast(error.message || "Failed to delete job posting")
    } finally {
      setDeleteDialogOpen(false)
      setSelectedJob(null)
    }
  }

  const handleToggleStatus = async (job: JobPosting) => {
    try {
      showLoadingToast(`${job.isActive ? 'Deactivating' : 'Activating'} job posting...`)
      await toggleJobStatus(job.id)
      await loadJobs() // Refresh the list
      showSuccessToast(`Job posting ${job.isActive ? 'deactivated' : 'activated'} successfully!`)
    } catch (error: any) {
      showErrorToast(error.message || "Failed to update job status")
    }
  }

  const handleDuplicate = async (job: JobPosting) => {
    try {
      showLoadingToast("Duplicating job posting...")
      await duplicateJobPosting(job.id)
      await loadJobs() // Refresh the list
      showSuccessToast("Job posting duplicated successfully!")
    } catch (error: any) {
      showErrorToast(error.message || "Failed to duplicate job posting")
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Job Management</h1>
            <p className="text-gray-600 text-sm sm:text-base">Create and manage OJT position listings</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-gray-600">Loading job postings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Job Management</h1>
          <p className="text-gray-600 text-sm sm:text-base">Create and manage OJT position listings</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/admin/jobs/create">
            <Button className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Create New Job
            </Button>
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              className="ml-2"
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <p className="text-sm text-gray-600">Total Jobs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <p className="text-sm text-gray-600">Active Jobs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.available}</div>
              <p className="text-sm text-gray-600">Available Positions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.filledSlots}/{stats.totalSlots}</div>
              <p className="text-sm text-gray-600">Filled Slots</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {availableProjects.map((project) => (
                  <SelectItem key={project} value={project}>{project}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="full">Full</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600 text-sm sm:text-base">
          Showing {filteredJobs.length} of {jobs.length} jobs
        </p>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{jobs.filter((j) => j.isActive).length} Active</Badge>
          <Badge variant="outline">{jobs.filter((j) => j.filledSlots >= j.availableSlots).length} Full</Badge>
        </div>
      </div>

      {/* Job Listings */}
      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <Card key={job.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{job.title}</h3>
                      <Badge className={getProjectColor(job.project)}>{job.project}</Badge>
                      {getStatusBadge(job)}
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 leading-relaxed">{job.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Briefcase className="w-4 h-4 mr-2" />
                      <span className="font-medium">Requirements:</span>
                      <span className="ml-2">{job.requirements}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Briefcase className="w-4 h-4 mr-2" />
                      <span className="font-medium">Responsibilities:</span>
                      <span className="ml-2">{job.responsibilities}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>
                          {job.filledSlots}/{job.availableSlots} positions filled
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>Created {new Date(job.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>BatStateU Campus</span>
                      </div>
                      {job.pdfUrl && (
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-1 text-red-500" />
                          <span>PDF Attached</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex lg:flex-col gap-2">
                  <Link href={`/admin/jobs/${job.id}`} className="flex-1 lg:flex-none">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </Link>
                  <Link href={`/admin/jobs/${job.id}/edit`} className="flex-1 lg:flex-none">
                    <Button variant="outline" size="sm" className="w-full">
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
                      <DropdownMenuItem onClick={() => handleToggleStatus(job)}>
                        {job.isActive ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(job)}>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteJob(job)} className="text-red-600">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || projectFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your search criteria"
                : "Get started by creating your first job posting"}
            </p>
            {!searchTerm && projectFilter === "all" && statusFilter === "all" && (
              <Link href="/admin/jobs/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Job
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job Posting</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedJob?.title}"? This action cannot be undone. All applications for
              this job will also be removed.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Job
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
