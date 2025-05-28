"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Award, User, QrCode, Clock, Calendar, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { user } = useAuth()

  // Mock student data
  const studentData = {
    totalHours: 240,
    completedHours: 156,
    accomplishments: 8,
    pendingReview: 2,
    lastActivity: "2024-01-23",
    nextDeadline: "2024-01-30",
    project: "TRIOE Development",
    supervisor: "Dr. Juan Dela Cruz",
  }

  const progressPercentage = (studentData.completedHours / studentData.totalHours) * 100

  const recentAccomplishments = [
    {
      id: "1",
      title: "Completed React Component Library",
      date: "2024-01-23",
      status: "approved",
    },
    {
      id: "2",
      title: "User Interface Design Improvements",
      date: "2024-01-22",
      status: "pending",
    },
    {
      id: "3",
      title: "Database Optimization",
      date: "2024-01-21",
      status: "draft",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600 text-sm sm:text-base">Here's your OJT progress overview</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">OJT Progress</p>
                <p className="text-2xl font-bold">{Math.round(progressPercentage)}%</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Accomplishments</p>
                <p className="text-2xl font-bold">{studentData.accomplishments}</p>
              </div>
              <Award className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hours Completed</p>
                <p className="text-2xl font-bold">{studentData.completedHours}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold">{studentData.pendingReview}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* OJT Progress */}
          <Card>
            <CardHeader>
              <CardTitle>OJT Progress</CardTitle>
              <CardDescription>Your internship completion status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Hours Completed</span>
                  <span>
                    {studentData.completedHours} / {studentData.totalHours} hours
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-primary">{studentData.completedHours}</p>
                    <p className="text-xs text-gray-600">Hours Done</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-orange-600">
                      {studentData.totalHours - studentData.completedHours}
                    </p>
                    <p className="text-xs text-gray-600">Hours Left</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Accomplishments */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Accomplishments</CardTitle>
              <CardDescription>Your latest submitted work</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAccomplishments.map((accomplishment) => (
                  <div key={accomplishment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{accomplishment.title}</h4>
                      <p className="text-xs text-gray-500">{new Date(accomplishment.date).toLocaleDateString()}</p>
                    </div>
                    <Badge className={getStatusColor(accomplishment.status)} variant="secondary">
                      {accomplishment.status}
                    </Badge>
                  </div>
                ))}
                <Link href="/dashboard/accomplishments">
                  <Button variant="outline" className="w-full">
                    View All Accomplishments
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Project Info */}
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">Project</p>
                <p className="text-sm text-gray-600">{studentData.project}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Supervisor</p>
                <p className="text-sm text-gray-600">{studentData.supervisor}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Last Activity</p>
                <p className="text-sm text-gray-600">{new Date(studentData.lastActivity).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard/accomplishments">
                <Button className="w-full justify-start">
                  <Award className="w-4 h-4 mr-2" />
                  Add Accomplishment
                </Button>
              </Link>
              <Link href="/dashboard/profile">
                <Button variant="outline" className="w-full justify-start">
                  <User className="w-4 h-4 mr-2" />
                  Update Profile
                </Button>
              </Link>
              <Link href="/qr">
                <Button variant="outline" className="w-full justify-start">
                  <QrCode className="w-4 h-4 mr-2" />
                  View QR Code
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
