
export enum Stage {
  Prim12 = "إبتدائي (1-2)",
  Prim34 = "إبتدائي (3-4)",
  Prim56 = "إبتدائي (5-6)",
  Prep = "إعدادي",
  Secondary = "ثانوي",
  UniGrad = "جامعيين وخريجين",
  Servants = "الخدام والكاهن" // Special stage for hierarchy
}

export enum Role {
  Developer = "مطور النظام", // New Role
  Priest = "كاهن",
  Servant = "خادم",
  Student = "مخدوم"
}

export interface Person {
  id: string;
  name: string;
  username?: string; // For login
  password?: string; // For login
  phone: string;
  address: string;
  governorate?: string; // New Field
  diocese?: string;    // New Field
  stage: Stage;
  role: Role;
  notes: string;
  needsVisitation: boolean;
  joinedAt: string;
}

export interface AttendanceRecord {
  id: string;
  personId: string;
  date: string; // ISO Date string YYYY-MM-DD
  isPresent: boolean;
}

export interface AppData {
  people: Person[];
  attendance: AttendanceRecord[];
}
