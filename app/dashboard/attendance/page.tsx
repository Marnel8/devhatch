"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, CalendarIcon, TrendingUp, QrCode } from "lucide-react"
import type { AttendanceRecord } from "@/types"

export default function AttendancePage() {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  // Mock attendance data
  const [attendanceRecords] = useState<AttendanceRecord[]>([
    {
      id: "1",
      studentId: "student1",
      ojtNumber: "OJT-2024-001",
      timeIn: "2024-01-22T08:30:00",
      timeOut: "2024-01-22T17:00:00",
      date: "2024-01-22",
      hoursWorked: 8.5,
    },
    {
      id: "2",
      studentId: "student1",
      ojtNumber: "OJT-2024-001",
      timeIn: "2024-01-21T08:45:00",
      timeOut: "2024-01-21T17:15:00",
      date: "2024-01-21",
      hoursWorked: 8.5,
    },
    {
      id: "3",
      studentId: "student1",
      ojtNumber: "OJT-2024-001",
      timeIn: "2024-01-20T08:30:00",
      timeOut: "2024-01-20T17:00:00",
      date: "2024-01-20",
      hoursWorked: 8.5,
    },
  ])

  const totalHoursThisWeek = attendanceRecords
    .filter((record) => {
      const recordDate = new Date(record.date)
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      return recordDate >= weekStart
    })
    .reduce((total, record) => total + (record.hoursWorked || 0), 0)

  const totalHoursThisMonth = attendanceRecords
    .filter((record) => {
      const recordDate = new Date(record.date)
      const now = new Date()
      return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear()
    })
    .reduce((total, record) => total + (record.hoursWorked || 0), 0)

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Attendance Tracking</h1>
          <p className="text-gray-600 text-sm sm:text-base">Monitor your OJT attendance and hours</p>
        </div>
        <Button className="w-full sm:w-auto">
          <QrCode className="w-4 h-4 mr-2" />
          QR Scanner
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold">{totalHoursThisWeek}h</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold">{totalHoursThisMonth}h</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold">156h</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="records" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="records">Attendance Records</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Attendance</CardTitle>
              <CardDescription>Your latest attendance records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attendanceRecords.map((record) => (
                  <div key={record.id} className="border rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{formatDate(record.date)}</h3>
                          <Badge variant="outline">{record.ojtNumber}</Badge>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Time In:</span>
                            <p className="font-medium">{formatTime(record.timeIn)}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Time Out:</span>
                            <p className="font-medium">{record.timeOut ? formatTime(record.timeOut) : "Not yet"}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Hours:</span>
                            <p className="font-medium">{record.hoursWorked || 0}h</p>
                          </div>
                        </div>
                      </div>
                      <Badge
                        className={record.timeOut ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                      >
                        {record.timeOut ? "Complete" : "In Progress"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Calendar</CardTitle>
                <CardDescription>Select a date to view attendance details</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{selectedDate ? formatDate(selectedDate.toISOString()) : "Select a Date"}</CardTitle>
                <CardDescription>Attendance details for selected date</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedDate && (
                  <div className="space-y-4">
                    {attendanceRecords
                      .filter((record) => new Date(record.date).toDateString() === selectedDate.toDateString())
                      .map((record) => (
                        <div key={record.id} className="border rounded-lg p-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Time In:</span>
                              <p className="font-medium">{formatTime(record.timeIn)}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Time Out:</span>
                              <p className="font-medium">{record.timeOut ? formatTime(record.timeOut) : "Not yet"}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Hours Worked:</span>
                              <p className="font-medium">{record.hoursWorked || 0} hours</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Status:</span>
                              <Badge
                                className={
                                  record.timeOut ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                }
                              >
                                {record.timeOut ? "Complete" : "In Progress"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}

                    {attendanceRecords.filter(
                      (record) => new Date(record.date).toDateString() === selectedDate.toDateString(),
                    ).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No attendance record for this date</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
