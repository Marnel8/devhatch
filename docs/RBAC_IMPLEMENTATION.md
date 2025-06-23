# Role-Based Access Control (RBAC) Implementation

This document outlines the implementation of a comprehensive role-based access control system for the DevHatch OJT Portal, where each project has dedicated administrators while maintaining a super administrator role.

## Overview

The system now supports three user roles:
- **Super Administrator**: Can manage all projects and users
- **Project Administrator**: Can manage specific projects they're assigned to
- **Student**: Regular OJT students with read-only access to their own data

## Role Definitions

### Super Administrator (`superadmin`)
- **Full Access**: Can manage all projects, users, and system settings
- **User Management**: Can create/edit/delete all user accounts
- **Project Access**: Unlimited access to all projects (TRIOE, MR. MED, HAPTICS)
- **Permissions**:
  - Manage jobs for all projects
  - Manage applications for all projects  
  - Manage interns for all projects
  - Manage attendance for all projects
  - View reports for all projects
  - Manage users and create project admins
  - Access user management interface

### Project Administrator (`project_admin`)
- **Limited Access**: Can only manage projects they're assigned to
- **Project-Specific**: Access is restricted to their assigned projects
- **Permissions**:
  - Manage jobs for assigned projects only
  - Manage applications for assigned projects only
  - Manage interns for assigned projects only
  - Manage attendance for assigned projects only
  - View reports for assigned projects only
  - Cannot manage users or create accounts
  - Cannot access projects outside their scope

### Student (`student`)
- **Read-Only**: Can only view their own data
- **Limited Interface**: Access to student dashboard only
- **Permissions**:
  - View their own profile and accomplishments
  - Generate their QR code for attendance
  - Apply for jobs
  - View their attendance records

## Implementation Details

### 1. Type Definitions

Updated the `User` interface in `types/index.ts`:

```typescript
export interface User {
  id: string
  email: string
  role: "superadmin" | "project_admin" | "student"
  name: string
  createdAt: string
  projectAccess?: string[] // Array of project names for project admins
  // ... other properties
}
```

### 2. Permission System

Created a comprehensive permission system in `lib/permissions.ts`:

```typescript
// Key functions
export function canManageProject(user: User, projectName: string): boolean
export function filterByProjectAccess<T>(user: User, items: T[]): T[]
export function hasPermission(user: User, permission: string): boolean
```

### 3. Authentication Updates

Updated `lib/auth-context.tsx` to handle the new role system:
- Super admins get full project access by default
- Project admins get limited access based on their `projectAccess` array
- Students get no admin access

### 4. UI Access Control

#### Admin Layout (`app/admin/layout.tsx`)
- Navigation items are filtered based on user permissions
- Role-appropriate titles and project access display
- Permission-based menu visibility

#### Data Filtering
All admin pages now filter data based on user project access:
- **Applications**: Only show applications for jobs in accessible projects
- **Interns**: Only show students assigned to accessible projects
- **Jobs**: Only show jobs from accessible projects
- **Attendance**: Only show attendance records for accessible projects

### 5. User Management

Created a comprehensive user management interface (`app/admin/users/page.tsx`) for super administrators:
- Create new project administrators
- Assign project access to admins
- View all users and their roles
- Role-based statistics dashboard

## Demo Accounts

### Super Administrator
- **Email**: `admin@g.batstate-u.edu.ph`
- **Password**: `admin123456`
- **Access**: All projects and user management

### Project Administrators

#### TRIOE Project Admin
- **Email**: `trioe.admin@devhatch.com`
- **Password**: `trioe123456`
- **Access**: TRIOE project only

#### MR. MED Project Admin
- **Email**: `mrmed.admin@devhatch.com`
- **Password**: `mrmed123456`
- **Access**: MR. MED project only

#### HAPTICS Project Admin
- **Email**: `haptics.admin@devhatch.com`
- **Password**: `haptics123456`
- **Access**: HAPTICS project only

#### Multi-Project Admin
- **Email**: `multi.admin@devhatch.com`
- **Password**: `multi123456`
- **Access**: TRIOE and MR. MED projects

### Student
- **Email**: `student@g.batstate-u.edu.ph`
- **Password**: `demo123456`
- **Access**: Student dashboard only

## Setup Instructions

### 1. Run the Project Admin Creation Script

```bash
npm run create-project-admins
```

This script will create the demo project administrator accounts.

### 2. Database Structure

The Firebase Realtime Database now stores users with the following structure:

```json
{
  "users": {
    "userId": {
      "id": "userId",
      "email": "user@example.com",
      "name": "User Name",
      "role": "project_admin",
      "projectAccess": ["TRIOE", "MR. MED"],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 3. Security Rules

Update Firebase security rules to enforce project-based access:

```javascript
// Example rule structure
{
  "rules": {
    "jobs": {
      ".read": "auth != null",
      ".write": "auth != null && (
        root.child('users').child(auth.uid).child('role').val() == 'superadmin' ||
        (root.child('users').child(auth.uid).child('role').val() == 'project_admin' &&
         root.child('users').child(auth.uid).child('projectAccess').val().contains(newData.child('project').val()))
      )"
    }
  }
}
```

## Migration Guide

### From Existing System

1. **Update existing admin users**:
   - Change role from `"admin"` to `"superadmin"`
   - Add `projectAccess: ["TRIOE", "MR. MED", "HAPTICS"]`

2. **Update role checks in code**:
   - Replace `user.role === "admin"` with `canAccessAdmin(user)`
   - Use permission functions instead of direct role checks

3. **Add project filtering**:
   - Use `filterByProjectAccess()` for data filtering
   - Implement project-specific access controls

## Benefits

1. **Scalability**: Easy to add new projects and administrators
2. **Security**: Administrators can only access their assigned projects
3. **Flexibility**: Multi-project administrators are supported
4. **Maintainability**: Centralized permission system
5. **User Experience**: Role-appropriate interfaces and navigation

## Future Enhancements

1. **Dynamic Project Creation**: Allow super admins to create new projects
2. **Role Templates**: Pre-defined permission sets for different admin types
3. **Audit Logging**: Track admin actions for compliance
4. **Time-based Access**: Temporary project access assignments
5. **Advanced Permissions**: Granular permissions (read-only admin, etc.)

## Testing

### Test Scenarios

1. **Super Admin Access**:
   - Login as super admin
   - Verify access to all projects and user management
   - Test creating new project admins

2. **Project Admin Access**:
   - Login as project admin
   - Verify access only to assigned projects
   - Test that other projects are not visible

3. **Student Access**:
   - Login as student
   - Verify no admin access
   - Test student dashboard functionality

4. **Cross-Project Data**:
   - Verify project admins cannot see data from unassigned projects
   - Test data filtering in all admin interfaces

## Troubleshooting

### Common Issues

1. **Role not updating**: Clear browser cache and re-login
2. **Project access not working**: Check `projectAccess` array in user data
3. **Permission errors**: Verify user role and permissions in database

### Debug Tools

Use the permission helper functions to debug access issues:

```typescript
import { getUserPermissions, canManageProject } from '@/lib/permissions'

// Check user permissions
console.log(getUserPermissions(user))

// Check project access
console.log(canManageProject(user, "TRIOE"))
``` 