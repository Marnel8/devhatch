"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useSound } from "@/hooks/use-sound"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { QrScanner } from "../../components/QrScanner"
import {
  QrCode,
  Camera,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Users,
  Calendar,
  Volume2,
  VolumeX,
} from "lucide-react"
import { attendanceService, type AttendanceRecord } from "../../services/attendance"
import { format } from "date-fns"

export default function QRScannerPage() {
  const { user } = useAuth()
  const { playSuccessSound, playErrorSound, playNotificationSound } = useSound()
  const [scanResult, setScanResult] = useState<any>(null)
  const [manualEntry, setManualEntry] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isScanning, setIsScanning] = useState(false)
  const [recentScans, setRecentScans] = useState<AttendanceRecord[]>([])
  const [todayStats, setTodayStats] = useState({
    totalScans: 0,
    checkedIn: 0,
    checkedOut: 0,
    activeStudents: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  // Load initial data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [stats, recent] = await Promise.all([
        attendanceService.getTodayStats(),
        attendanceService.getRecentAttendance(10),
      ])
      setTodayStats(stats)
      setRecentScans(recent)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQrCodeResult = async (result: string) => {
    try {
      // Validate QR code and get student info
      const validation = await attendanceService.validateStudentQR(result)
      
      if (!validation.isValid || !validation.studentData) {
        setScanResult({
          success: false,
          message: validation.message || "Invalid QR code",
        })
        if (soundEnabled) {
          playErrorSound()
        }
        return
      }

      // Record attendance
      const attendance = await attendanceService.recordAttendance({
        studentId: validation.studentData.id,
        studentName: validation.studentData.name,
        ojtNumber: validation.studentData.ojtNumber,
        project: validation.studentData.project,
      })

      setScanResult({
        success: true,
        ...attendance,
      })

      if (soundEnabled) {
        playSuccessSound()
      }

      // Refresh data
      loadData()
    } catch (error) {
      console.error("Error processing QR code:", error)
      setScanResult({
        success: false,
        message: "Failed to process QR code. Please try again.",
      })

      if (soundEnabled) {
        playErrorSound()
      }
    }
  }

  const handleQrCodeError = (error: string) => {
    console.error("QR Scanner error:", error)
    setScanResult({
      success: false,
      message: "Failed to scan QR code. Please try again.",
    })

    if (soundEnabled) {
      playErrorSound()
    }
  }

  const handleManualEntry = async () => {
    if (!manualEntry.trim()) return

    try {
      const validation = await attendanceService.validateStudentQR(manualEntry.trim())
      
      if (!validation.isValid || !validation.studentData) {
        setScanResult({
          success: false,
          message: validation.message || "Invalid OJT number",
        })
        if (soundEnabled) {
          playErrorSound()
        }
        return
      }

      // Record attendance
      const attendance = await attendanceService.recordAttendance({
        studentId: validation.studentData.id,
        studentName: validation.studentData.name,
        ojtNumber: validation.studentData.ojtNumber,
        project: validation.studentData.project,
      })

      setScanResult({
        success: true,
        ...attendance,
      })

      if (soundEnabled) {
        playSuccessSound()
      }

      // Refresh data
      loadData()
    } catch (error) {
      console.error("Error processing manual entry:", error)
      setScanResult({
        success: false,
        message: "Failed to process OJT number. Please try again.",
      })

      if (soundEnabled) {
        playErrorSound()
      }
    }

    setManualEntry("")
  }

  const filteredScans = recentScans.filter((scan) => {
    const matchesSearch =
      scan.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.ojtNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || scan.status === filterStatus
    return matchesSearch && matchesFilter
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

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-8">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-gray-600">Only administrators can access the QR scanner.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">QR Code Scanner</h1>
          <p className="text-gray-600 text-sm sm:text-base">Scan student QR codes for attendance tracking</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Sound Toggle */}
          <div className="flex items-center gap-2">
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-gray-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-gray-400" />
            )}
            <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} aria-label="Toggle sound effects" />
            <span className="text-sm text-gray-600">Sound</span>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Users className="w-3 h-3 mr-1" />
              {todayStats.activeStudents} Active
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Calendar className="w-3 h-3 mr-1" />
              {todayStats.totalScans} Scans Today
            </Badge>
          </div>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Scans</p>
                <p className="text-2xl font-bold">{todayStats.totalScans}</p>
              </div>
              <QrCode className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Checked In</p>
                <p className="text-2xl font-bold">{todayStats.checkedIn}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Checked Out</p>
                <p className="text-2xl font-bold">{todayStats.checkedOut}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Now</p>
                <p className="text-2xl font-bold">{todayStats.activeStudents}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
        {/* QR Scanner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              QR Code Scanner
            </CardTitle>
            <CardDescription>Scan student QR codes for attendance tracking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Real QR Scanner */}
            <QrScanner onResult={handleQrCodeResult} onError={handleQrCodeError} />

            {/* Scan Result */}
            {scanResult && (
              <Alert className={scanResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                {scanResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={scanResult.success ? "text-green-800" : "text-red-800"}>
                  {scanResult.success ? (
                    <div>
                      <strong>✅ Scan Successful!</strong>
                      <div className="mt-2 space-y-1 text-sm">
                        <p>
                          <strong>Student:</strong> {scanResult.studentName}
                        </p>
                        <p>
                          <strong>OJT Number:</strong> {scanResult.ojtNumber}
                        </p>
                        <p>
                          <strong>Action:</strong> {scanResult.action}
                        </p>
                        <p>
                          <strong>Time:</strong> {format(scanResult.timestamp, "hh:mm a")}
                        </p>
                        <p>
                          <strong>Project:</strong> {scanResult.project}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <strong>❌ Scan Failed!</strong>
                      <p className="mt-1">{scanResult.message}</p>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Manual Entry */}
            <div className="border-t pt-6">
              <h4 className="font-medium mb-3">Manual Entry</h4>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="manual-entry" className="sr-only">
                    OJT Number
                  </Label>
                  <Input
                    id="manual-entry"
                    placeholder="Enter OJT Number (e.g., OJT-2024-001)"
                    value={manualEntry}
                    onChange={(e) => setManualEntry(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleManualEntry()}
                  />
                </div>
                <Button onClick={handleManualEntry} disabled={!manualEntry.trim()}>
                  Submit
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Format: OJT-YYYY-XXX (e.g., OJT-2024-001)</p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Scans */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Attendance Scans</CardTitle>
            <CardDescription>Latest QR code scans and attendance records</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-32">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in">Checked In</SelectItem>
                  <SelectItem value="out">Checked Out</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Scans List */}
            <div className="space-y-3 overflow-y-auto">
              {filteredScans.map((scan) => (
                <div key={scan.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{scan.studentName}</h4>
                      <Badge variant="outline" className="text-xs">
                        {scan.ojtNumber}
                      </Badge>
                    </div>
                    <Badge
                      className={scan.status === "in" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}
                    >
                      {scan.status === "in" ? "Checked In" : "Checked Out"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <div className="flex items-center gap-3">
                      <span>
                        {scan.action} at {format(scan.timestamp, "hh:mm a")}
                      </span>
                      <Badge className={getProjectColor(scan.project)} variant="secondary">
                        {scan.project}
                      </Badge>
                    </div>
                    <span>{format(scan.timestamp, "MMM dd, yyyy")}</span>
                  </div>
                </div>
              ))}

              {filteredScans.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <QrCode className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No scans found matching your criteria</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
