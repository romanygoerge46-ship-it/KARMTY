
import { AppData, Person, AttendanceRecord, Family, Message } from '../types';
import { SEED_DATA } from '../constants';

// Updated to v10 to include messages schema
const DB_KEY = 'sunday_school_db_v10'; 

export const getDB = (): AppData => {
  try {
    const data = localStorage.getItem(DB_KEY);
    if (!data) {
      // Initialize Seed Data
      const seed: AppData = {
          ...SEED_DATA,
          people: SEED_DATA.people.map(p => ({ ...p, churchId: 'MAIN' })), // Ensure dev has a churchId
          families: [],
          messages: []
      }
      localStorage.setItem(DB_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(data);
    // Safety checks for schema updates
    if (!parsed.stages) parsed.stages = SEED_DATA.stages;
    if (!parsed.families) parsed.families = [];
    if (!parsed.messages) parsed.messages = []; // Initialize messages if missing
    if (!parsed.people) parsed.people = SEED_DATA.people.map(p => ({ ...p, churchId: 'MAIN' }));

    // Migration: Add churchId if missing to existing records
    parsed.people = parsed.people.map((p: any) => ({
        ...p,
        churchId: p.churchId || 'MAIN'
    }));
    
    parsed.families = parsed.families.map((f: any) => ({
        ...f,
        churchId: f.churchId || 'MAIN'
    }));

    // Migrate payments
    if (parsed.families) {
      parsed.families.forEach((f: any) => {
          if (f.payments) {
              Object.keys(f.payments).forEach(key => {
                  if (typeof f.payments[key] === 'string') {
                      f.payments[key] = { date: f.payments[key], handedOver: false };
                  }
              });
          }
      });
    }
    
    return parsed;
  } catch (e) {
    console.error("Error loading DB", e);
    return { ...SEED_DATA, people: [], families: [], attendance: [], messages: [] };
  }
};

export const saveDB = (data: AppData) => {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  } catch (e) {
    alert("عذراً، مساحة التخزين ممتلئة أو هناك مشكلة في حفظ البيانات.");
  }
};

export const addPerson = (person: Person): { success: boolean; message?: string; generatedUsername?: string } => {
  const db = getDB();
  
  // 1. Validate Password Length
  if (!person.password || person.password.length < 4) {
      return { success: false, message: 'كلمة المرور يجب أن لا تقل عن 4 أرقام/أحرف.' };
  }

  // 2. Validate Egyptian Phone Number Format
  const egyptianPhoneRegex = /^01[0125][0-9]{8}$/;
  if (!egyptianPhoneRegex.test(person.phone)) {
      return { success: false, message: 'رقم الهاتف غير صحيح. يجب أن يكون رقم مصري مكون من 11 رقم (01xxxxxxxxx).' };
  }

  // 3. Validate Church Code (Strict Format: 4 chars, 1 upper, 1 lower, 1 number)
  // Skip this check for the Developer backdoor if needed, but enforce for normal users
  const churchCodeRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9]{4}$/;
  if (!churchCodeRegex.test(person.churchId)) {
      return { success: false, message: 'كود الكنيسة غير صحيح. يجب أن يكون 4 خانات ويحتوي على: حرف كبير، حرف صغير، ورقم.' };
  }

  // 4. Check for Duplicate Phone (Global Uniqueness)
  const phoneExists = db.people.some(p => p.phone === person.phone);
  if (phoneExists) {
    return { success: false, message: 'رقم الهاتف هذا مسجل بالفعل لمستخدم آخر.' };
  }

  const finalPerson = { ...person };
  finalPerson.id = Date.now().toString();
  finalPerson.username = person.phone; 
  // Ensure joinedAt exists
  if (!finalPerson.joinedAt) {
      finalPerson.joinedAt = new Date().toISOString();
  }

  db.people.push(finalPerson);
  saveDB(db);
  return { success: true, generatedUsername: finalPerson.username };
};

export const updatePerson = (updatedPerson: Person): boolean => {
  const db = getDB();
  const index = db.people.findIndex(p => p.id === updatedPerson.id);
  if (index !== -1) {
    // Preserve churchId if not passed (safety)
    if (!updatedPerson.churchId) {
        updatedPerson.churchId = db.people[index].churchId;
    }
    if (updatedPerson.phone !== db.people[index].phone) {
        updatedPerson.username = updatedPerson.phone;
    }
    db.people[index] = updatedPerson;
    saveDB(db);
    return true;
  }
  return false;
};

