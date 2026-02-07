
import { AppData, Person, AttendanceRecord, Family } from '../types';
import { SEED_DATA } from '../constants';

const DB_KEY = 'sunday_school_db_v7'; // Incremented version for schema change

export const getDB = (): AppData => {
  const data = localStorage.getItem(DB_KEY);
  if (!data) {
    // Initialize with seed data and empty families
    const seed: AppData = {
        ...SEED_DATA,
        families: [] 
    }
    localStorage.setItem(DB_KEY, JSON.stringify(seed));
    return seed;
  }
  const parsed = JSON.parse(data);
  // Migration checks
  if (!parsed.stages) parsed.stages = SEED_DATA.stages;
  if (!parsed.families) parsed.families = [];

  // Migrate old payment string format to object format if necessary
  parsed.families.forEach((f: any) => {
      if (f.payments) {
          Object.keys(f.payments).forEach(key => {
              if (typeof f.payments[key] === 'string') {
                  f.payments[key] = { date: f.payments[key], handedOver: false };
              }
          });
      }
  });
  
  return parsed;
};

export const saveDB = (data: AppData) => {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
};

export const addPerson = (person: Person): { success: boolean; message?: string; generatedUsername?: string } => {
  const db = getDB();
  
  const phoneExists = db.people.some(p => p.phone === person.phone);
  if (phoneExists) {
    return { success: false, message: 'رقم الهاتف هذا مسجل بالفعل.' };
  }

  const finalPerson = { ...person };
  finalPerson.id = Date.now().toString();
  finalPerson.username = person.phone; // Username is ALWAYS phone

  db.people.push(finalPerson);
  saveDB(db);
  return { success: true, generatedUsername: finalPerson.username };
};

export const updatePerson = (updatedPerson: Person) => {
  const db = getDB();
  const index = db.people.findIndex(p => p.id === updatedPerson.id);
  if (index !== -1) {
    // Ensure consistency
    if (updatedPerson.phone !== db.people[index].phone) {
        updatedPerson.username = updatedPerson.phone;
    }
    db.people[index] = updatedPerson;
    saveDB(db);
  }
};

export const deletePerson = (id: string) => {
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
        // Swap with previous
        const temp = db.stages[index];
        db.stages[index] = db.stages[index - 1];
        db.stages[index - 1] = temp;
        saveDB(db);
    } else if (direction === 'down' && index < db.stages.length - 1) {
        // Swap with next
        const temp = db.stages[index];
        db.stages[index] = db.stages[index + 1];
        db.stages[index + 1] = temp;
        saveDB(db);
    }
};

// --- FAMILY MANAGEMENT ---
export const addFamily = (family: Family) => {
  const db = getDB();
  family.id = Date.now().toString();
  // Ensure payments object exists
  if (!family.payments) family.payments = {};
  db.families.push(family);
  saveDB(db);
};

export const updateFamily = (updatedFamily: Family) => {
  const db = getDB();
  const index = db.families.findIndex(f => f.id === updatedFamily.id);
  if (index !== -1) {
    // Preserve payments if not passed in update
    if (!updatedFamily.payments) {
        updatedFamily.payments = db.families[index].payments;
    }
    db.families[index] = updatedFamily;
    saveDB(db);
  }
};

export const deleteFamily = (id: string) => {
  const db = getDB();
  db.families = db.families.filter(f => f.id !== id);
  saveDB(db);
};

export const toggleFamilyPayment = (familyId: string, year: number, month: number) => {
    const db = getDB();
    const family = db.families.find(f => f.id === familyId);
    if (family) {
        const key = `${year}-${String(month + 1).padStart(2, '0')}`;
        
        if (!family.payments) family.payments = {};

        if (family.payments[key]) {
            // If exists, remove it (Mark as unpaid)
            delete family.payments[key];
        } else {
            // If doesn't exist, add current date (Mark as paid, not handed over yet)
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
