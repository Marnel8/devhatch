"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { QrCode, Clock, CheckCircle, AlertCircle } from "lucide-react"

export default function QRPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [qrCode, setQrCode] = useState<string>("")
  const [attendanceStatus, setAttendanceStatus] = useState<"checked-in" | "checked-out" | null>(null)
  const [lastAction, setLastAction] = useState<string>("")

  useEffect(() => {
    if (!loading && user) {
      // Redirect admin users to the admin QR scanner
      if (user.role === "superadmin" || user.role === "project_admin") {
        router.push("/admin/qr-scanner")
        return
      }

      // Generate QR code for student
      if (user.role === "student") {
        const studentQR = `OJT-${user.id}-${Date.now()}`
        setQrCode(studentQR)
      }
    }
  }, [user, loading, router])

  const generateQRCodeSVG = (text: string) => {
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <rect x="20" y="20" width="160" height="160" fill="black"/>
        <rect x="30" y="30" width="140" height="140" fill="white"/>
        <text x="100" y="105" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="black">
          ${text.substring(0, 20)}
        </text>
      </svg>
    `)}`
  }

  const handleTimeIn = () => {
    setAttendanceStatus("checked-in")
    setLastAction(`Time In: ${new Date().toLocaleTimeString()}`)
  }

  const handleTimeOut = () => {
    setAttendanceStatus("checked-out")
    setLastAction(`Time Out: ${new Date().toLocaleTimeString()}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-8">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-gray-600">Please log in to access the QR system.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // This should only show for students now
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Your QR Code</h1>
          <p className="text-gray-600">Show this QR code to the scanner for attendance</p>
        </div>

        <div className="space-y-6">
          {/* Student QR Code Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Your Attendance QR Code
              </CardTitle>
              <CardDescription>Show this QR code to the admin scanner for attendance tracking</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300 mb-4">
                <img
                  src={generateQRCodeSVG(qrCode) || "/placeholder.svg"}
                  alt="Student QR Code"
                  className="mx-auto mb-4"
                  width={200}
                  height={200}
                />
                <p className="text-sm text-gray-600 font-mono">{qrCode}</p>
              </div>

              {/* Current Status */}
              <div className="flex items-center justify-center gap-2 mb-4">
                {attendanceStatus === "checked-in" ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Checked In
                  </Badge>
                ) : attendanceStatus === "checked-out" ? (
                  <Badge className="bg-blue-100 text-blue-800">
                    <Clock className="w-4 h-4 mr-1" />
                    Checked Out
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Not Checked In
                  </Badge>
                )}
              </div>

              {lastAction && (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>{lastAction}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Manual Check-in/out for Demo */}
          <Card>
            <CardHeader>
              <CardTitle>Manual Attendance (Demo)</CardTitle>
              <CardDescription>For demonstration purposes only</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={handleTimeIn} disabled={attendanceStatus === "checked-in"} className="w-full">
                  <Clock className="w-4 h-4 mr-2" />
                  Time In
                </Button>
                <Button
                  onClick={handleTimeOut}
                  disabled={attendanceStatus !== "checked-in"}
                  variant="outline"
                  className="w-full"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Time Out
                </Button>
              </div>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  In the real system, attendance is tracked automatically when an admin scans your QR code.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
