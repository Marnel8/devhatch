import { database } from '@/app/lib/firebase';
import { ref, get, query, orderByChild, startAt, endAt } from 'firebase/database';
import type { AttendanceRecord } from '@/types';

export interface ProjectStats {
  students: number;
  hours: number;
  completionRate: number;
}

export interface PerformanceData {
  name: string;
  project: string;
  completion: number;
  attendance: number;
}

export interface ReportStats {
  totalStudents: number;
  activeStudents: number;
  totalHours: number;
  averageAttendance: number;
  completionRate: number;
  projectDistribution: {
    [key: string]: {
      students: number;
      hours: number;
    };
  };
}

export const getProjectStats = async (projectId: string, startDate?: Date, endDate?: Date): Promise<ProjectStats> => {
  const attendanceRef = ref(database, 'attendance');
  const attendanceQuery = query(attendanceRef, orderByChild('date'));
  
  const snapshot = await get(attendanceQuery);
  const records: AttendanceRecord[] = [];
  
  snapshot.forEach((child) => {
    const record = child.val() as AttendanceRecord;
    if (record.project === projectId) {
      if (startDate && endDate) {
        const recordDate = new Date(record.date);
        if (recordDate >= startDate && recordDate <= endDate) {
          records.push(record);
        }
      } else {
        records.push(record);
      }
    }
  });

  const totalHours = records.reduce((sum, record) => sum + (record.hoursWorked || 0), 0);
  const uniqueStudents = new Set(records.map(record => record.studentId)).size;
  const completedRecords = records.filter(record => record.status === 'complete').length;
  const completionRate = records.length > 0 ? (completedRecords / records.length) * 100 : 0;

  return {
    students: uniqueStudents,
    hours: totalHours,
    completionRate: Math.round(completionRate),
  };
};

export const getAttendanceStats = async (startDate?: Date, endDate?: Date) => {
  const attendanceRef = ref(database, 'attendance');
  const attendanceQuery = query(attendanceRef, orderByChild('date'));
  
  const snapshot = await get(attendanceQuery);
  const records: AttendanceRecord[] = [];
  
  snapshot.forEach((child) => {
    const record = child.val() as AttendanceRecord;
    if (startDate && endDate) {
      const recordDate = new Date(record.date);
      if (recordDate >= startDate && recordDate <= endDate) {
        records.push(record);
      }
    } else {
      records.push(record);
    }
  });

  // Group records by date
  const groupedRecords = records.reduce((acc, record) => {
    const date = record.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(record);
    return acc;
  }, {} as { [key: string]: AttendanceRecord[] });

  // Calculate daily stats
  return Object.entries(groupedRecords)
    .map(([date, dayRecords]) => {
      const total = dayRecords.length;
      const present = dayRecords.filter(r => r.status !== 'absent').length;
      const absent = total - present;
      const rate = Math.round((present / total) * 100);

      return {
        date,
        present,
        absent,
        rate,
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date descending
};

export const getStudentPerformance = async (limit: number = 5): Promise<PerformanceData[]> => {
  const studentsRef = ref(database, 'students');
  const snapshot = await get(studentsRef);
  
  const students: PerformanceData[] = [];
  snapshot.forEach((child) => {
    const data = child.val();
    if (data.name) {
      students.push({
        name: data.name,
        project: data.project || '',
        completion: data.performance?.completion || 0,
        attendance: data.performance?.attendance || 0,
      });
    }
  });

  // Sort by completion and attendance in memory instead
  return students
    .sort((a, b) => {
      if (b.completion === a.completion) {
        return b.attendance - a.attendance;
      }
      return b.completion - a.completion;
    })
    .slice(0, limit);
};

export const getReportStats = async (startDate?: Date, endDate?: Date): Promise<ReportStats> => {
  const studentsRef = ref(database, 'students');
  const attendanceRef = ref(database, 'attendance');

  // Get all students
  const studentsSnapshot = await get(studentsRef);
  const students: any[] = [];
  studentsSnapshot.forEach((child) => {
    students.push(child.val());
  });
  
  const totalStudents = students.length;
  const activeStudents = students.filter(student => student.isActive).length;

  // Get attendance records
  const attendanceSnapshot = await get(attendanceRef);
  const attendanceRecords: AttendanceRecord[] = [];
  attendanceSnapshot.forEach((child) => {
    const record = child.val() as AttendanceRecord;
    if (startDate && endDate) {
      const recordDate = new Date(record.date);
      if (recordDate >= startDate && recordDate <= endDate) {
        attendanceRecords.push(record);
      }
    } else {
      attendanceRecords.push(record);
    }
  });

  // Calculate total hours and attendance rate
  const totalHours = attendanceRecords.reduce((sum, record) => sum + (record.hoursWorked || 0), 0);
  const presentRecords = attendanceRecords.filter(record => record.status !== 'absent');
  const averageAttendance = attendanceRecords.length > 0 
    ? Math.round((presentRecords.length / attendanceRecords.length) * 100)
    : 0;

  // Calculate completion rate based on complete status
  const completedRecords = attendanceRecords.filter(record => record.status === 'complete').length;
  const completionRate = attendanceRecords.length > 0
    ? Math.round((completedRecords / attendanceRecords.length) * 100)
    : 0;

  // Calculate project distribution
  const projectDistribution = students.reduce((acc, student) => {
    const project = student.project;
    if (!project) return acc;
    
    if (!acc[project]) {
      acc[project] = { students: 0, hours: 0 };
    }
    acc[project].students++;
    
    // Sum hours for this project
    const projectHours = attendanceRecords
      .filter(record => record.project === project)
      .reduce((sum, record) => sum + (record.hoursWorked || 0), 0);
    acc[project].hours = projectHours;
    
    return acc;
  }, {} as ReportStats['projectDistribution']);

  return {
    totalStudents,
    activeStudents,
    totalHours,
    averageAttendance,
    completionRate,
    projectDistribution,
  };
}; 