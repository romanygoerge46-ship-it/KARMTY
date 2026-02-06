
import { Stage, Role } from './types';

export const STAGE_OPTIONS = Object.values(Stage).filter(s => s !== Stage.Servants); // Hide Servants stage from dropdowns for students
export const ROLE_OPTIONS = Object.values(Role);

// Egyptian Governorates for Dropdown
export const GOVERNORATES = [
  "القاهرة", "الجيزة", "القليوبية", "الإسكندرية", "البحيرة", "مطروح", "دمياط", "الدقهلية", "كفر الشيخ", "الغربية", "المنوفية", "الشرقية", "بورسعيد", "الإسماعيلية", "السويس", "شمال سيناء", "جنوب سيناء", "بني سويف", "الفيوم", "المنيا", "أسيوط", "الوادي الجديد", "سوهاج", "قنا", "الأقصر", "أسوان", "البحر الأحمر"
];

// Map stages to PINs: 0001, 0002, etc.
export const STAGE_PINS: Record<string, string> = {
  [Stage.Prim12]: "0001",
  [Stage.Prim34]: "0002",
  [Stage.Prim56]: "0003",
  [Stage.Prep]: "0004",
  [Stage.Secondary]: "0005",
  [Stage.UniGrad]: "0006",
};

// Seed data with 10 entries covering different roles
export const SEED_DATA = {
  people: [
    // 0. Developer (Super Admin)
    {
      id: '0',
      name: 'مطور النظام',
      username: 'R',      // Updated
      password: '0000',   // Updated
      phone: '00000000000',
      address: 'System',
      governorate: 'القاهرة',
      diocese: 'المقر',
      stage: Stage.Servants,
      role: Role.Developer,
      notes: 'حساب المطور - يرى كل شيء',
      needsVisitation: false,
      joinedAt: new Date().toISOString()
    },
    // 1. The Priest (Admin)
    {
      id: '1',
      name: 'أبونا أنطونيوس',
      username: 'abouna',
      password: '123',
      phone: '01200000001',
      address: 'الكنيسة',
      governorate: 'القاهرة',
      diocese: 'شبرا الشمالية',
      stage: Stage.Servants,
      role: Role.Priest,
      notes: 'مشرف الخدمة',
      needsVisitation: false,
      joinedAt: new Date().toISOString()
    },
    // 2. Head Servant
    {
      id: '2',
      name: 'تاسوني مريم',
      username: 'maryam',
      password: '123',
      phone: '01200000002',
      address: 'ش شبرا',
      governorate: 'القاهرة',
      diocese: 'شبرا الشمالية',
      stage: Stage.Servants,
      role: Role.Servant,
      notes: 'أمينة الخدمة',
      needsVisitation: false,
      joinedAt: new Date().toISOString()
    },
    // 3. Servant
    {
      id: '3',
      name: 'أستاذ مينا',
      username: 'mina',
      password: '123',
      phone: '01200000003',
      address: 'دوران شبرا',
      governorate: 'القاهرة',
      diocese: 'شبرا الشمالية',
      stage: Stage.Servants,
      role: Role.Servant,
      notes: 'خادم إبتدائي',
      needsVisitation: false,
      joinedAt: new Date().toISOString()
    },
    // 4. Student (Prim 1-2)
    {
      id: '4',
      name: 'كراس بولس',
      username: 'kyrillos',
      password: '123',
      phone: '01200000004',
      address: 'الخلفاوي',
      governorate: 'القاهرة',
      diocese: 'شبرا الشمالية',
      stage: Stage.Prim12,
      role: Role.Student,
      notes: '',
      needsVisitation: true,
      joinedAt: new Date().toISOString()
    },
    // 5. Student (Prim 3-4)
    {
      id: '5',
      name: 'جوي ماجد',
      username: 'joy',
      password: '123',
      phone: '01200000005',
      address: 'سانت تريزا',
      governorate: 'القاهرة',
      diocese: 'شبرا الشمالية',
      stage: Stage.Prim34,
      role: Role.Student,
      notes: 'مواظبة',
      needsVisitation: false,
      joinedAt: new Date().toISOString()
    },
    // 6. Student (Prim 5-6)
    {
      id: '6',
      name: 'يوسف هاني',
      phone: '01200000006',
      address: 'روض الفرج',
      stage: Stage.Prim56,
      role: Role.Student,
      notes: '',
      needsVisitation: false,
      joinedAt: new Date().toISOString()
    },
    // 7. Student (Prep)
    {
      id: '7',
      name: 'مارتن عادل',
      phone: '01200000007',
      address: 'المسرة',
      stage: Stage.Prep,
      role: Role.Student,
      notes: 'يحتاج افتقاد',
      needsVisitation: true,
      joinedAt: new Date().toISOString()
    },
    // 8. Student (Secondary)
    {
      id: '8',
      name: 'ساندي سامي',
      phone: '01200000008',
      address: 'شيكولاني',
      stage: Stage.Secondary,
      role: Role.Student,
      notes: '',
      needsVisitation: false,
      joinedAt: new Date().toISOString()
    },
    // 9. Student (Uni)
    {
      id: '9',
      name: 'بيشوي جورج',
      phone: '01200000009',
      address: 'الترعة',
      stage: Stage.UniGrad,
      role: Role.Student,
      notes: 'شماس',
      needsVisitation: false,
      joinedAt: new Date().toISOString()
    },
    // 10. Student (Grad)
    {
      id: '10',
      name: 'مارينا مجدي',
      phone: '01200000010',
      address: 'خلوصي',
      stage: Stage.UniGrad,
      role: Role.Student,
      notes: '',
      needsVisitation: false,
      joinedAt: new Date().toISOString()
    }
  ],
  attendance: []
};
