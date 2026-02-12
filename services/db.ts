
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, update, remove, push, child, get } from 'firebase/database';
import { AppData, Person, AttendanceRecord, Family, Message } from '../types';
import { SEED_DATA } from '../constants';

const firebaseConfig = {
  apiKey: "AIzaSyA07O7dKvygDmF0UDkrRQ6io-4mRN4NNYw",
  authDomain: "karmaty-8c3e2.firebaseapp.com",
  projectId: "karmaty-8c3e2",
  storageBucket: "karmaty-8c3e2.firebasestorage.app",
  messagingSenderId: "870319821130",
  appId: "1:870319821130:web:267abc723c862511cff1b3",
  measurementId: "G-HQQPDS536T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Local cache to maintain synchronous `getDB` behavior for UI components
let localCache: AppData = {
  people: [],
  attendance: [],
  stages: SEED_DATA.stages,
  families: [],
  messages: []
};

// Subscription mechanism for App.tsx
const listeners: Array<() => void> = [];

export const subscribe = (listener: () => void) => {
  listeners.push(listener);
  // Unsubscribe function
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) listeners.splice(index, 1);
  };
};

const notifyListeners = () => {
  listeners.forEach(l => l());
};

// --- REALTIME SYNC ---
const dbRef = ref(db);
onValue(dbRef, (snapshot) => {
  const data = snapshot.val();
  
  if (data) {
    // Firebase stores arrays as Objects if they have custom keys or sparse indexes.
    // We convert them back to Arrays for the App to consume.
    localCache = {
      stages: data.stages || SEED_DATA.stages,
      // Convert Object map to Array
      people: data.people ? Object.values(data.people) : [],
      attendance: data.attendance ? Object.values(data.attendance) : [],
      families: data.families ? Object.values(data.families) : [],
      messages: data.messages ? Object.values(data.messages) : [],
    };
  } else {
    // Database is empty (First run ever) -> Seed it
    seedDatabase();
  }
  notifyListeners();
});

const seedDatabase = () => {
    // Prepare seed data for Firebase (Objects instead of Arrays for collections with IDs)
    const updates: any = {};
    updates['/stages'] = SEED_DATA.stages;
    
    // Seed Developer
    const dev = { ...SEED_DATA.people[0], churchId: 'MAIN' };
    updates[`/people/${dev.id}`] = dev;

    update(ref(db), updates);
};

// --- PUBLIC API ---

export const getDB = (): AppData => {
  return localCache;
};

// NOTE: saveDB is deprecated in Firebase mode as we save granularly. 
// Keeping it empty to satisfy legacy calls if any, but logic is moved to individual functions.
export const saveDB = (data: AppData) => {
  console.warn("saveDB called but Firebase mode uses granular updates.");
};

// --- PEOPLE ---

export const addPerson = (person: Person): { success: boolean; message?: string; generatedUsername?: string } => {
  // Validation
  if (!person.password || person.password.length < 4) {
      return { success: false, message: 'كلمة المرور يجب أن لا تقل عن 4 أرقام/أحرف.' };
  }
  const egyptianPhoneRegex = /^01[0125][0-9]{8}$/;
  if (!egyptianPhoneRegex.test(person.phone)) {
      return { success: false, message: 'رقم الهاتف غير صحيح. يجب أن يكون رقم مصري مكون من 11 رقم.' };
  }
  const churchCodeRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9]{4}$/;
  if (!churchCodeRegex.test(person.churchId)) {
      return { success: false, message: 'كود الكنيسة غير صحيح. يجب أن يكون 4 خانات ويحتوي على: حرف كبير، حرف صغير، ورقم.' };
  }
  
  // Check duplicates in local cache (Optimistic check)
  const phoneExists = localCache.people.some(p => p.phone === person.phone);
  if (phoneExists) {
    return { success: false, message: 'رقم الهاتف هذا مسجل بالفعل لمستخدم آخر.' };
  }

  const finalPerson = { ...person };
  finalPerson.id = person.id || Date.now().toString(); // Ensure ID
  finalPerson.username = person.phone;
  if (!finalPerson.joinedAt) finalPerson.joinedAt = new Date().toISOString();

  // Firebase Write
  set(ref(db, `people/${finalPerson.id}`), finalPerson);
  
  return { success: true, generatedUsername: finalPerson.username };
};

export const updatePerson = (updatedPerson: Person): boolean => {
  if (!updatedPerson.id) return false;
  
  // Preserve churchId logic handled in UI, but safe check here
  const existing = localCache.people.find(p => p.id === updatedPerson.id);
  if (existing && !updatedPerson.churchId) {
      updatedPerson.churchId = existing.churchId;
  }
  if (updatedPerson.phone !== existing?.phone) {
      updatedPerson.username = updatedPerson.phone;
  }

  update(ref(db, `people/${updatedPerson.id}`), updatedPerson);
  return true;
};

