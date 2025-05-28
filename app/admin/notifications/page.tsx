"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { notificationsService, type Notification } from "@/lib/notifications-service"
import {
  Bell,
  Send,
  Mail,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Search,
  Settings,
  Eye,
  Trash2,
  Loader2,
} from "lucide-react"

export default function NotificationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [composeDialogOpen, setComposeDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [composingNotification, setComposingNotification] = useState({
    type: "",
    priority: "",
    recipients: [] as string[],
    title: "",
    message: "",
    scheduledFor: "",
  })
  const [isScheduled, setIsScheduled] = useState(false)

  const { toast } = useToast()
  const { user } = useAuth()

  // Load notifications
  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const data = await notificationsService.getNotifications()
      setNotifications(data)
    } catch (error) {
      console.error("Error loading notifications:", error)
      toast({
        title: "Error",
        description: "Failed to load notifications. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Mock notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    systemNotifications: true,
    autoReminders: true,
    weeklyReports: true,
    applicationUpdates: true,
    attendanceAlerts: true,
  })

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || notification.type === typeFilter
    const matchesStatus = statusFilter === "all" || notification.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800"
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="w-4 h-4" />
      case "scheduled":
        return <Clock className="w-4 h-4" />
      case "draft":
        return <MessageSquare className="w-4 h-4" />
      case "failed":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <MessageSquare className="w-4 h-4" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="w-4 h-4" />
      case "sms":
        return <MessageSquare className="w-4 h-4" />
      case "system":
        return <Bell className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const handleViewNotification = (notification: Notification) => {
    setSelectedNotification(notification)
    setViewDialogOpen(true)
  }

  const handleComposeNotification = () => {
    setComposingNotification({
      type: "",
      priority: "",
      recipients: [],
      title: "",
      message: "",
      scheduledFor: "",
    })
    setIsScheduled(false)
    setComposeDialogOpen(true)
  }

  const handleDeleteNotification = async (id: string) => {
    try {
      await notificationsService.deleteNotification(id)
      toast({
        title: "Success",
        description: "Notification deleted successfully",
      })
      loadNotifications()
    } catch (error) {
      console.error("Error deleting notification:", error)
      toast({
        title: "Error",
        description: "Failed to delete notification. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSendNotification = async (notification: Notification) => {
    try {
      await notificationsService.sendNotification(notification.id)
      toast({
        title: "Success",
        description: "Notification sent successfully",
      })
      loadNotifications()
    } catch (error) {
      console.error("Error sending notification:", error)
      toast({
        title: "Error",
        description: "Failed to send notification. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCreateNotification = async (isDraft: boolean = false) => {
    try {
      if (!user) {
        throw new Error("User not authenticated")
      }

      const notification: Omit<Notification, "id"> = {
        ...composingNotification,
        status: isDraft ? "draft" : isScheduled ? "scheduled" : "sent",
        priority: composingNotification.priority as "low" | "medium" | "high",
        type: composingNotification.type as "email" | "system" | "sms",
        createdBy: user.id,
        totalRecipients: composingNotification.recipients.length,
        readCount: 0,
        createdAt: new Date().toISOString(),
        ...(isScheduled && { scheduledFor: composingNotification.scheduledFor }),
        ...(!isDraft && !isScheduled && { sentAt: new Date().toISOString() }),
      }

      await notificationsService.createNotification(notification)
      toast({
        title: "Success",
        description: isDraft
          ? "Notification saved as draft"
          : isScheduled
          ? "Notification scheduled successfully"
          : "Notification sent successfully",
      })
      setComposeDialogOpen(false)
      loadNotifications()
    } catch (error) {
      console.error("Error creating notification:", error)
      toast({
        title: "Error",
        description: "Failed to create notification. Please try again.",
        variant: "destructive",
      })
    }
  }

  const stats = {
    total: notifications.length,
    sent: notifications.filter((n) => n.status === "sent").length,
    scheduled: notifications.filter((n) => n.status === "scheduled").length,
    drafts: notifications.filter((n) => n.status === "draft").length,
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Notifications</h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage and send notifications to students and staff</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSettingsDialogOpen(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button onClick={handleComposeNotification}>
            <Plus className="w-4 h-4 mr-2" />
            Compose
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sent</p>
                <p className="text-2xl font-bold">{stats.sent}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold">{stats.scheduled}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
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
              <MessageSquare className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Bell className="h-8 w-8 text-purple-600" />
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
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Showing {filteredNotifications.length} of {notifications.length} notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{notification.title}</h3>
                        <Badge className={getPriorityColor(notification.priority)} variant="secondary">
                          {notification.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{notification.message}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>Created: {new Date(notification.createdAt).toLocaleDateString()}</span>
                        <span>Recipients: {notification.totalRecipients}</span>
                        {notification.readCount !== undefined && (
                          <span>
                            Read: {notification.readCount}/{notification.totalRecipients}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Badge className={getStatusColor(notification.status)}>
                      {getStatusIcon(notification.status)}
                      <span className="ml-1 capitalize">{notification.status}</span>
                    </Badge>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewNotification(notification)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      {notification.status === "draft" && (
                        <Button size="sm" onClick={() => handleSendNotification(notification)}>
                          <Send className="w-4 h-4 mr-2" />
                          Send
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteNotification(notification.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredNotifications.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                  <p className="text-gray-600">
                    {searchTerm || typeFilter !== "all" || statusFilter !== "all"
                      ? "Try adjusting your search criteria"
                      : "No notifications have been created yet"}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compose Notification Dialog */}
      <Dialog open={composeDialogOpen} onOpenChange={setComposeDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Compose Notification</DialogTitle>
            <DialogDescription>Create and send a new notification to students or staff</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="notificationType">Type</Label>
                <Select
                  value={composingNotification.type}
                  onValueChange={(value) =>
                    setComposingNotification((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="system">System Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={composingNotification.priority}
                  onValueChange={(value) =>
                    setComposingNotification((prev) => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
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
              <Label htmlFor="recipients">Recipients</Label>
              <Select
                value={composingNotification.recipients[0]}
                onValueChange={(value) =>
                  setComposingNotification((prev) => ({ ...prev, recipients: [value] }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recipients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-students">All Students</SelectItem>
                  <SelectItem value="active-students">Active Students</SelectItem>
                  <SelectItem value="trioe-students">TRIOE Students</SelectItem>
                  <SelectItem value="mrmed-students">MR. MED Students</SelectItem>
                  <SelectItem value="haptics-students">HAPTICS Students</SelectItem>
                  <SelectItem value="all-users">All Users</SelectItem>
                  <SelectItem value="custom">Custom Selection</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter notification title..."
                value={composingNotification.title}
                onChange={(e) =>
                  setComposingNotification((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Enter your message..."
                rows={6}
                value={composingNotification.message}
                onChange={(e) =>
                  setComposingNotification((prev) => ({ ...prev, message: e.target.value }))
                }
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="schedule"
                  checked={isScheduled}
                  onCheckedChange={(checked) => setIsScheduled(checked as boolean)}
                />
                <Label htmlFor="schedule">Schedule for later</Label>
              </div>
              {isScheduled && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="scheduleDate">Date</Label>
                    <Input
                      id="scheduleDate"
                      type="date"
                      value={composingNotification.scheduledFor.split("T")[0]}
                      onChange={(e) =>
                        setComposingNotification((prev) => ({
                          ...prev,
                          scheduledFor: `${e.target.value}T${
                            prev.scheduledFor.split("T")[1] || "00:00"
                          }`,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheduleTime">Time</Label>
                    <Input
                      id="scheduleTime"
                      type="time"
                      value={composingNotification.scheduledFor.split("T")[1] || ""}
                      onChange={(e) =>
                        setComposingNotification((prev) => ({
                          ...prev,
                          scheduledFor: `${
                            prev.scheduledFor.split("T")[0] || new Date().toISOString().split("T")[0]
                          }T${e.target.value}`,
                        }))
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setComposeDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="outline" onClick={() => handleCreateNotification(true)}>
                Save as Draft
              </Button>
              <Button onClick={() => handleCreateNotification(false)}>
                {isScheduled ? "Schedule" : "Send Now"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Notification Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Notification Details</DialogTitle>
            <DialogDescription>
              {selectedNotification && `View details for "${selectedNotification.title}"`}
            </DialogDescription>
          </DialogHeader>

          {selectedNotification && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Type</span>
                  <div className="flex items-center gap-2 mt-1">
                    {getTypeIcon(selectedNotification.type)}
                    <span className="capitalize">{selectedNotification.type}</span>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Priority</span>
                  <div className="mt-1">
                    <Badge className={getPriorityColor(selectedNotification.priority)} variant="secondary">
                      {selectedNotification.priority}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Status</span>
                  <div className="mt-1">
                    <Badge className={getStatusColor(selectedNotification.status)}>
                      {getStatusIcon(selectedNotification.status)}
                      <span className="ml-1 capitalize">{selectedNotification.status}</span>
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Recipients</span>
                  <p className="font-medium mt-1">{selectedNotification.totalRecipients}</p>
                </div>
              </div>

              <div>
                <span className="text-sm text-gray-600">Title</span>
                <p className="font-medium mt-1">{selectedNotification.title}</p>
              </div>

              <div>
                <span className="text-sm text-gray-600">Message</span>
                <div className="bg-gray-50 p-4 rounded-lg mt-1">
                  <p className="whitespace-pre-wrap">{selectedNotification.message}</p>
                </div>
              </div>

              {selectedNotification.readCount !== undefined && (
                <div>
                  <span className="text-sm text-gray-600">Read Statistics</span>
                  <div className="mt-2 p-4 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span>Read Rate</span>
                      <span className="font-medium">
                        {Math.round((selectedNotification.readCount / selectedNotification.totalRecipients!) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(selectedNotification.readCount / selectedNotification.totalRecipients!) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedNotification.readCount} of {selectedNotification.totalRecipients} recipients have read
                      this notification
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                  Close
                </Button>
                {selectedNotification.status === "draft" && (
                  <Button onClick={() => handleSendNotification(selectedNotification)}>
                    <Send className="w-4 h-4 mr-2" />
                    Send Now
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Notification Settings</DialogTitle>
            <DialogDescription>Configure notification preferences and automation</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            <div className="space-y-4">
              <h4 className="font-medium">Notification Types</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <Switch
                    id="emailNotifications"
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, emailNotifications: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="smsNotifications">SMS Notifications</Label>
                  <Switch
                    id="smsNotifications"
                    checked={notificationSettings.smsNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, smsNotifications: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="systemNotifications">System Notifications</Label>
                  <Switch
                    id="systemNotifications"
                    checked={notificationSettings.systemNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, systemNotifications: checked }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Automated Notifications</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="autoReminders">Auto Reminders</Label>
                  <Switch
                    id="autoReminders"
                    checked={notificationSettings.autoReminders}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, autoReminders: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="weeklyReports">Weekly Reports</Label>
                  <Switch
                    id="weeklyReports"
                    checked={notificationSettings.weeklyReports}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, weeklyReports: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="applicationUpdates">Application Updates</Label>
                  <Switch
                    id="applicationUpdates"
                    checked={notificationSettings.applicationUpdates}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, applicationUpdates: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="attendanceAlerts">Attendance Alerts</Label>
                  <Switch
                    id="attendanceAlerts"
                    checked={notificationSettings.attendanceAlerts}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, attendanceAlerts: checked }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setSettingsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setSettingsDialogOpen(false)}>Save Settings</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
