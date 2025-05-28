"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Calendar, Briefcase, Clock, Edit, Save, Upload, GraduationCap } from "lucide-react"

export default function ProfilePage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Mock student profile data - only editable fields
  const [profileData, setProfileData] = useState({
    name: user?.name || "Maria Santos",
    email: user?.email || "maria.santos@g.batstate-u.edu.ph",
    phone: "+63 912 345 6789",
    address: "Batangas City, Batangas",
    bio: "Passionate computer science student with a focus on web development and user experience design. Eager to contribute to innovative projects and learn from industry professionals.",
    skills: ["React", "TypeScript", "JavaScript", "HTML/CSS", "Node.js", "Git", "Figma"],
  })

  // Read-only OJT information
  const ojtInfo = {
    studentId: "2021-00123",
    course: "Bachelor of Science in Computer Science",
    yearLevel: "4th Year",
    ojtNumber: "OJT-2024-001",
    project: "TRIOE",
    position: "Frontend Developer Intern",
    supervisor: "Dr. Juan Dela Cruz",
    startDate: "2024-01-15",
    endDate: "2024-05-15",
    totalHours: 240,
    completedHours: 156,
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSuccess(true)
      setIsEditing(false)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const progressPercentage = (ojtInfo.completedHours / ojtInfo.totalHours) * 100

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">My Profile</h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage your personal information</p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">Profile updated successfully!</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <User className="w-12 h-12 text-primary" />
                </div>
                <h2 className="text-xl font-bold">{profileData.name}</h2>
                <p className="text-gray-600">{ojtInfo.position}</p>
                <Badge className="mt-2" variant="outline">
                  {ojtInfo.project}
                </Badge>
                <Button variant="outline" size="sm" className="mt-4">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Progress Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                OJT Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Hours Completed</span>
                  <span>
                    {ojtInfo.completedHours} / {ojtInfo.totalHours}
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{Math.round(progressPercentage)}%</p>
                    <p className="text-xs text-gray-600">Complete</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">{ojtInfo.totalHours - ojtInfo.completedHours}</p>
                    <p className="text-xs text-gray-600">Hours Left</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle>OJT Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>Started: {new Date(ojtInfo.startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="w-4 h-4 text-gray-500" />
                <span>Supervisor: {ojtInfo.supervisor}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <GraduationCap className="w-4 h-4 text-gray-500" />
                <span>{ojtInfo.course}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={profileData.address}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, address: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, bio: e.target.value }))}
                  disabled={!isEditing}
                  rows={4}
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div className="space-y-2">
                <Label>Skills</Label>
                <div className="flex flex-wrap gap-2">
                  {profileData.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
                {isEditing && <Input placeholder="Add new skill..." className="mt-2" />}
              </div>
            </CardContent>
          </Card>

          {/* Academic Information (Read-only) */}
          <Card>
            <CardHeader>
              <CardTitle>Academic & OJT Information</CardTitle>
              <CardDescription>Your educational and internship details (read-only)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Student ID</Label>
                  <Input value={ojtInfo.studentId} disabled />
                </div>
                <div className="space-y-2">
                  <Label>OJT Number</Label>
                  <Input value={ojtInfo.ojtNumber} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Course</Label>
                  <Input value={ojtInfo.course} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Year Level</Label>
                  <Input value={ojtInfo.yearLevel} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Project</Label>
                  <Input value={ojtInfo.project} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Position</Label>
                  <Input value={ojtInfo.position} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Supervisor</Label>
                  <Input value={ojtInfo.supervisor} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input value={ojtInfo.startDate} disabled />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
