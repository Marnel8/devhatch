"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, TrendingUp, Users, Clock, Calendar, BarChart3, FileText, Award, Target } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { getReportStats, getAttendanceStats, getStudentPerformance } from "@/lib/firebase/reports"
import type { ReportStats, PerformanceData } from "@/lib/firebase/reports"
import { useAuth } from "@/lib/auth-context"
import { getAvailableProjects } from "@/lib/permissions"

export default function ReportsPage() {
  const { user } = useAuth()
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [selectedProject, setSelectedProject] = useState("all")
  const [reportType, setReportType] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<ReportStats | null>(null)
  const [attendanceData, setAttendanceData] = useState<{ date: string; present: number; absent: number; rate: number; }[]>([])
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([])

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user, dateRange, selectedProject])

  // Get available projects for filter dropdown
  const availableProjects = user ? getAvailableProjects(user) : ["TRIOE", "MR. MED", "HAPTICS"]

  const fetchData = async () => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    try {
      const startDate = dateRange?.from ? new Date(dateRange.from) : undefined
      const endDate = dateRange?.to ? new Date(dateRange.to) : undefined

      // Fetch overview stats
      const reportStats = await getReportStats(startDate, endDate)
      setStats(reportStats)

      // Fetch attendance data
      const attendanceStats = await getAttendanceStats(startDate, endDate)
      setAttendanceData(attendanceStats)

      // Fetch performance data
      const performanceStats = await getStudentPerformance(5)
      setPerformanceData(performanceStats)
    } catch (error) {
      console.error('Error fetching report data:', error)
      setError("Failed to fetch report data. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const generateReport = (type: string) => {
    console.log(`Generating ${type} report...`)
    // TODO: Implement report generation
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-red-600">{error}</h2>
          <Button onClick={() => fetchData()}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading Reports...</h2>
          <p className="text-gray-600">Please wait while we fetch the data.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-gray-600 text-sm sm:text-base">Generate comprehensive reports and insights</p>
        </div>
        <Button onClick={() => generateReport(reportType)}>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            </div>
            <div className="w-full sm:w-48">
              <label className="text-sm font-medium mb-2 block">Project</label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {availableProjects.map((project) => (
                    <SelectItem key={project} value={project}>
                      {project}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview</SelectItem>
                  <SelectItem value="attendance">Attendance</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="projects">Projects</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      <Tabs value={reportType} onValueChange={setReportType} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold">{stats.totalStudents}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Students</p>
                    <p className="text-2xl font-bold">{stats.activeStudents}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Hours</p>
                    <p className="text-2xl font-bold">{stats.totalHours.toLocaleString()}</p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Attendance</p>
                    <p className="text-2xl font-bold">{stats.averageAttendance}%</p>
                  </div>
                  <Calendar className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completion</p>
                    <p className="text-2xl font-bold">{stats.completionRate}%</p>
                  </div>
                  <Target className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Project Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Project Distribution</CardTitle>
              <CardDescription>Student and hour allocation across projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(stats.projectDistribution).map(([project, data]) => (
                  <div key={project} className="text-center p-4 border rounded-lg">
                    <div
                      className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl mb-3 ${
                        project === "TRIOE" ? "bg-blue-100" : project === "MR. MED" ? "bg-purple-100" : "bg-green-100"
                      }`}
                    >
                      {project === "TRIOE" ? "⚡" : project === "MR. MED" ? "🥽" : "🤖"}
                    </div>
                    <h3 className="font-semibold text-lg">{project}</h3>
                    <div className="mt-2 space-y-1">
                      <p className="text-2xl font-bold text-primary">{data.students}</p>
                      <p className="text-sm text-gray-600">students</p>
                      <p className="text-lg font-semibold">{data.hours.toLocaleString()}</p>
                      <p className="text-xs text-gray-600">total hours</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Trends</CardTitle>
              <CardDescription>Daily attendance rates over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attendanceData.map((day) => (
                  <div key={day.date} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{new Date(day.date).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-600">
                        {day.present} present, {day.absent} absent
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{day.rate}%</p>
                      <Badge
                        className={day.rate >= 90 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                      >
                        {day.rate >= 90 ? "Excellent" : "Good"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Performance</CardTitle>
              <CardDescription>Top performing students by completion and attendance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceData.map((student, index) => (
                  <div key={student.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0
                            ? "bg-yellow-100 text-yellow-800"
                            : index === 1
                              ? "bg-gray-100 text-gray-800"
                              : index === 2
                                ? "bg-orange-100 text-orange-800"
                                : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-gray-600">{student.project}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-lg font-bold">{student.completion}%</p>
                        <p className="text-xs text-gray-600">Completion</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold">{student.attendance}%</p>
                        <p className="text-xs text-gray-600">Attendance</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(stats.projectDistribution).map(([project, data]) => (
              <Card key={project}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{project === "TRIOE" ? "⚡" : project === "MR. MED" ? "🥽" : "🤖"}</span>
                    {project}
                  </CardTitle>
                  <CardDescription>Project performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Students</span>
                      <span className="font-medium">{data.students}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Hours</span>
                      <span className="font-medium">{data.hours.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Avg Hours/Student</span>
                      <span className="font-medium">{Math.round(data.hours / data.students)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Export Options</CardTitle>
          <CardDescription>Generate and download specific reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" onClick={() => generateReport("student-list")}>
              <FileText className="w-4 h-4 mr-2" />
              Student List
            </Button>
            <Button variant="outline" onClick={() => generateReport("attendance-summary")}>
              <Calendar className="w-4 h-4 mr-2" />
              Attendance Summary
            </Button>
            <Button variant="outline" onClick={() => generateReport("progress-report")}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Progress Report
            </Button>
            <Button variant="outline" onClick={() => generateReport("accomplishments")}>
              <Award className="w-4 h-4 mr-2" />
              Accomplishments
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
