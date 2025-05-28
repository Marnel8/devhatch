"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Bell,
  CheckCircle,
  Clock,
  AlertCircle,
  Info,
  Award,
  Calendar,
  Settings,
  Trash2,
  BookMarkedIcon as MarkAsUnread,
} from "lucide-react"
import { format } from "date-fns"

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error" | "reminder"
  category: "system" | "attendance" | "accomplishments" | "schedule" | "general"
  isRead: boolean
  createdAt: string
  actionUrl?: string
  actionText?: string
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("all")
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Accomplishment Approved",
      message: "Your accomplishment 'Completed React Component Library' has been approved by your supervisor.",
      type: "success",
      category: "accomplishments",
      isRead: false,
      createdAt: "2024-01-24T10:30:00Z",
      actionUrl: "/dashboard/accomplishments",
      actionText: "View Accomplishment",
    },
    {
      id: "2",
      title: "Attendance Reminder",
      message: "Don't forget to check in for today's OJT session. Remember to scan the QR code when you arrive.",
      type: "reminder",
      category: "attendance",
      isRead: false,
      createdAt: "2024-01-24T08:00:00Z",
      actionUrl: "/qr",
      actionText: "Scan QR Code",
    },
    {
      id: "3",
      title: "Weekly Report Due",
      message: "Your weekly accomplishment report is due tomorrow. Please submit your progress summary.",
      type: "warning",
      category: "accomplishments",
      isRead: true,
      createdAt: "2024-01-23T16:00:00Z",
      actionUrl: "/dashboard/accomplishments",
      actionText: "Submit Report",
    },
    {
      id: "4",
      title: "Team Meeting Scheduled",
      message: "A new team meeting has been scheduled for tomorrow at 2:00 PM in Conference Room A.",
      type: "info",
      category: "schedule",
      isRead: true,
      createdAt: "2024-01-23T14:30:00Z",
      actionUrl: "/dashboard/schedule",
      actionText: "View Schedule",
    },
    {
      id: "5",
      title: "System Maintenance",
      message: "The system will undergo maintenance this weekend from 10 PM to 2 AM. Some features may be unavailable.",
      type: "info",
      category: "system",
      isRead: false,
      createdAt: "2024-01-22T12:00:00Z",
    },
    {
      id: "6",
      title: "Profile Update Required",
      message: "Please update your emergency contact information in your profile settings.",
      type: "warning",
      category: "general",
      isRead: true,
      createdAt: "2024-01-21T09:15:00Z",
      actionUrl: "/dashboard/profile",
      actionText: "Update Profile",
    },
  ])

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    attendanceReminders: true,
    accomplishmentUpdates: true,
    scheduleChanges: true,
    systemUpdates: false,
  })

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case "reminder":
        return <Clock className="w-5 h-5 text-blue-600" />
      default:
        return <Info className="w-5 h-5 text-gray-600" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "attendance":
        return <Clock className="w-4 h-4" />
      case "accomplishments":
        return <Award className="w-4 h-4" />
      case "schedule":
        return <Calendar className="w-4 h-4" />
      case "system":
        return <Settings className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    const colors = {
      success: "bg-green-100 text-green-800",
      warning: "bg-yellow-100 text-yellow-800",
      error: "bg-red-100 text-red-800",
      reminder: "bg-blue-100 text-blue-800",
      info: "bg-gray-100 text-gray-800",
    }
    return colors[type as keyof typeof colors] || colors.info
  }

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return !notification.isRead
    if (activeTab === "read") return notification.isRead
    return notification.category === activeTab
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, isRead: true } : notification)),
    )
  }

  const markAsUnread = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, isRead: false } : notification)),
    )
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })))
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Notifications</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Stay updated with your OJT progress and important announcements
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              Mark All as Read
            </Button>
          )}
          <Badge variant="secondary" className="px-3 py-1">
            {unreadCount} unread
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="accomplishments">Tasks</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* Notifications List */}
        <TabsContent value={activeTab} className="space-y-4">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-all hover:shadow-md ${
                  !notification.isRead ? "border-l-4 border-l-blue-500 bg-blue-50/30" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-semibold ${!notification.isRead ? "text-gray-900" : "text-gray-700"}`}>
                              {notification.title}
                            </h3>
                            <Badge className={getTypeColor(notification.type)} variant="secondary">
                              {notification.type}
                            </Badge>
                            <div className="flex items-center gap-1 text-gray-500">
                              {getCategoryIcon(notification.category)}
                              <span className="text-xs capitalize">{notification.category}</span>
                            </div>
                          </div>
                          <p className={`text-sm ${!notification.isRead ? "text-gray-800" : "text-gray-600"} mb-2`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {format(new Date(notification.createdAt), "MMM d, yyyy 'at' h:mm a")}
                            </span>
                            {notification.actionUrl && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={notification.actionUrl}>{notification.actionText}</a>
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {!notification.isRead ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              title="Mark as read"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsUnread(notification.id)}
                              title="Mark as unread"
                            >
                              <MarkAsUnread className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            title="Delete notification"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                <p className="text-gray-600">
                  {activeTab === "unread"
                    ? "You're all caught up! No unread notifications."
                    : "No notifications in this category."}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Notification Settings */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>Customize how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Delivery Methods</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <Switch
                      id="email-notifications"
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({ ...prev, emailNotifications: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <Switch
                      id="push-notifications"
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({ ...prev, pushNotifications: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Notification Types</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="attendance-reminders">Attendance Reminders</Label>
                    <Switch
                      id="attendance-reminders"
                      checked={notificationSettings.attendanceReminders}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({ ...prev, attendanceReminders: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="accomplishment-updates">Accomplishment Updates</Label>
                    <Switch
                      id="accomplishment-updates"
                      checked={notificationSettings.accomplishmentUpdates}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({ ...prev, accomplishmentUpdates: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="schedule-changes">Schedule Changes</Label>
                    <Switch
                      id="schedule-changes"
                      checked={notificationSettings.scheduleChanges}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({ ...prev, scheduleChanges: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="system-updates">System Updates</Label>
                    <Switch
                      id="system-updates"
                      checked={notificationSettings.systemUpdates}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({ ...prev, systemUpdates: checked }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button className="w-full sm:w-auto">Save Notification Preferences</Button>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  )
}
