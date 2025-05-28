"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Eye, Edit, Clock, Award, TrendingUp, Users, Mail, Briefcase, GraduationCap, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { 
  getAllStudents, 
  getAllAttendanceRecords, 
  getAllAccomplishments,
  getAttendanceRecordsByStudentId,
  getAccomplishmentsByStudentId,
  calculateCompletedHours
} from "@/lib/students-service"
import type { Student, AttendanceRecord, Accomplishment } from "@/types"

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [projectFilter, setProjectFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [studentDialogOpen, setStudentDialogOpen] = useState(false)
  
  // Data state
  const [students, setStudents] = useState<Student[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [accomplishments, setAccomplishments] = useState<Accomplishment[]>([])
  const [selectedStudentAttendance, setSelectedStudentAttendance] = useState<AttendanceRecord[]>([])
  const [selectedStudentAccomplishments, setSelectedStudentAccomplishments] = useState<Accomplishment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load data from Firebase
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [studentsData, attendanceData, accomplishmentsData] = await Promise.all([
        getAllStudents(),
        getAllAttendanceRecords(),
        getAllAccomplishments()
      ])

      // Update students with calculated completed hours from attendance
      const studentsWithUpdatedHours = studentsData.map(student => {
        const studentAttendance = attendanceData.filter(record => record.studentId === student.id)
        const calculatedHours = calculateCompletedHours(studentAttendance)
        return {
          ...student,
          completedHours: calculatedHours
        }
      })

      setStudents(studentsWithUpdatedHours)
      setAttendanceRecords(attendanceData)
      setAccomplishments(accomplishmentsData)
    } catch (err) {
      console.error("Error loading data:", err)
      setError("Failed to load student data")
      toast.error("Failed to load student data")
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.ojtNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesProject = projectFilter === "all" || student.project === projectFilter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && student.isActive) ||
      (statusFilter === "inactive" && !student.isActive)

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

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500"
    if (percentage >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  const handleViewStudent = async (student: Student) => {
    try {
      setSelectedStudent(student)
      setStudentDialogOpen(true)
      
      // Load student-specific data
      const [studentAttendance, studentAccomplishments] = await Promise.all([
        getAttendanceRecordsByStudentId(student.id),
        getAccomplishmentsByStudentId(student.id)
      ])
      
      setSelectedStudentAttendance(studentAttendance)
      setSelectedStudentAccomplishments(studentAccomplishments)
    } catch (err) {
      console.error("Error loading student details:", err)
      toast.error("Failed to load student details")
    }
  }

  const stats = {
    total: students.length,
    active: students.filter((s) => s.isActive).length,
    inactive: students.filter((s) => !s.isActive).length,
    averageProgress: Math.round(
      students.reduce((acc, s) => acc + (s.completedHours / s.totalHours) * 100, 0) / students.length,
    ),
  }

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Student Management</h1>
            <p className="text-gray-600 text-sm sm:text-base">Monitor student progress and attendance</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2">Loading students...</span>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Student Management</h1>
            <p className="text-gray-600 text-sm sm:text-base">Monitor student progress and attendance</p>
          </div>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Students</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadData}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Student Management</h1>
          <p className="text-gray-600 text-sm sm:text-base">Monitor student progress and attendance</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold">{stats.total}</p>
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
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-2xl font-bold">{stats.inactive}</p>
              </div>
              <Clock className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                <p className="text-2xl font-bold">{stats.averageProgress}%</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search students..."
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
                <SelectItem value="TRIOE">TRIOE</SelectItem>
                <SelectItem value="MR. MED">MR. MED</SelectItem>
                <SelectItem value="HAPTICS">HAPTICS</SelectItem>
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
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600 text-sm sm:text-base">
          Showing {filteredStudents.length} of {students.length} students
        </p>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            {stats.active} Active
          </Badge>
        </div>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredStudents.map((student) => {
          const progressPercentage = (student.completedHours / student.totalHours) * 100

          return (
            <Card key={student.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{student.name}</h3>
                      <p className="text-sm text-gray-600">{student.ojtNumber}</p>
                    </div>
                  </div>
                  <Badge className={student.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                    {student.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Briefcase className="w-4 h-4 mr-2" />
                    <span>{student.position}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Badge className={getProjectColor(student.project || "")} variant="secondary">
                      {student.project}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    <span className="truncate">{student.email}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>
                      {student.completedHours}/{student.totalHours} hours
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                  <p className="text-xs text-gray-600 text-center">{Math.round(progressPercentage)}% completed</p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewStudent(student)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Link href={`/admin/students/${student.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredStudents.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
            <p className="text-gray-600">
              {searchTerm || projectFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your search criteria"
                : "No students have been enrolled yet"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Student Details Dialog */}
      <Dialog open={studentDialogOpen} onOpenChange={setStudentDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>
              {selectedStudent && `Complete information for ${selectedStudent.name}`}
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <Tabs defaultValue="overview" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
                <TabsTrigger value="accomplishments">Accomplishments</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Full Name</span>
                        <p className="font-medium">{selectedStudent.name}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Email</span>
                        <p className="font-medium">{selectedStudent.email}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">OJT Number</span>
                        <p className="font-medium">{selectedStudent.ojtNumber}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Status</span>
                        <Badge
                          className={
                            selectedStudent.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }
                        >
                          {selectedStudent.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Project</span>
                        <Badge className={getProjectColor(selectedStudent.project || "")} variant="secondary">
                          {selectedStudent.project}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Position</span>
                        <p className="font-medium">{selectedStudent.position}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Progress Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Progress Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span>Hours Completed</span>
                        <span>
                          {selectedStudent.completedHours} / {selectedStudent.totalHours}
                        </span>
                      </div>
                      <Progress
                        value={(selectedStudent.completedHours / selectedStudent.totalHours) * 100}
                        className="h-3"
                      />
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-primary">{selectedStudent.completedHours}</p>
                          <p className="text-xs text-gray-600">Hours Completed</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-orange-600">
                            {selectedStudent.totalHours - selectedStudent.completedHours}
                          </p>
                          <p className="text-xs text-gray-600">Hours Remaining</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-green-600">
                            {Math.round((selectedStudent.completedHours / selectedStudent.totalHours) * 100)}%
                          </p>
                          <p className="text-xs text-gray-600">Progress</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="attendance" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Attendance</CardTitle>
                    <CardDescription>Latest attendance records</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedStudentAttendance.length > 0 ? (
                        selectedStudentAttendance.map((record) => (
                          <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{new Date(record.date).toLocaleDateString()}</p>
                              <p className="text-sm text-gray-600">
                                {record.timeIn ? new Date(record.timeIn).toLocaleTimeString() : "—"} -{" "}
                                {record.timeOut ? new Date(record.timeOut).toLocaleTimeString() : "In Progress"}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{record.hoursWorked || 0}h</p>
                              <Badge variant="outline">Complete</Badge>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No attendance records found</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="accomplishments" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Accomplishments</CardTitle>
                    <CardDescription>Student's submitted work and achievements</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedStudentAccomplishments.length > 0 ? (
                        selectedStudentAccomplishments.map((accomplishment) => (
                          <div key={accomplishment.id} className="border-l-4 border-primary pl-4 py-2">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-sm font-medium text-gray-600">
                                {new Date(accomplishment.date).toLocaleDateString()}
                              </span>
                              <Badge variant="outline">Submitted</Badge>
                            </div>
                            <p className="text-sm leading-relaxed">{accomplishment.description}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No accomplishments found</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
