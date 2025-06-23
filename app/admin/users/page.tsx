"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserPlus, Users, Shield, User, Edit, Trash2, Crown } from "lucide-react"
import { ref, get, set, remove } from "firebase/database"
import { database } from "@/app/lib/firebase"
import { createInternAccount, type CreateInternData } from "@/lib/user-service"
import { hasPermission, canAccessAdmin } from "@/lib/permissions"
import { toastUtils } from "@/lib/toast-utils"
import type { User as UserType } from "@/types"

export default function UserManagementPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<UserType[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  // Create user form state
  const [newUser, setNewUser] = useState<Partial<CreateInternData>>({
    email: "",
    password: "",
    name: "",
    role: "student",
    projectAccess: [],
  })

  useEffect(() => {
    if (!loading && (!user || !hasPermission(user, "canManageUsers"))) {
      router.push("/admin")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && hasPermission(user, "canManageUsers")) {
      loadUsers()
    }
  }, [user])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, roleFilter])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const usersRef = ref(database, "users")
      const snapshot = await get(usersRef)
      
      if (snapshot.exists()) {
        const usersData = Object.values(snapshot.val()) as UserType[]
        
        // Filter users based on user's role and project access
        let filteredUsers = usersData
        if (user?.role === "project_admin") {
          // Project admins should only see:
          // 1. Students assigned to their projects
          // 2. Other project admins with overlapping project access
          // 3. Super admins (for transparency)
          filteredUsers = usersData.filter(userData => {
            if (userData.role === "superadmin") return true
            if (userData.role === "project_admin") {
              // Show other project admins with overlapping projects
              const userProjects = user.projectAccess || []
              const otherAdminProjects = userData.projectAccess || []
              return userProjects.some(project => otherAdminProjects.includes(project))
            }
            if (userData.role === "student") {
              // Show students assigned to admin's projects
              const userProjects = user.projectAccess || []
              return userData.project && userProjects.includes(userData.project)
            }
            return false
          })
        }
        
        setUsers(filteredUsers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
      } else {
        setUsers([])
      }
    } catch (error) {
      console.error("Error loading users:", error)
      toastUtils.error("Failed to load users")
    } finally {
      setIsLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    setFilteredUsers(filtered)
  }

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.name) {
      toastUtils.error("Please fill in all required fields")
      return
    }

    try {
      setIsCreating(true)
      
      const userData: CreateInternData = {
        email: newUser.email,
        password: newUser.password,
        name: newUser.name,
        studentId: newUser.studentId || `USER-${Date.now()}`,
        role: newUser.role as "student" | "project_admin",
        projectAccess: newUser.projectAccess,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        course: newUser.course,
        year: newUser.year,
        project: newUser.project,
      }

      await createInternAccount(userData)
      
      toastUtils.success(`User ${newUser.name} created successfully!`)
      setShowCreateDialog(false)
      setNewUser({
        email: "",
        password: "",
        name: "",
        role: "student",
        projectAccess: [],
      })
      loadUsers()
    } catch (error: any) {
      toastUtils.error(error.message || "Failed to create user")
    } finally {
      setIsCreating(false)
    }
  }

  const handleProjectAccessChange = (projectName: string, checked: boolean) => {
    setNewUser(prev => ({
      ...prev,
      projectAccess: checked
        ? [...(prev.projectAccess || []), projectName]
        : (prev.projectAccess || []).filter(p => p !== projectName)
    }))
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "superadmin":
        return <Crown className="w-4 h-4 text-yellow-600" />
      case "project_admin":
        return <Shield className="w-4 h-4 text-blue-600" />
      default:
        return <User className="w-4 h-4 text-gray-600" />
    }
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      superadmin: "bg-yellow-100 text-yellow-800",
      project_admin: "bg-blue-100 text-blue-800",
      student: "bg-gray-100 text-gray-800",
    }
    
    const labels = {
      superadmin: "Super Admin",
      project_admin: "Project Admin",
      student: "Student",
    }

    return (
      <Badge className={colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {labels[role as keyof typeof labels] || role}
      </Badge>
    )
  }

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  if (!user || !hasPermission(user, "canManageUsers")) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-8">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-gray-600">Only super administrators can manage users.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-600 mt-2">Manage project administrators and student accounts</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Create a new user account. Project admins can only manage their assigned projects.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={newUser.name || ""}
                    onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email || ""}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="user@example.com"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password || ""}
                    onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter password"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={newUser.role || "student"}
                    onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value as "student" | "project_admin" }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="project_admin">Project Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {newUser.role === "project_admin" && (
                <div>
                  <Label>Project Access</Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    {["TRIOE", "MR. MED", "HAPTICS"].map((project) => (
                      <div key={project} className="flex items-center space-x-2">
                        <Checkbox
                          id={project}
                          checked={newUser.projectAccess?.includes(project) || false}
                          onCheckedChange={(checked) => handleProjectAccessChange(project, checked as boolean)}
                        />
                        <Label htmlFor={project} className="text-sm">{project}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="studentId">Student/Employee ID</Label>
                  <Input
                    id="studentId"
                    value={newUser.studentId || ""}
                    onChange={(e) => setNewUser(prev => ({ ...prev, studentId: e.target.value }))}
                    placeholder="Auto-generated if empty"
                  />
                </div>
                <div>
                  <Label htmlFor="course">Course/Department</Label>
                  <Input
                    id="course"
                    value={newUser.course || ""}
                    onChange={(e) => setNewUser(prev => ({ ...prev, course: e.target.value }))}
                    placeholder="e.g., Computer Science"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateUser} disabled={isCreating}>
                {isCreating ? "Creating..." : "Create User"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Crown className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Super Admins</p>
                <p className="text-2xl font-bold">{users.filter(u => u.role === "superadmin").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Project Admins</p>
                <p className="text-2xl font-bold">{users.filter(u => u.role === "project_admin").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Students</p>
                <p className="text-2xl font-bold">{users.filter(u => u.role === "student").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <User className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="superadmin">Super Admin</SelectItem>
                <SelectItem value="project_admin">Project Admin</SelectItem>
                <SelectItem value="student">Student</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Project Access</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {getRoleIcon(user.role)}
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getRoleBadge(user.role)}
                  </TableCell>
                  <TableCell>
                    {user.role === "project_admin" && user.projectAccess ? (
                      <div className="flex flex-wrap gap-1">
                        {user.projectAccess.map((project) => (
                          <Badge key={project} variant="outline" className="text-xs">
                            {project}
                          </Badge>
                        ))}
                      </div>
                    ) : user.role === "superadmin" ? (
                      <Badge variant="outline" className="text-xs">All Projects</Badge>
                    ) : (
                      <span className="text-gray-400">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      {user.role !== "superadmin" && (
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No users found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 