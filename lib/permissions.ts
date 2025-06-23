import type { User, UserPermissions, RolePermissions, UserRole } from "@/types"

// Define role-based permissions
export const ROLE_PERMISSIONS: RolePermissions = {
  superadmin: {
    canManageJobs: true,
    canManageApplications: true,
    canManageInterns: true,
    canManageAttendance: true,
    canViewReports: true,
    canManageUsers: true,
    canManageProjects: true,
    canManageAllProjects: true,
  },
  project_admin: {
    canManageJobs: true,
    canManageApplications: true,
    canManageInterns: true,
    canManageAttendance: true,
    canViewReports: true,
    canManageUsers: false,
    canManageProjects: false,
    canManageAllProjects: false,
  },
  student: {
    canManageJobs: false,
    canManageApplications: false,
    canManageInterns: false,
    canManageAttendance: false,
    canViewReports: false,
    canManageUsers: false,
    canManageProjects: false,
    canManageAllProjects: false,
  },
}

/**
 * Get user permissions based on role and project access
 */
export function getUserPermissions(user: User): UserPermissions {
  const basePermissions = ROLE_PERMISSIONS[user.role]
  
  return {
    ...basePermissions,
    projectAccess: user.projectAccess || [],
  }
}

/**
 * Check if user can manage a specific project
 */
export function canManageProject(user: User, projectName: string): boolean {
  if (user.role === "superadmin") {
    return true
  }
  
  if (user.role === "project_admin") {
    return user.projectAccess?.includes(projectName) || false
  }
  
  return false
}

/**
 * Check if user can access admin features
 */
export function canAccessAdmin(user: User): boolean {
  return user.role === "superadmin" || user.role === "project_admin"
}

/**
 * Check if user can access data for a specific project
 */
export function canAccessProjectData(user: User, projectName: string): boolean {
  if (user.role === "superadmin") {
    return true
  }
  
  if (user.role === "project_admin") {
    return user.projectAccess?.includes(projectName) || false
  }
  
  // Students can only access their own project data
  if (user.role === "student") {
    return user.project === projectName
  }
  
  return false
}

/**
 * Filter data based on user's project access with better type safety
 */
export function filterByProjectAccess<T extends { project?: string }>(
  user: User,
  items: T[]
): T[] {
  if (user.role === "superadmin") {
    return items
  }
  
  if (user.role === "project_admin" && user.projectAccess) {
    return items.filter(item => 
      item.project && user.projectAccess?.includes(item.project)
    )
  }
  
  if (user.role === "student" && user.project) {
    return items.filter(item => item.project === user.project)
  }
  
  return []
}

/**
 * Get available projects for user management
 */
export function getAvailableProjects(user: User): string[] {
  if (user.role === "superadmin") {
    return ["TRIOE", "MR. MED", "HAPTICS"]
  }
  
  return user.projectAccess || []
}

/**
 * Get projects that a user can create/assign items to
 */
export function getProjectsForCreation(user: User): string[] {
  if (user.role === "superadmin") {
    return ["TRIOE", "MR. MED", "HAPTICS"]
  }
  
  if (user.role === "project_admin") {
    return user.projectAccess || []
  }
  
  // Students cannot create items for projects
  return []
}

/**
 * Check if user has specific permission
 */
export function hasPermission(
  user: User, 
  permission: keyof Omit<UserPermissions, 'projectAccess'>
): boolean {
  const permissions = getUserPermissions(user)
  return permissions[permission]
}

/**
 * Check if user can manage jobs for a specific project
 */
export function canManageJobsForProject(user: User, projectName: string): boolean {
  return hasPermission(user, "canManageJobs") && canManageProject(user, projectName)
}

/**
 * Check if user can manage applications for a specific project
 */
export function canManageApplicationsForProject(user: User, projectName: string): boolean {
  return hasPermission(user, "canManageApplications") && canManageProject(user, projectName)
}

/**
 * Check if user can manage interns for a specific project
 */
export function canManageInternsForProject(user: User, projectName: string): boolean {
  return hasPermission(user, "canManageInterns") && canManageProject(user, projectName)
}

/**
 * Check if user can manage attendance for a specific project
 */
export function canManageAttendanceForProject(user: User, projectName: string): boolean {
  return hasPermission(user, "canManageAttendance") && canManageProject(user, projectName)
} 