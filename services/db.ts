
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

const STORAGE_KEY = 'karmaty_local_db_v1';

// --- HELPER: Load/Save LocalStorage ---
const loadFromLocal = (): AppData | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Error loading local data", e);
  }
  return null;
};

const saveToLocal = (data: AppData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Error saving local data", e);
  }
};

// --- INITIALIZATION ---
// Try to load from LocalStorage first (Instant Load), otherwise fallback to Seed
const initialData = loadFromLocal();
let localCache: AppData = initialData || {
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
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) listeners.splice(index, 1);
  };
};

const notifyListeners = () => {
  listeners.forEach(l => l());
};

// --- REALTIME SYNC (Firebase) ---
const dbRef = ref(db);
onValue(dbRef, (snapshot) => {
  const data = snapshot.val();
  
  if (data) {
    // Firebase stores arrays as Objects sometimes. Convert to Arrays.
    const newCache: AppData = {
      stages: (data.stages || SEED_DATA.stages) as string[],
      people: data.people ? (Object.values(data.people) as Person[]) : [],
      attendance: data.attendance ? (Object.values(data.attendance) as AttendanceRecord[]) : [],
      families: data.families ? (Object.values(data.families) as Family[]) : [],
      messages: data.messages ? (Object.values(data.messages) as Message[]) : [],
    };
    
    // Update local cache from Cloud
    localCache = newCache;
    // Persist Cloud data to LocalStorage for next refresh
    saveToLocal(localCache);
  } else {
    // If Firebase is empty but we have no local data, seed it
    if (!initialData) {
        seedDatabase();
    } else {
        if (localCache.people.length === 0) seedDatabase();
    }
  }
  notifyListeners();
});

const seedDatabase = () => {
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

// --- PEOPLE ---

export const addPerson = (person: Person): { success: boolean; message?: string; generatedUsername?: string } => {
  // 1. Password Validation
  if (!person.password || person.password.length < 4) {
      return { success: false, message: 'كلمة المرور يجب أن لا تقل عن 4 أرقام/أحرف.' };
  }

  // 2. Phone Validation (Sanitize first)
  const cleanPhone = person.phone.replace(/\D/g, ''); // Remove non-digits
  const egyptianPhoneRegex = /^01[0125][0-9]{8}$/;
  
  if (!egyptianPhoneRegex.test(cleanPhone)) {
      return { success: false, message: `رقم الهاتف غير صحيح (${person.phone}).` };
  }
  
  // Update person with clean phone
  person.phone = cleanPhone;

  // 3. Church ID Validation (Allow 'MAIN' for developers/seed)
  if (person.churchId !== 'MAIN') {
      const churchCodeRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9]{4}$/;
      if (!churchCodeRegex.test(person.churchId)) {
          return { success: false, message: `كود الكنيسة غير صحيح (${person.churchId}).` };
      }
  }
  
  // 4. Duplicate Check
  const phoneExists = localCache.people.some(p => p.phone === person.phone);
  if (phoneExists) {
    return { success: false, message: `رقم الهاتف ${person.phone} مسجل بالفعل.` };
  }

  const finalPerson = { ...person };
  finalPerson.id = person.id || Date.now().toString() + Math.floor(Math.random() * 1000);
  finalPerson.username = person.phone;
  if (!finalPerson.joinedAt) finalPerson.joinedAt = new Date().toISOString();

  // Optimistic Update (Local First)
  localCache.people.push(finalPerson);
  saveToLocal(localCache);
  notifyListeners();

  // Cloud Update
  set(ref(db, `people/${finalPerson.id}`), finalPerson);
  
  return { success: true, generatedUsername: finalPerson.username };
};

export const updatePerson = (updatedPerson: Person): boolean => {
  if (!updatedPerson.id) return false;
  
  const existingIndex = localCache.people.findIndex(p => p.id === updatedPerson.id);
  if (existingIndex > -1) {
      // Preserve data
      if (!updatedPerson.churchId) updatedPerson.churchId = localCache.people[existingIndex].churchId;
      if (updatedPerson.phone !== localCache.people[existingIndex].phone) {
          updatedPerson.username = updatedPerson.phone;
      }
      
      // Optimistic Update
      localCache.people[existingIndex] = updatedPerson;
      saveToLocal(localCache);
      notifyListeners();

      // Cloud
      update(ref(db, `people/${updatedPerson.id}`), updatedPerson);
      return true;
  }
  return false;
};

export const deletePerson = (id: string): boolean => {
  // Optimistic Update
  localCache.people = localCache.people.filter(p => p.id !== id);
  localCache.attendance = localCache.attendance.filter(a => a.personId !== id);
  saveToLocal(localCache);
  notifyListeners();

  // Cloud
  remove(ref(db, `people/${id}`));
  return true;
};

// --- ATTENDANCE ---

