"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CalendarIcon,
  Clock,
  MapPin,
  Users,
  Video,
  Plus,
  Bell,
  CheckCircle,
  AlertCircle,
  CalendarIcon as CalendarLucide,
  Filter,
} from "lucide-react"
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday } from "date-fns"

interface ScheduleEvent {
  id: string
  title: string
  description: string
  date: string
  startTime: string
  endTime: string
  type: "meeting" | "training" | "deadline" | "presentation" | "review"
  location?: string
  attendees?: string[]
  isVirtual?: boolean
  meetingLink?: string
  status: "upcoming" | "ongoing" | "completed" | "cancelled"
  reminder?: boolean
}

export default function SchedulePage() {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month")

  // Mock schedule data
  const [events] = useState<ScheduleEvent[]>([
    {
      id: "1",
      title: "Weekly Team Standup",
      description: "Weekly progress review and planning session with the TRIOE development team",
      date: "2024-01-24",
      startTime: "09:00",
      endTime: "10:00",
      type: "meeting",
      location: "Conference Room A",
      attendees: ["Dr. Juan Dela Cruz", "Maria Santos", "John Doe"],
      status: "upcoming",
      reminder: true,
    },
    {
      id: "2",
      title: "React Training Session",
      description: "Advanced React patterns and best practices workshop",
      date: "2024-01-24",
      startTime: "14:00",
      endTime: "16:00",
      type: "training",
      isVirtual: true,
      meetingLink: "https://meet.google.com/abc-defg-hij",
      status: "upcoming",
      reminder: true,
    },
    {
      id: "3",
      title: "Accomplishment Report Deadline",
      description: "Submit weekly accomplishment report",
      date: "2024-01-25",
      startTime: "17:00",
      endTime: "17:00",
      type: "deadline",
      status: "upcoming",
      reminder: true,
    },
    {
      id: "4",
      title: "Project Presentation",
      description: "Present circuit board interface prototype to stakeholders",
      date: "2024-01-26",
      startTime: "10:00",
      endTime: "11:30",
      type: "presentation",
      location: "Main Conference Room",
      attendees: ["Dr. Juan Dela Cruz", "Project Stakeholders"],
      status: "upcoming",
      reminder: true,
    },
    {
      id: "5",
      title: "Code Review Session",
      description: "Review and discuss recent code contributions",
      date: "2024-01-23",
      startTime: "15:00",
      endTime: "16:00",
      type: "review",
      status: "completed",
      reminder: false,
    },
  ])

  const getEventTypeColor = (type: string) => {
    const colors = {
      meeting: "bg-blue-100 text-blue-800",
      training: "bg-green-100 text-green-800",
      deadline: "bg-red-100 text-red-800",
      presentation: "bg-purple-100 text-purple-800",
      review: "bg-orange-100 text-orange-800",
    }
    return colors[type as keyof typeof colors] || colors.meeting
  }

  const getStatusColor = (status: string) => {
    const colors = {
      upcoming: "bg-blue-100 text-blue-800",
      ongoing: "bg-green-100 text-green-800",
      completed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    }
    return colors[status as keyof typeof colors] || colors.upcoming
  }

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(new Date(event.date), date))
  }

  const getTodayEvents = () => {
    return events.filter((event) => isSameDay(new Date(event.date), new Date()))
  }

  const getUpcomingEvents = () => {
    const today = new Date()
    return events
      .filter((event) => new Date(event.date) >= today && event.status === "upcoming")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5)
  }

  const getWeekDays = () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 })
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }

  const handleEventClick = (event: ScheduleEvent) => {
    setSelectedEvent(event)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Schedule & Calendar</h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage your OJT schedule and upcoming events</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Today's Events Alert */}
      {getTodayEvents().length > 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <CalendarIcon className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            You have {getTodayEvents().length} event{getTodayEvents().length > 1 ? "s" : ""} scheduled for today.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
          <TabsTrigger value="today">Today's Schedule</TabsTrigger>
        </TabsList>

        {/* Calendar View */}
        <TabsContent value="calendar" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Calendar</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === "month" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("month")}
                    >
                      Month
                    </Button>
                    <Button
                      variant={viewMode === "week" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("week")}
                    >
                      Week
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {viewMode === "month" ? (
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border"
                    modifiers={{
                      hasEvents: (date) => getEventsForDate(date).length > 0,
                    }}
                    modifiersStyles={{
                      hasEvents: { backgroundColor: "#dbeafe", fontWeight: "bold" },
                    }}
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                        <div key={day} className="p-2">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {getWeekDays().map((day) => (
                        <div
                          key={day.toISOString()}
                          className={`p-2 border rounded-lg min-h-[100px] ${
                            isToday(day) ? "bg-blue-50 border-blue-200" : "bg-white"
                          }`}
                        >
                          <div className="text-sm font-medium mb-2">{format(day, "d")}</div>
                          <div className="space-y-1">
                            {getEventsForDate(day).map((event) => (
                              <div
                                key={event.id}
                                className="text-xs p-1 rounded bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200"
                                onClick={() => handleEventClick(event)}
                              >
                                {event.startTime} {event.title}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Selected Date Events */}
            <Card>
              <CardHeader>
                <CardTitle>{isToday(selectedDate) ? "Today's Events" : format(selectedDate, "MMMM d, yyyy")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getEventsForDate(selectedDate).map((event) => (
                    <div
                      key={event.id}
                      className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getEventTypeColor(event.type)} variant="secondary">
                          {event.type}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {event.startTime} - {event.endTime}
                        </span>
                      </div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      {event.location && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </div>
                      )}
                    </div>
                  ))}

                  {getEventsForDate(selectedDate).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <CalendarLucide className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No events scheduled for this date</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Upcoming Events */}
        <TabsContent value="upcoming" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Your scheduled events for the coming days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getUpcomingEvents().map((event) => (
                  <div
                    key={event.id}
                    className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{event.title}</h3>
                          <Badge className={getEventTypeColor(event.type)} variant="secondary">
                            {event.type}
                          </Badge>
                          {event.reminder && <Bell className="w-4 h-4 text-yellow-600" />}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{event.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4" />
                            {format(new Date(event.date), "MMM d, yyyy")}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {event.startTime} - {event.endTime}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {event.location}
                            </div>
                          )}
                          {event.isVirtual && (
                            <div className="flex items-center gap-1">
                              <Video className="w-4 h-4" />
                              Virtual
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status === "upcoming" && <Clock className="w-3 h-3 mr-1" />}
                        {event.status === "completed" && <CheckCircle className="w-3 h-3 mr-1" />}
                        {event.status === "cancelled" && <AlertCircle className="w-3 h-3 mr-1" />}
                        {event.status}
                      </Badge>
                    </div>
                  </div>
                ))}

                {getUpcomingEvents().length === 0 && (
                  <div className="text-center py-12">
                    <CalendarLucide className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming events</h3>
                    <p className="text-gray-600">Your schedule is clear for the coming days</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Today's Schedule */}
        <TabsContent value="today" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>{format(new Date(), "EEEE, MMMM d, yyyy")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getTodayEvents()
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((event) => (
                    <div
                      key={event.id}
                      className="border-l-4 border-blue-500 pl-4 py-3 bg-blue-50 rounded-r-lg cursor-pointer hover:bg-blue-100"
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getEventTypeColor(event.type)} variant="secondary">
                            {event.type}
                          </Badge>
                          <span className="font-medium text-lg">
                            {event.startTime} - {event.endTime}
                          </span>
                        </div>
                        {event.reminder && <Bell className="w-5 h-5 text-yellow-600" />}
                      </div>
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                      <p className="text-gray-700 mt-1">{event.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {event.location}
                          </div>
                        )}
                        {event.isVirtual && event.meetingLink && (
                          <div className="flex items-center gap-1">
                            <Video className="w-4 h-4" />
                            <a href={event.meetingLink} className="text-blue-600 hover:underline">
                              Join Meeting
                            </a>
                          </div>
                        )}
                        {event.attendees && (
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {event.attendees.length} attendees
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                {getTodayEvents().length === 0 && (
                  <div className="text-center py-12">
                    <CalendarLucide className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No events today</h3>
                    <p className="text-gray-600">Enjoy your free day!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Event Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
            <DialogDescription>{selectedEvent && `Details for "${selectedEvent.title}"`}</DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-6 mt-4">
              <div className="flex items-center gap-2">
                <Badge className={getEventTypeColor(selectedEvent.type)} variant="secondary">
                  {selectedEvent.type}
                </Badge>
                <Badge className={getStatusColor(selectedEvent.status)}>{selectedEvent.status}</Badge>
                {selectedEvent.reminder && (
                  <Badge variant="outline">
                    <Bell className="w-3 h-3 mr-1" />
                    Reminder Set
                  </Badge>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-xl">{selectedEvent.title}</h3>
                <p className="text-gray-600 mt-2">{selectedEvent.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Date:</span>
                    <span>{format(new Date(selectedEvent.date), "MMMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Time:</span>
                    <span>
                      {selectedEvent.startTime} - {selectedEvent.endTime}
                    </span>
                  </div>
                  {selectedEvent.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Location:</span>
                      <span>{selectedEvent.location}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {selectedEvent.isVirtual && selectedEvent.meetingLink && (
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Meeting Link:</span>
                      <a href={selectedEvent.meetingLink} className="text-blue-600 hover:underline">
                        Join Meeting
                      </a>
                    </div>
                  )}
                  {selectedEvent.attendees && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">Attendees:</span>
                      </div>
                      <div className="space-y-1">
                        {selectedEvent.attendees.map((attendee, index) => (
                          <div key={index} className="text-sm text-gray-600 ml-6">
                            {attendee}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Close
                </Button>
                {selectedEvent.isVirtual && selectedEvent.meetingLink && (
                  <Button asChild>
                    <a href={selectedEvent.meetingLink} target="_blank" rel="noopener noreferrer">
                      <Video className="w-4 h-4 mr-2" />
                      Join Meeting
                    </a>
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
