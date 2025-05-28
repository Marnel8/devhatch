import { db } from '@/app/lib/firebase';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
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
  const attendanceRef = collection(db, 'attendance');
  let q = query(attendanceRef);

  if (startDate && endDate) {
    q = query(
      attendanceRef,
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      where('project', '==', projectId)
    );
  }

  const snapshot = await getDocs(q);
  const records = snapshot.docs.map(doc => doc.data() as AttendanceRecord);

  const totalHours = records.reduce((sum, record) => sum + (record.hoursWorked || 0), 0);
  const uniqueStudents = new Set(records.map(record => record.studentId)).size;
  const completedRecords = records.filter(record => record.status === 'complete').length;
  const completionRate = (completedRecords / records.length) * 100;

  return {
    students: uniqueStudents,
    hours: totalHours,
    completionRate: Math.round(completionRate),
  };
};

export const getAttendanceStats = async (startDate?: Date, endDate?: Date) => {
  const attendanceRef = collection(db, 'attendance');
  let q = query(attendanceRef, orderBy('date', 'desc'));

  if (startDate && endDate) {
    q = query(
      attendanceRef,
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc')
    );
  }

  const snapshot = await getDocs(q);
  const records = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as AttendanceRecord[];

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
  return Object.entries(groupedRecords).map(([date, dayRecords]) => {
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
  });
};

export const getStudentPerformance = async (limit: number = 5): Promise<PerformanceData[]> => {
  const studentsRef = collection(db, 'students');
  const q = query(studentsRef, orderBy('performance.completion', 'desc'), orderBy('performance.attendance', 'desc'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.slice(0, limit).map(doc => {
    const data = doc.data();
    return {
      name: data.name,
      project: data.project || '',
      completion: data.performance?.completion || 0,
      attendance: data.performance?.attendance || 0,
    };
  });
};

export const getReportStats = async (startDate?: Date, endDate?: Date): Promise<ReportStats> => {
  const studentsRef = collection(db, 'students');
  const attendanceRef = collection(db, 'attendance');

  // Get all students
  const studentsSnapshot = await getDocs(studentsRef);
  const students = studentsSnapshot.docs.map(doc => doc.data());
  const totalStudents = students.length;
  const activeStudents = students.filter(student => student.isActive).length;

  // Get attendance records
  let attendanceQuery = query(attendanceRef);
  if (startDate && endDate) {
    attendanceQuery = query(
      attendanceRef,
      where('date', '>=', startDate),
      where('date', '<=', endDate)
    );
  }
  const attendanceSnapshot = await getDocs(attendanceQuery);
  const attendanceRecords = attendanceSnapshot.docs.map(doc => doc.data() as AttendanceRecord);

  // Calculate total hours and attendance rate
  const totalHours = attendanceRecords.reduce((sum, record) => sum + (record.hoursWorked || 0), 0);
  const presentRecords = attendanceRecords.filter(record => record.status !== 'absent');
  const averageAttendance = Math.round((presentRecords.length / attendanceRecords.length) * 100);

  // Calculate completion rate based on complete status
  const completedRecords = attendanceRecords.filter(record => record.status === 'complete').length;
  const completionRate = Math.round((completedRecords / attendanceRecords.length) * 100);

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