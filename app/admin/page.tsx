"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Briefcase,
  FileText,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  QrCode,
  Bell,
} from "lucide-react"
import Link from "next/link"
import { subscribeToDashboardStats, subscribeToRecentActivities, subscribeToSystemStatus } from "@/lib/firebase/dashboard"
import type { DashboardStats, RecentActivity } from "@/types"
import { useAuth } from "@/lib/auth-context"
import { getAvailableProjects } from "@/lib/permissions"

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [systemStatus, setSystemStatus] = useState({
    database: "operational",
    authentication: "operational",
    qrScanner: "operational"
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Set up real-time subscriptions
    const unsubscribeStats = subscribeToDashboardStats((newStats) => {
      // Filter stats based on user's project access if they're a project admin
      if (user?.role === "project_admin" && user.projectAccess) {
        // Note: This is a simple approach. In a real implementation,
        // you'd want the dashboard service to filter data on the server side
        const filteredStats = {
          ...newStats,
          // For now, we'll show all stats but this could be project-specific
        }
        setStats(filteredStats)
      } else {
        setStats(newStats)
      }
      setLoading(false)
    })

    const unsubscribeActivities = subscribeToRecentActivities((newActivities) => {
      // Filter activities based on user's project access
      if (user?.role === "project_admin" && user.projectAccess) {
        // Filter activities related to user's projects
        const filteredActivities = newActivities.filter(activity => {
          // This would need to be implemented based on how activities store project info
          // For now, show all activities
          return true
        })
        setRecentActivities(filteredActivities)
      } else {
        setRecentActivities(newActivities)
      }
    })

    const unsubscribeStatus = subscribeToSystemStatus((newStatus) => {
      setSystemStatus(newStatus)
    })

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeStats()
      unsubscribeActivities()
      unsubscribeStatus()
    }
  }, [user])

  // Get available projects for current user
  const availableProjects = user ? getAvailableProjects(user) : []

  const statsConfig = [
    {
      title: "Total Students",
      value: stats?.totalStudents.toString() || "0",
      change: "",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Jobs",
      value: stats?.activeJobs.toString() || "0",
      change: "",
      icon: Briefcase,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Applications",
      value: stats?.totalApplications.toString() || "0",
      change: stats ? `${stats.pendingApplications} pending` : "",
      icon: FileText,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Attendance Rate",
      value: stats ? `${stats.attendanceRate}%` : "0%",
      change: "Last 7 days",
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ]

  const quickActions = [
    {
      title: "Scan QR Code",
      description: "Check student attendance",
      href: "/admin/qr-scanner",
      icon: QrCode,
      color: "bg-blue-600",
    },
    {
      title: "Create Job",
      description: "Post new OJT position",
      href: "/admin/jobs/create",
      icon: Briefcase,
      color: "bg-green-600",
    },
    {
      title: "Send Notification",
      description: "Notify students",
      href: "/admin/notifications",
      icon: Bell,
      color: "bg-purple-600",
    },
    {
      title: "View Reports",
      description: "Generate analytics",
      href: "/admin/reports",
      icon: TrendingUp,
      color: "bg-orange-600",
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your OJT program.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsConfig.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  {stat.change && <p className="text-sm text-gray-500 mt-1">{stat.change}</p>}
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex flex-col gap-1">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <div className="flex items-center space-x-4 p-4 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{action.title}</h4>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest updates and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {activity.status === "success" && <CheckCircle className="w-5 h-5 text-green-500" />}
                    {activity.status === "pending" && <Clock className="w-5 h-5 text-orange-500" />}
                    {activity.status === "info" && <AlertCircle className="w-5 h-5 text-blue-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                  <Badge
                    variant={
                      activity.status === "success"
                        ? "default"
                        : activity.status === "pending"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {activity.status}
                  </Badge>
                </div>
              ))}
              {recentActivities.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No recent activities</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Current system health and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(systemStatus).map(([service, status]) => (
              <div key={service} className="text-center">
                <div className={`w-12 h-12 ${status === "operational" ? "bg-green-100" : "bg-red-100"} rounded-full flex items-center justify-center mx-auto mb-2`}>
                  <CheckCircle className={`w-6 h-6 ${status === "operational" ? "text-green-600" : "text-red-600"}`} />
                </div>
                <h4 className="font-medium text-gray-900">{service.charAt(0).toUpperCase() + service.slice(1)}</h4>
                <p className={`text-sm ${status === "operational" ? "text-green-600" : "text-red-600"}`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
