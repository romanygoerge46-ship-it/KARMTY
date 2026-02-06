import { AppData, Person, AttendanceRecord } from '../types';
import { SEED_DATA } from '../constants';

const DB_KEY = 'sunday_school_db_v3';

export const getDB = (): AppData => {
  const data = localStorage.getItem(DB_KEY);
  if (!data) {
    localStorage.setItem(DB_KEY, JSON.stringify(SEED_DATA));
    return SEED_DATA;
  }
  return JSON.parse(data);
};

export const saveDB = (data: AppData) => {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
};

// Helper: Transliterate Arabic to English
const transliterate = (text: string): string => {
  const map: Record<string, string> = {
    'ا': 'a', 'أ': 'a', 'إ': 'e', 'آ': 'a', 'ى': 'a', 'ة': 'a',
    'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'g', 'ح': 'h', 'خ': 'kh',
    'د': 'd', 'ذ': 'th', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh',
    'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh',
    'ف': 'f', 'ق': 'k', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
    'ه': 'h', 'و': 'o', 'ي': 'y', ' ': '.'
  };
  return text.split('').map(char => map[char] || char).join('').toLowerCase().replace(/[^a-z0-9.]/g, '');
};

export const generateUniqueUsername = (arabicName: string): string => {
  const db = getDB();
  const baseUsername = transliterate(arabicName);
  let candidate = baseUsername;
  let counter = 1;
  
  // Ensure length is at least 3
  if (candidate.length < 3) candidate = "user." + candidate;

  // Check uniqueness
  while (db.people.some(p => p.username === candidate)) {
    candidate = `${baseUsername}${counter}`;
    counter++;
  }
  
  return candidate;
};

// Return result object to handle errors in UI
export const addPerson = (person: Person): { success: boolean; message?: string; generatedUsername?: string } => {
  const db = getDB();
  
  // 1. Generate Username if not provided
  let finalPerson = { ...person };
  if (!finalPerson.username) {
     finalPerson.username = generateUniqueUsername(finalPerson.name);
  } else {
     // If manually provided, check uniqueness
     const usernameExists = db.people.some(p => p.username === finalPerson.username);
     if (usernameExists) {
        return { success: false, message: 'اسم المستخدم هذا مستخدم من قبل.' };
     }
  }

  // 2. Check Unique Phone
  const phoneExists = db.people.some(p => p.phone === finalPerson.phone);
  if (phoneExists) {
    return { success: false, message: 'رقم الهاتف هذا مسجل بالفعل لشخص آخر.' };
  }

  finalPerson.id = Date.now().toString();
  db.people.push(finalPerson);
  saveDB(db);
  return { success: true, generatedUsername: finalPerson.username };
};

export const updatePerson = (updatedPerson: Person) => {
  const db = getDB();
  const index = db.people.findIndex(p => p.id === updatedPerson.id);
  if (index !== -1) {
    db.people[index] = updatedPerson;
    saveDB(db);
  }
};

export const deletePerson = (id: string) => {
  const db = getDB();
  // Filter out the person
  const initialLength = db.people.length;
  db.people = db.people.filter(p => p.id !== id);
  
  // If deletion happened, clean up attendance
  if (db.people.length < initialLength) {
    db.attendance = db.attendance.filter(a => a.personId !== id);
    saveDB(db);
    return true;
  }
  return false;
};

export const markAttendance = (personId: string, date: string, isPresent: boolean) => {
  const db = getDB();
  db.attendance = db.attendance.filter(
    a => !(a.personId === personId && a.date === date)
  );
  
  if (isPresent) {
    db.attendance.push({
      id: Date.now().toString(),
      personId,
      date,
      isPresent: true
    });
  }
  saveDB(db);
};

export const getAttendanceCount = (personId: string): number => {
  const db = getDB();
  return db.attendance.filter(a => a.personId === personId && a.isPresent).length;
};