export const markAttendance = (personId: string, date: string, isPresent: boolean) => {
  const person = localCache.people.find(p => p.id === personId);
  if (!person) return;

  const existingIndex = localCache.attendance.findIndex(a => a.personId === personId && a.date === date);

  if (isPresent) {
      if (existingIndex === -1) {
          const newRecord: AttendanceRecord = {
              id: `${personId}_${date}`,
              personId,
              date,
              isPresent: true,
              churchId: person.churchId
          };
          
          // Optimistic
          localCache.attendance.push(newRecord);
          saveToLocal(localCache);
          notifyListeners();

          set(ref(db, `attendance/${newRecord.id}`), newRecord);
      }
  } else {
      if (existingIndex > -1) {
          const recordId = localCache.attendance[existingIndex].id;
          
          // Optimistic
          localCache.attendance.splice(existingIndex, 1);
          saveToLocal(localCache);
          notifyListeners();

          remove(ref(db, `attendance/${recordId}`));
      }
  }
};

export const getAttendanceCount = (personId: string): number => {
  return localCache.attendance.filter(a => a.personId === personId && a.isPresent).length;
};

// --- STAGES ---

export const addStage = (stageName: string) => {
  if (!localCache.stages.includes(stageName)) {
    localCache.stages.push(stageName);
    saveToLocal(localCache);
    notifyListeners();
    set(ref(db, 'stages'), localCache.stages);
    return true;
  }
  return false;
};

export const deleteStage = (stageName: string) => {
    if (localCache.stages.includes(stageName)) {
        localCache.stages = localCache.stages.filter(s => s !== stageName);
        saveToLocal(localCache);
        notifyListeners();
        set(ref(db, 'stages'), localCache.stages);
        return true;
    }
    return false;
};

export const reorderStage = (index: number, direction: 'up' | 'down') => {
    const newStages = [...localCache.stages];
    if (direction === 'up' && index > 0) {
        [newStages[index], newStages[index - 1]] = [newStages[index - 1], newStages[index]];
    } else if (direction === 'down' && index < newStages.length - 1) {
        [newStages[index], newStages[index + 1]] = [newStages[index + 1], newStages[index]];
    } else {
        return;
    }
    
    localCache.stages = newStages;
    saveToLocal(localCache);
    notifyListeners();
    set(ref(db, 'stages'), newStages);
};

// --- FAMILIES ---

export const addFamily = (family: Family): boolean => {
  family.id = family.id || Date.now().toString() + Math.floor(Math.random() * 1000);
  if (!family.payments) family.payments = {};
  
  // Clean phone numbers
  family.phone1 = family.phone1.replace(/\D/g, '');
  if (family.phone2) family.phone2 = family.phone2.replace(/\D/g, '');

  localCache.families.push(family);
  saveToLocal(localCache);
  notifyListeners();

  set(ref(db, `families/${family.id}`), family);
  return true;
};

export const updateFamily = (updatedFamily: Family): boolean => {
  if (!updatedFamily.id) return false;
  
  const idx = localCache.families.findIndex(f => f.id === updatedFamily.id);
  if (idx > -1) {
      const existing = localCache.families[idx];
      if (!updatedFamily.churchId) updatedFamily.churchId = existing.churchId;
      if (!updatedFamily.payments) updatedFamily.payments = existing.payments;

      localCache.families[idx] = updatedFamily;
      saveToLocal(localCache);
      notifyListeners();

      update(ref(db, `families/${updatedFamily.id}`), updatedFamily);
      return true;
  }
  return false;
};

export const deleteFamily = (id: string): boolean => {
  localCache.families = localCache.families.filter(f => f.id !== id);
  saveToLocal(localCache);
  notifyListeners();

  remove(ref(db, `families/${id}`));
  return true;
};

export const toggleFamilyPayment = (familyId: string, year: number, month: number) => {
    const idx = localCache.families.findIndex(f => f.id === familyId);
    if (idx > -1) {
        const family = localCache.families[idx];
        const key = `${year}-${String(month + 1).padStart(2, '0')}`;
        
        const newPayments = { ...(family.payments || {}) };
        if (newPayments[key]) {
            delete newPayments[key];
        } else {
            newPayments[key] = {
                date: new Date().toISOString(),
                handedOver: false
            };
        }
        
        // Update Local
        localCache.families[idx] = { ...family, payments: newPayments };
        saveToLocal(localCache);
        notifyListeners();

        // Update Cloud
        set(ref(db, `families/${familyId}/payments`), newPayments);
    }
};

export const handoverPayments = (year: number, month: number) => {
    const key = `${year}-${String(month + 1).padStart(2, '0')}`;
    const updates: any = {};
    let changed = false;

    localCache.families.forEach(family => {
        if (family.payments && family.payments[key] && !family.payments[key].handedOver) {
             family.payments[key].handedOver = true; // Local update
             updates[`families/${family.id}/payments/${key}/handedOver`] = true; // Cloud update prep
             changed = true;
        }
    });

    if (changed) {
        saveToLocal(localCache);
        notifyListeners();
        update(ref(db), updates);
        return true;
    }
    return false;
};

// --- MESSAGES / CHAT ---

export const addMessage = (msg: Message) => {
  if (!msg.id) msg.id = Date.now().toString();
  
  localCache.messages.push(msg);
  saveToLocal(localCache);
  notifyListeners(); // Instant UI update

  set(ref(db, `messages/${msg.id}`), msg);
};

export const getMessagesByCode = (code: string) => {
  return localCache.messages.filter(m => m.groupCode === code).sort((a,b) => a.timestamp.localeCompare(b.timestamp));
};
