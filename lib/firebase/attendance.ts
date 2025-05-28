import { db } from '@/app/lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, onSnapshot, Timestamp, orderBy } from 'firebase/firestore';
import type { AttendanceRecord, AttendanceSummary } from '@/types';

const ATTENDANCE_COLLECTION = 'attendance';

export const subscribeToAttendanceRecords = (
  date: string,
  callback: (records: AttendanceRecord[]) => void
) => {
  const attendanceRef = collection(db, ATTENDANCE_COLLECTION);
  const q = query(
    attendanceRef,
    where('date', '==', date),
    orderBy('timeIn', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const records = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as AttendanceRecord[];
    callback(records);
  });
};

export const getAttendanceSummary = async (date: string): Promise<AttendanceSummary> => {
  const attendanceRef = collection(db, ATTENDANCE_COLLECTION);
  const q = query(attendanceRef, where('date', '==', date));
  const snapshot = await getDocs(q);
  const records = snapshot.docs.map(doc => doc.data() as AttendanceRecord);

  const totalStudents = records.length;
  const presentToday = records.filter(r => r.status !== 'absent').length;
  const absentToday = records.filter(r => r.status === 'absent').length;
  const lateArrivals = records.filter(r => {
    if (!r.timeIn) return false;
    const timeIn = new Date(r.timeIn);
    return timeIn.getHours() >= 9;
  }).length;
  
  const earlyDepartures = records.filter(r => {
    if (!r.timeOut) return false;
    const timeOut = new Date(r.timeOut);
    return timeOut.getHours() < 17;
  }).length;

  const completedRecords = records.filter(r => r.hoursWorked !== null);
  const totalHours = completedRecords.reduce((sum, r) => sum + (r.hoursWorked || 0), 0);
  const averageHours = completedRecords.length > 0 ? totalHours / completedRecords.length : 0;
  
  const attendanceRate = (presentToday / totalStudents) * 100;

  return {
    totalStudents,
    presentToday,
    absentToday,
    lateArrivals,
    earlyDepartures,
    averageHours,
    attendanceRate,
  };
};

export const addAttendanceRecord = async (record: Omit<AttendanceRecord, 'id'>) => {
  const attendanceRef = collection(db, ATTENDANCE_COLLECTION);
  const docRef = await addDoc(attendanceRef, {
    ...record,
    lastUpdated: Timestamp.now(),
  });
  return docRef.id;
};

export const updateAttendanceRecord = async (id: string, updates: Partial<AttendanceRecord>) => {
  const docRef = doc(db, ATTENDANCE_COLLECTION, id);
  await updateDoc(docRef, {
    ...updates,
    lastUpdated: Timestamp.now(),
  });
}; 