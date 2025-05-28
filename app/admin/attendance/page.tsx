"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
  Search,
  Calendar,
  Clock,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Download,
  Plus,
} from "lucide-react"
import type { AttendanceRecord, AttendanceSummary } from "@/types"
import { subscribeToAttendanceRecords, getAttendanceSummary, addAttendanceRecord, updateAttendanceRecord } from "@/lib/firebase/attendance"
import { format } from "date-fns"

export default function AttendancePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [projectFilter, setProjectFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [manualEntryOpen, setManualEntryOpen] = useState(false)
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [summary, setSummary] = useState<AttendanceSummary>({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    lateArrivals: 0,
    earlyDepartures: 0,
    averageHours: 0,
    attendanceRate: 0,
  })

  useEffect(() => {
    const unsubscribe = subscribeToAttendanceRecords(dateFilter, (records) => {
      setAttendanceRecords(records);
    });

    return () => unsubscribe();
  }, [dateFilter]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const summaryData = await getAttendanceSummary(dateFilter);
        setSummary(summaryData);
      } catch (error) {
        console.error('Error fetching summary:', error);
        toast.error('Failed to load attendance summary');
      }
    };

    fetchSummary();
  }, [dateFilter, attendanceRecords]);

  const filteredRecords = attendanceRecords.filter((record) => {
    const matchesSearch =
      record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.ojtNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesProject = projectFilter === "all" || record.project === projectFilter
    const matchesStatus = statusFilter === "all" || record.status === statusFilter
    return matchesSearch && matchesProject && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "complete":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "incomplete":
        return "bg-yellow-100 text-yellow-800"
      case "absent":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "complete":
        return <CheckCircle className="w-4 h-4" />
      case "in-progress":
        return <Clock className="w-4 h-4" />
      case "incomplete":
        return <AlertTriangle className="w-4 h-4" />
      case "absent":
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const handleEditRecord = (record: AttendanceRecord) => {
    setSelectedRecord(record)
    setEditDialogOpen(true)
  }

  const handleManualEntry = () => {
    setManualEntryOpen(true)
  }

  const handleSaveEdit = async (record: AttendanceRecord) => {
    try {
      await updateAttendanceRecord(record.id, record);
      setEditDialogOpen(false);
      toast.success('Attendance record updated successfully');
    } catch (error) {
      console.error('Error updating record:', error);
      toast.error('Failed to update attendance record');
    }
  }

  const handleAddRecord = async (record: Omit<AttendanceRecord, 'id'>) => {
    try {
      await addAttendanceRecord(record);
      setManualEntryOpen(false);
      toast.success('Attendance record added successfully');
    } catch (error) {
      console.error('Error adding record:', error);
      toast.error('Failed to add attendance record');
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Attendance Management</h1>
          <p className="text-gray-600 text-sm sm:text-base">Monitor and manage student attendance records</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleManualEntry}>
            <Plus className="w-4 h-4 mr-2" />
            Manual Entry
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Present Today</p>
                <p className="text-2xl font-bold">{summary.presentToday}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {summary.attendanceRate.toFixed(1)}% rate
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Absent Today</p>
                <p className="text-2xl font-bold">{summary.absentToday}</p>
                <p className="text-xs text-red-600 flex items-center mt-1">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Needs follow-up
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Late Arrivals</p>
                <p className="text-2xl font-bold">{summary.lateArrivals}</p>
                <p className="text-xs text-yellow-600 flex items-center mt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  After 9:00 AM
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Hours</p>
                <p className="text-2xl font-bold">{summary.averageHours.toFixed(1)}</p>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Per student
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
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
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full sm:w-48"
            />
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
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="incomplete">Incomplete</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>
            Showing {filteredRecords.length} of {attendanceRecords.length} records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRecords.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{record.studentName}</h3>
                    <p className="text-sm text-gray-600">{record.ojtNumber}</p>
                    <Badge className="mt-1" variant="outline">
                      {record.project}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-sm font-medium">Time In</p>
                    <p className="text-sm text-gray-600">
                      {record.timeIn ? new Date(record.timeIn).toLocaleTimeString() : "—"}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Time Out</p>
                    <p className="text-sm text-gray-600">
                      {record.timeOut ? new Date(record.timeOut).toLocaleTimeString() : "—"}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Hours</p>
                    <p className="text-sm text-gray-600">{record.hoursWorked?.toFixed(1) || "—"}</p>
                  </div>
                  <div className="text-center">
                    <Badge className={getStatusColor(record.status)}>
                      {getStatusIcon(record.status)}
                      <span className="ml-1 capitalize">{record.status.replace("-", " ")}</span>
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditRecord(record)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredRecords.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records found</h3>
              <p className="text-gray-600">
                {searchTerm || projectFilter !== "all" || statusFilter !== "all"
                  ? "Try adjusting your search criteria"
                  : "No attendance records for the selected date"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Record Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Attendance Record</DialogTitle>
            <DialogDescription>
              {selectedRecord && `Update attendance for ${selectedRecord.studentName}`}
            </DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timeIn">Time In</Label>
                  <Input
                    id="timeIn"
                    type="time"
                    defaultValue={
                      selectedRecord.timeIn ? new Date(selectedRecord.timeIn).toTimeString().slice(0, 5) : ""
                    }
                    onChange={(e) => {
                      if (selectedRecord) {
                        const [hours, minutes] = e.target.value.split(':');
                        const date = new Date(selectedRecord.date);
                        date.setHours(parseInt(hours), parseInt(minutes));
                        setSelectedRecord({
                          ...selectedRecord,
                          timeIn: date.toISOString(),
                        });
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeOut">Time Out</Label>
                  <Input
                    id="timeOut"
                    type="time"
                    defaultValue={
                      selectedRecord.timeOut ? new Date(selectedRecord.timeOut).toTimeString().slice(0, 5) : ""
                    }
                    onChange={(e) => {
                      if (selectedRecord) {
                        const [hours, minutes] = e.target.value.split(':');
                        const date = new Date(selectedRecord.date);
                        date.setHours(parseInt(hours), parseInt(minutes));
                        setSelectedRecord({
                          ...selectedRecord,
                          timeOut: date.toISOString(),
                        });
                      }
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={selectedRecord.status}
                  onValueChange={(value) => {
                    setSelectedRecord({
                      ...selectedRecord,
                      status: value as AttendanceRecord['status'],
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="complete">Complete</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="incomplete">Incomplete</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Add any notes about this attendance record..." 
                  rows={3}
                  value={selectedRecord.notes || ''}
                  onChange={(e) => {
                    setSelectedRecord({
                      ...selectedRecord,
                      notes: e.target.value,
                    });
                  }}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleSaveEdit(selectedRecord)}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Manual Entry Dialog */}
      <Dialog open={manualEntryOpen} onOpenChange={setManualEntryOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manual Attendance Entry</DialogTitle>
            <DialogDescription>Add attendance record manually for a student</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="student">Student</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student1">Maria Santos (OJT-2024-001)</SelectItem>
                  <SelectItem value="student2">John Dela Cruz (OJT-2024-002)</SelectItem>
                  <SelectItem value="student3">Anna Reyes (OJT-2024-003)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manualTimeIn">Time In</Label>
                <Input id="manualTimeIn" type="time" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manualTimeOut">Time Out</Label>
                <Input id="manualTimeOut" type="time" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manualNotes">Notes</Label>
              <Textarea id="manualNotes" placeholder="Reason for manual entry..." rows={3} />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setManualEntryOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                // TODO: Implement manual entry submission
                setManualEntryOpen(false)
              }}>
                Add Record
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
