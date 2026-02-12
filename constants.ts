
import { Role } from './types';

export const ROLE_OPTIONS = Object.values(Role);

// Default PINs for initial stages
export const STAGE_PINS: Record<string, string> = {
  "إبتدائي (1-2)": "0001",
  "إبتدائي (3-4)": "0002",
  "إبتدائي (5-6)": "0003",
  "إعدادي": "0004",
  "ثانوي": "0005",
  "جامعيين وخريجين": "0006",
};

// Clean Seed Data - Only Developer Account exists initially
export const SEED_DATA = {
  stages: [
    "إبتدائي (1-2)",
    "إبتدائي (3-4)",
    "إبتدائي (5-6)",
    "إعدادي",
    "ثانوي",
    "جامعيين وخريجين",
    "الخدام والكاهن"
  ],
  families: [], 
  people: [
    // Only Developer Account remains for system initialization
    {
      id: '0',
      name: 'مطور النظام',
      username: 'R',      
      password: '0000',  
      phone: 'R', // Special case for developer login
      address: 'System Admin',
      diocese: 'المقر',
      stage: "الخدام والكاهن",
      role: Role.Developer,
      notes: 'حساب المطور الرئيسي',
      needsVisitation: false,
      joinedAt: new Date().toISOString()
    }
  ],
  attendance: []
};