export const deletePerson = (id: string): boolean => {
  const db = getDB();
  const initialLength = db.people.length;
  db.people = db.people.filter(p => p.id !== id);
  
  if (db.people.length < initialLength) {
    db.attendance = db.attendance.filter(a => a.personId !== id);
    saveDB(db);
    return true;
  }
  return false;
};

export const markAttendance = (personId: string, date: string, isPresent: boolean) => {
  const db = getDB();
  // Find person to get churchId
  const person = db.people.find(p => p.id === personId);
  if (!person) return;

  db.attendance = db.attendance.filter(
    a => !(a.personId === personId && a.date === date)
  );
  
  if (isPresent) {
    db.attendance.push({
      id: Date.now().toString(),
      personId,
      date,
      isPresent: true,
      churchId: person.churchId // Save churchId for easier filtering later
    });
  }
  saveDB(db);
};

export const getAttendanceCount = (personId: string): number => {
  const db = getDB();
  return db.attendance.filter(a => a.personId === personId && a.isPresent).length;
};

// --- STAGE MANAGEMENT ---
export const addStage = (stageName: string) => {
  const db = getDB();
  if (!db.stages.includes(stageName)) {
    db.stages.push(stageName);
    saveDB(db);
    return true;
  }
  return false;
};

export const deleteStage = (stageName: string) => {
    const db = getDB();
    if (db.stages.includes(stageName)) {
        db.stages = db.stages.filter(s => s !== stageName);
        saveDB(db);
        return true;
    }
    return false;
};

export const reorderStage = (index: number, direction: 'up' | 'down') => {
    const db = getDB();
    if (direction === 'up' && index > 0) {
        const temp = db.stages[index];
        db.stages[index] = db.stages[index - 1];
        db.stages[index - 1] = temp;
        saveDB(db);
    } else if (direction === 'down' && index < db.stages.length - 1) {
        const temp = db.stages[index];
        db.stages[index] = db.stages[index + 1];
        db.stages[index + 1] = temp;
        saveDB(db);
    }
};

// --- FAMILY MANAGEMENT ---
export const addFamily = (family: Family): boolean => {
  const db = getDB();
  family.id = Date.now().toString();
  if (!family.payments) family.payments = {};
  db.families.push(family);
  saveDB(db);
  return true;
};

export const updateFamily = (updatedFamily: Family): boolean => {
  const db = getDB();
  const index = db.families.findIndex(f => f.id === updatedFamily.id);
  if (index !== -1) {
    // Preserve churchId safety
    if (!updatedFamily.churchId) {
        updatedFamily.churchId = db.families[index].churchId;
    }
    if (!updatedFamily.payments) {
        updatedFamily.payments = db.families[index].payments;
    }
    db.families[index] = updatedFamily;
    saveDB(db);
    return true;
  }
  return false;
};

export const deleteFamily = (id: string): boolean => {
  const db = getDB();
  const initialLength = db.families.length;
  db.families = db.families.filter(f => f.id !== id);
  if (db.families.length < initialLength) {
      saveDB(db);
      return true;
  }
  return false;
};

export const toggleFamilyPayment = (familyId: string, year: number, month: number) => {
    const db = getDB();
    const family = db.families.find(f => f.id === familyId);
    if (family) {
        const key = `${year}-${String(month + 1).padStart(2, '0')}`;
        
        if (!family.payments) family.payments = {};

        if (family.payments[key]) {
            delete family.payments[key];
        } else {
            family.payments[key] = {
                date: new Date().toISOString(),
                handedOver: false
            };
        }
        saveDB(db);
    }
};

export const handoverPayments = (year: number, month: number) => {
    const db = getDB();
    const key = `${year}-${String(month + 1).padStart(2, '0')}`;
    let changed = false;

    db.families.forEach(family => {
        if (family.payments && family.payments[key] && !family.payments[key].handedOver) {
            family.payments[key].handedOver = true;
            changed = true;
        }
    });

    if (changed) saveDB(db);
    return changed;
};

// --- CHAT / FRIENDS MANAGEMENT ---
export const addMessage = (msg: Message) => {
  const db = getDB();
  // Ensure messages array exists
  if (!db.messages) db.messages = [];
  
  db.messages.push(msg);
  // Optional: Limit total messages to prevent LocalStorage overflow
  if (db.messages.length > 500) {
      db.messages = db.messages.slice(-500);
  }
  saveDB(db);
};

export const getMessagesByCode = (code: string) => {
  const db = getDB();
  if (!db.messages) return [];
  return db.messages.filter(m => m.groupCode === code);
};
