export interface User {
  id: string
  email: string
  role: "superadmin" | "project_admin" | "student"
  name: string
  createdAt: string
  // Project access for project admins
  projectAccess?: string[] // Array of project names they can manage
  // Additional properties for interns
  studentId?: string
  firstName?: string
  lastName?: string
  course?: string
  year?: string
  project?: string
  resumeUrl?: string
  isIntern?: boolean
}

// New interface for role-based permissions
export interface UserPermissions {
  canManageJobs: boolean
  canManageApplications: boolean
  canManageInterns: boolean
  canManageAttendance: boolean
  canViewReports: boolean
  canManageUsers: boolean
  canManageProjects: boolean
  canManageAllProjects: boolean
  projectAccess: string[] // Projects this user can manage
}

// Role definitions
export type UserRole = "superadmin" | "project_admin" | "student"

export interface RolePermissions {
  [key: string]: Omit<UserPermissions, 'projectAccess'>
}

export interface Student extends User {
  ojtNumber?: string
  project?: string
  position?: string
  totalHours: number
  completedHours: number
  isActive: boolean
  qrCode?: string
  lastTimeIn?: string
  lastTimeOut?: string
}

export interface JobPosting {
  id: string
  title: string
  project: "TRIOE" | "MR. MED" | "HAPTICS"
  description: string
  requirements: string
  responsibilities?: string
  availableSlots: number
  filledSlots: number
  pdfUrl?: string
  createdAt: string
  updatedAt?: string
  isActive: boolean
  createdBy: string
}

export interface Application {
  id: string
  jobId: string
  studentId: string
  studentName: string
  studentEmail: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  course?: string
  year?: string
  jobTitle?: string
  jobProject?: string
  resumeFileName?: string
  resumeUrl?: string
  resumeURL?: string
  coverLetter: string
  status: "pending" | "for_review" | "for_interview" | "hired" | "rejected"
  appliedAt: string
  submittedAt?: string
  updatedAt?: string
  reviewedAt?: string
  reviewedBy?: string
  reviewNotes?: string
  rejectionReason?: string
  interviewScheduledAt?: string
  interviewDate?: string
  interviewTime?: string
  interviewLocation?: string
  interviewType?: "in_person" | "online" | "phone"
  interviewNotes?: string
  interviewHighlights?: string
  interviewScore?: number
  interviewBy?: string
}

export type AttendanceStatus = 'complete' | 'in-progress' | 'incomplete' | 'absent';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  ojtNumber: string;
  studentName: string;
  project: string;
  timeIn: string | null;
  timeOut: string | null;
  date: string;
  hoursWorked: number | null;
  status: AttendanceStatus;
  location: string | null;
  notes?: string;
  lastUpdated?: string;
}

export interface AttendanceSummary {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  lateArrivals: number;
  earlyDepartures: number;
  averageHours: number;
  attendanceRate: number;
}

export interface Accomplishment {
  id: string
  studentId: string
  ojtNumber: string
  date: string
  description: string
  submittedAt: string
}

export interface Project {
  id: string
  name: string
  description: string
  color: string
}

export interface DashboardStats {
  totalStudents: number
  activeJobs: number
  totalApplications: number
  pendingApplications: number
  attendanceRate: number
}

export interface RecentActivity {
  id: string
  type: 'application' | 'attendance' | 'job' | 'student'
  message: string
  time: string
  status: 'pending' | 'success' | 'info'
}
