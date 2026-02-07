
import { Role } from './types';

export const ROLE_OPTIONS = Object.values(Role);

// Default PINs for initial stages (logic can be expanded for dynamic ones later if needed)
export const STAGE_PINS: Record<string, string> = {
  "إبتدائي (1-2)": "0001",
  "إبتدائي (3-4)": "0002",
  "إبتدائي (5-6)": "0003",
  "إعدادي": "0004",
  "ثانوي": "0005",
  "جامعيين وخريجين": "0006",
};

// Seed data with 10 entries covering different roles
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
  families: [], // Initial empty families list
  people: [
    // 0. Developer (Super Admin)
    {
      id: '0',
      name: 'مطور النظام',
      username: 'R',      
      password: '0000',  
      phone: 'R', // Special case for developer login
      address: 'System',
      diocese: 'المقر',
      stage: "الخدام والكاهن",
      role: Role.Developer,
      notes: 'حساب المطور - يرى كل شيء',
      needsVisitation: false,
      joinedAt: new Date().toISOString()
    },
    // 1. The Priest (Admin)
    {
      id: '1',
      name: 'أبونا أنطونيوس',
      username: '01200000001',
      password: '123',
      phone: '01200000001',
      address: 'الكنيسة',
      diocese: 'شبرا الشمالية',
      stage: "الخدام والكاهن",
      role: Role.Priest,
      notes: 'مشرف الخدمة',
      needsVisitation: false,
      joinedAt: new Date().toISOString()
    },
    // 2. Head Servant
    {
      id: '2',
      name: 'تاسوني مريم',
      username: '01200000002',
      password: '123',
      phone: '01200000002',
      address: 'ش شبرا',
      diocese: 'شبرا الشمالية',
      stage: "الخدام والكاهن",
      role: Role.Servant,
      notes: 'أمينة الخدمة',
      needsVisitation: false,
      joinedAt: new Date().toISOString()
    },
    // 3. Servant
    {
      id: '3',
      name: 'أستاذ مينا',
      username: '01200000003',
      password: '123',
      phone: '01200000003',
      address: 'دوران شبرا',
      diocese: 'شبرا الشمالية',
      stage: "الخدام والكاهن",
      role: Role.Servant,
      notes: 'خادم إبتدائي',
      needsVisitation: false,
      joinedAt: new Date().toISOString()
    },
    // 4. Student (Prim 1-2)
    {
      id: '4',
      name: 'كراس بولس',
      username: '01200000004',
      password: '123',
      phone: '01200000004',
      address: 'الخلفاوي',
      diocese: 'شبرا الشمالية',
      stage: "إبتدائي (1-2)",
      role: Role.Student,
      notes: '',
      needsVisitation: true,
      joinedAt: new Date().toISOString()
    },
    // 5. Student (Prim 3-4)
    {
      id: '5',
      name: 'جوي ماجد',
      username: '01200000005',
      password: '123',
      phone: '01200000005',
      address: 'سانت تريزا',
      diocese: 'شبرا الشمالية',
      stage: "إبتدائي (3-4)",
      role: Role.Student,
      notes: 'مواظبة',
      needsVisitation: false,
      joinedAt: new Date().toISOString()
    },
    // 6. Student (Prim 5-6)
    {
      id: '6',
      name: 'يوسف هاني',
      username: '01200000006',
      password: '123',
      phone: '01200000006',
      address: 'روض الفرج',
      stage: "إبتدائي (5-6)",
      role: Role.Student,
      notes: '',
      needsVisitation: false,
      joinedAt: new Date().toISOString()
    },
    // 7. Student (Prep)
    {
      id: '7',
      name: 'مارتن عادل',
      username: '01200000007',
      password: '123',
      phone: '01200000007',
      address: 'المسرة',
      stage: "إعدادي",
      role: Role.Student,
      notes: 'يحتاج افتقاد',
      needsVisitation: true,
      joinedAt: new Date().toISOString()
    },
    // 8. Student (Secondary)
    {
      id: '8',
      name: 'ساندي سامي',
      username: '01200000008',
      password: '123',
      phone: '01200000008',
      address: 'شيكولاني',
      stage: "ثانوي",
      role: Role.Student,
      notes: '',
      needsVisitation: false,
      joinedAt: new Date().toISOString()
    },
    // 9. Student (Uni)
    {
      id: '9',
      name: 'بيشوي جورج',
      username: '01200000009',
      password: '123',
      phone: '01200000009',
      address: 'الترعة',
      stage: "جامعيين وخريجين",
      role: Role.Student,
      notes: 'شماس',
      needsVisitation: false,
      joinedAt: new Date().toISOString()
    },
    // 10. Student (Grad)
    {
      id: '10',
      name: 'مارينا مجدي',
      username: '01200000010',
      password: '123',
      phone: '01200000010',
      address: 'خلوصي',
      stage: "جامعيين وخريجين",
      role: Role.Student,
      notes: '',
      needsVisitation: false,
      joinedAt: new Date().toISOString()
    }
  ],
  attendance: []
};
