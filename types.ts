
// Stage is now a string to allow dynamic additions
export type Stage = string;

export enum Role {
  Developer = "مطور النظام",
  Priest = "كاهن",
  Servant = "خادم",
  Student = "مخدوم"
}

export interface Person {
  id: string;
  name: string;
  username: string; // Will always be equal to phone
  password?: string; 
  phone: string;
  address: string;
  diocese?: string;
  stage: Stage;
  role: Role;
  notes: string;
  needsVisitation: boolean;
  joinedAt: string;
}

export interface PaymentInfo {
  date: string; // ISO Date String
  handedOver: boolean; // True if the servant delivered the money to the church
}

export interface Family {
  id: string;
  familyName: string;
  membersCount: number;
  phone1: string;
  phone2?: string;
  password?: string; // Default '0000'
  // Dictionary where Key is "YYYY-MM"
  payments: Record<string, PaymentInfo>; 
  notes?: string;
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
  stages: string[]; // Dynamic list of stages
  families: Family[]; // New Families list
}