export const deletePerson = (id: string): boolean => {
  remove(ref(db, `people/${id}`));
  // Also cleanup attendance
  // Note: In a real DB we might want to query, but here we can iterate or leave orphan records 
  // (leaving orphans is cheaper for now, but let's try to clean if possible)
  // Deleting attendance records requires knowing their IDs. 
  const attendanceToDelete = localCache.attendance.filter(a => a.personId === id);
  const updates: any = {};
  updates[`people/${id}`] = null;
  attendanceToDelete.forEach(a => {
      updates[`attendance/${a.id}`] = null;
  });
  
  update(ref(db), updates);
  return true;
};

// --- ATTENDANCE ---

export const markAttendance = (personId: string, date: string, isPresent: boolean) => {
  const person = localCache.people.find(p => p.id === personId);
  if (!person) return;

  // Check if record exists
  const existingRecord = localCache.attendance.find(a => a.personId === personId && a.date === date);

  if (isPresent) {
      if (!existingRecord) {
          const newRecord: AttendanceRecord = {
              id: `${personId}_${date}`, // Unique Key strategy
              personId,
              date,
              isPresent: true,
              churchId: person.churchId
          };
          set(ref(db, `attendance/${newRecord.id}`), newRecord);
      }
  } else {
      if (existingRecord) {
          remove(ref(db, `attendance/${existingRecord.id}`));
      }
  }
};

export const getAttendanceCount = (personId: string): number => {
  return localCache.attendance.filter(a => a.personId === personId && a.isPresent).length;
};

// --- STAGES ---

export const addStage = (stageName: string) => {
  if (!localCache.stages.includes(stageName)) {
    const newStages = [...localCache.stages, stageName];
    set(ref(db, 'stages'), newStages);
    return true;
  }
  return false;
};

export const deleteStage = (stageName: string) => {
    if (localCache.stages.includes(stageName)) {
        const newStages = localCache.stages.filter(s => s !== stageName);
        set(ref(db, 'stages'), newStages);
        return true;
    }
    return false;
};

export const reorderStage = (index: number, direction: 'up' | 'down') => {
    const newStages = [...localCache.stages];
    if (direction === 'up' && index > 0) {
        [newStages[index], newStages[index - 1]] = [newStages[index - 1], newStages[index]];
        set(ref(db, 'stages'), newStages);
    } else if (direction === 'down' && index < newStages.length - 1) {
        [newStages[index], newStages[index + 1]] = [newStages[index + 1], newStages[index]];
        set(ref(db, 'stages'), newStages);
    }
};

// --- FAMILIES ---

export const addFamily = (family: Family): boolean => {
  family.id = family.id || Date.now().toString();
  if (!family.payments) family.payments = {};
  set(ref(db, `families/${family.id}`), family);
  return true;
};

export const updateFamily = (updatedFamily: Family): boolean => {
  if (!updatedFamily.id) return false;
  
  // Safe merge logic for payments if not provided (though usually provided full)
  const existing = localCache.families.find(f => f.id === updatedFamily.id);
  if (existing) {
      if (!updatedFamily.churchId) updatedFamily.churchId = existing.churchId;
      if (!updatedFamily.payments) updatedFamily.payments = existing.payments;
  }
  
  update(ref(db, `families/${updatedFamily.id}`), updatedFamily);
  return true;
};

export const deleteFamily = (id: string): boolean => {
  remove(ref(db, `families/${id}`));
  return true;
};

export const toggleFamilyPayment = (familyId: string, year: number, month: number) => {
    const family = localCache.families.find(f => f.id === familyId);
    if (family) {
        const key = `${year}-${String(month + 1).padStart(2, '0')}`;
        // Clone payments object
        const newPayments = { ...(family.payments || {}) };
        
        if (newPayments[key]) {
            delete newPayments[key];
        } else {
            newPayments[key] = {
                date: new Date().toISOString(),
                handedOver: false
            };
        }
        
        // Update specific node
        set(ref(db, `families/${familyId}/payments`), newPayments);
    }
};

export const handoverPayments = (year: number, month: number) => {
    const key = `${year}-${String(month + 1).padStart(2, '0')}`;
    const updates: any = {};

    localCache.families.forEach(family => {
        if (family.payments && family.payments[key] && !family.payments[key].handedOver) {
             updates[`families/${family.id}/payments/${key}/handedOver`] = true;
        }
    });

    if (Object.keys(updates).length > 0) {
        update(ref(db), updates);
        return true;
    }
    return false;
};

// --- MESSAGES / CHAT ---

export const addMessage = (msg: Message) => {
  // Use push to generate unique ID and sortable key by time (mostly)
  // Or manually use ID if provided
  if (!msg.id) msg.id = Date.now().toString();
  
  set(ref(db, `messages/${msg.id}`), msg);
  
  // Optional: Cleanup old messages if list gets too big? 
  // For now, Firebase handles large lists well, but listening to all might be heavy.
  // We rely on simple filtering in getMessagesByCode for now.
};

export const getMessagesByCode = (code: string) => {
  // Note: Filtering happens on client side with this implementation. 
  // For production with thousands of messages, we should use Firebase Query `orderByChild('groupCode').equalTo(code)`
  // But for now, we filter the localCache which is kept in sync.
  return localCache.messages.filter(m => m.groupCode === code).sort((a,b) => a.timestamp.localeCompare(b.timestamp));
};
