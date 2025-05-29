"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MobileHeader } from "@/components/mobile-header"
import { Briefcase, MapPin, Clock, Users, Search, Filter, ArrowLeft, SlidersHorizontal } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import type { JobPosting } from "@/types"
import { database } from "@/app/lib/firebase"
import { ref, get, query, orderByChild, equalTo } from "firebase/database"

export default function JobsPage() {
  const searchParams = useSearchParams()
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [filteredJobs, setFilteredJobs] = useState<JobPosting[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [projectFilter, setProjectFilter] = useState(searchParams.get("project") || "all")
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  // Update filter when URL changes
  useEffect(() => {
    const project = searchParams.get("project")
    if (project) {
      setProjectFilter(project)
    }
  }, [searchParams])

  // Fetch jobs from Firebase Realtime Database
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobsRef = ref(database, "jobPostings")
        const snapshot = await get(jobsRef)
        
        if (!snapshot.exists()) {
          setJobs([])
          setFilteredJobs([])
          return
        }

        const jobsData = Object.entries(snapshot.val()).map(([id, data]) => ({
          id,
          ...(data as Omit<JobPosting, "id">)
        }))

        // Filter active jobs and jobs with available slots client-side
        const activeJobs = jobsData.filter(job => 
          job.isActive && 
          (job.availableSlots - job.filledSlots) > 0
        )
        
        setJobs(activeJobs)
        setFilteredJobs(activeJobs)
      } catch (error) {
        console.error("Error fetching jobs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  useEffect(() => {
    let filtered = jobs

    if (searchTerm) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (projectFilter !== "all") {
      filtered = filtered.filter((job) => job.project === projectFilter)
    }

    setFilteredJobs(filtered)
  }, [jobs, searchTerm, projectFilter])

  const getProjectColor = (project: string) => {
    switch (project) {
      case "TRIOE":
        return "bg-blue-500"
      case "MR. MED":
        return "bg-purple-500"
      case "HAPTICS":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getProjectIcon = (project: string) => {
    switch (project) {
      case "TRIOE":
        return "🔌"
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
          <p className="mt-4 text-gray-600">Loading opportunities...</p>
        </div>
      </div>
    )
  }

  const FilterContent = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search opportunities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Project</label>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger>
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
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader showAuth={true} />

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">OJT Opportunities</h1>
              <p className="text-gray-600 text-sm sm:text-base mt-1">Discover your next career opportunity</p>
            </div>
            <Link href="/" className="hidden sm:block">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Mobile Filters */}
          <div className="flex gap-3 sm:hidden">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Filters</h3>
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Filters */}
          <div className="hidden sm:block">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search opportunities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
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
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-4 sm:mb-6">
          <p className="text-gray-600 text-sm sm:text-base">
            Showing {filteredJobs.length} of {jobs.length} opportunities
          </p>
        </div>

        {/* Job Listings */}
        <div className="space-y-4 sm:space-y-6">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getProjectIcon(job.project)}</span>
                      <Badge variant="secondary" className="text-xs">
                        {job.project}
                      </Badge>
                      <div className={`w-2 h-2 rounded-full ${getProjectColor(job.project)}`} />
                    </div>
                    <CardTitle className="text-lg sm:text-xl leading-tight">{job.title}</CardTitle>
                    <CardDescription className="text-sm sm:text-base leading-relaxed">
                      {job.description}
                    </CardDescription>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1 text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span>
                        {job.availableSlots - job.filledSlots} of {job.availableSlots} slots
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2 text-sm sm:text-base">Requirements:</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{job.requirements}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        BatStateU Campus
                      </div>
                      <div className="flex items-center">
                        <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        Internship
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Link href={`/jobs/${job.id}`} className="flex-1 sm:flex-none">
                        <Button variant="outline" className="w-full sm:w-auto">
                          View Details
                        </Button>
                      </Link>
                      <Link href={`/apply?job=${job.id}`} className="flex-1 sm:flex-none">
                        <Button className="w-full sm:w-auto">Apply Now</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Try adjusting your search criteria or check back later for new postings.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
