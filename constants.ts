
import { Role } from './types';

export const ROLE_OPTIONS = Object.values(Role);

// Default PINs for initial stages
// Note: 'إعدادي وثانوي' combined
export const STAGE_PINS: Record<string, string> = {
  "حضانة": "0001",
  "إبتدائي (1-2)": "0002",
  "إبتدائي (3-4)": "0003",
  "إبتدائي (5-6)": "0004",
  "إعدادي وثانوي": "0005",
  "جامعيين وخريجين": "0006",
};

// Clean Seed Data
export const SEED_DATA = {
  stages: [
    "حضانة",
    "إبتدائي (1-2)",
    "إبتدائي (3-4)",
    "إبتدائي (5-6)",
    "إعدادي وثانوي",
    "جامعيين وخريجين",
    "الخدام والكاهن"
  ],
  families: [], 
  people: [
    // 1. Developer Account (The Root)
    {
      id: 'dev_root_system', // Fixed ID to prevent duplication
      name: 'مطور النظام',
      username: '0000',      
      password: '0000',  
      phone: '0000', 
      address: 'System Admin',
      diocese: 'المقر',
      churchId: 'MAIN',
      stage: "الخدام والكاهن",
      role: Role.Developer,
      notes: 'حساب المطور الرئيسي',
      needsVisitation: false,
      joinedAt: new Date().toISOString()
    },
    // --- 10 RANDOM SERVANTS (DEMO DATA) ---
    {
      id: 'srv_demo_01', name: 'مينا مجدي', username: '01211111111', password: '0000', phone: '01211111111',
      address: 'شارع الكنيسة', churchId: 'Krm1', stage: "الخدام والكاهن", role: Role.Servant, notes: 'أمين خدمة', needsVisitation: false, joinedAt: new Date().toISOString()
    },
    {
      id: 'srv_demo_02', name: 'مارينا عماد', username: '01222222222', password: '0000', phone: '01222222222',
      address: 'منشية الصدر', churchId: 'Krm1', stage: "الخدام والكاهن", role: Role.Servant, notes: '', needsVisitation: false, joinedAt: new Date().toISOString()
    },
    {
      id: 'srv_demo_03', name: 'كيرلس عادل', username: '01233333333', password: '0000', phone: '01233333333',
      address: 'الزيتون', churchId: 'Krm1', stage: "الخدام والكاهن", role: Role.Servant, notes: 'مسؤول الافتقاد', needsVisitation: false, joinedAt: new Date().toISOString()
    },
    {
      id: 'srv_demo_04', name: 'فيفيان يوسف', username: '01244444444', password: '0000', phone: '01244444444',
      address: 'مصر الجديدة', churchId: 'Krm1', stage: "الخدام والكاهن", role: Role.Servant, notes: '', needsVisitation: false, joinedAt: new Date().toISOString()
    },
    {
      id: 'srv_demo_05', name: 'أبانوب جرجس', username: '01255555555', password: '0000', phone: '01255555555',
      address: 'حدائق القبة', churchId: 'Krm1', stage: "الخدام والكاهن", role: Role.Servant, notes: 'منسق الأنشطة', needsVisitation: false, joinedAt: new Date().toISOString()
    },
    {
      id: 'srv_demo_06', name: 'سارة سامي', username: '01266666666', password: '0000', phone: '01266666666',
      address: 'الوايلي', churchId: 'Krm1', stage: "الخدام والكاهن", role: Role.Servant, notes: '', needsVisitation: false, joinedAt: new Date().toISOString()
    },
    {
      id: 'srv_demo_07', name: 'بيتر هاني', username: '01277777777', password: '0000', phone: '01277777777',
      address: 'العباسية', churchId: 'Krm1', stage: "الخدام والكاهن", role: Role.Servant, notes: '', needsVisitation: false, joinedAt: new Date().toISOString()
    },
    {
      id: 'srv_demo_08', name: 'كريستين نبيل', username: '01288888888', password: '0000', phone: '01288888888',
      address: 'شبرا', churchId: 'Krm1', stage: "الخدام والكاهن", role: Role.Servant, notes: '', needsVisitation: false, joinedAt: new Date().toISOString()
    },
    {
      id: 'srv_demo_09', name: 'يوسف ماجد', username: '01299999999', password: '0000', phone: '01299999999',
      address: 'مدينة نصر', churchId: 'Krm1', stage: "الخدام والكاهن", role: Role.Servant, notes: 'مسؤول الترانيم', needsVisitation: false, joinedAt: new Date().toISOString()
    },
    {
      id: 'srv_demo_10', name: 'مارتينا وجدي', username: '01500000000', password: '0000', phone: '01500000000',
      address: 'حلمية الزيتون', churchId: 'Krm1', stage: "الخدام والكاهن", role: Role.Servant, notes: '', needsVisitation: false, joinedAt: new Date().toISOString()
    },
    // --- NEW SERVANTS ADDED BY REQUEST ---
    {
      id: 'srv_mariam_e', name: 'مريم عزت', username: '01201010101', password: '0000', phone: '01201010101',
      address: 'غير محدد', churchId: 'Krm1', stage: "الخدام والكاهن", role: Role.Servant, notes: '', needsVisitation: false, joinedAt: new Date().toISOString()
    },
    {
      id: 'srv_mariam_s', name: 'مريم سنور', username: '01202020202', password: '0000', phone: '01202020202',
      address: 'غير محدد', churchId: 'Krm1', stage: "الخدام والكاهن", role: Role.Servant, notes: '', needsVisitation: false, joinedAt: new Date().toISOString()
    },
    {
      id: 'srv_meri_g', name: 'ميري جورج', username: '01203030303', password: '0000', phone: '01203030303',
      address: 'غير محدد', churchId: 'Krm1', stage: "الخدام والكاهن", role: Role.Servant, notes: '', needsVisitation: false, joinedAt: new Date().toISOString()
    },
    {
      id: 'srv_aida_e', name: 'عايدة اقلاديوس', username: '01204040404', password: '0000', phone: '01204040404',
      address: 'غير محدد', churchId: 'Krm1', stage: "الخدام والكاهن", role: Role.Servant, notes: '', needsVisitation: false, joinedAt: new Date().toISOString()
    },
    {
      id: 'srv_jacklin_y', name: 'جاكلين يعقوب', username: '01205050505', password: '0000', phone: '01205050505',
      address: 'غير محدد', churchId: 'Krm1', stage: "الخدام والكاهن", role: Role.Servant, notes: '', needsVisitation: false, joinedAt: new Date().toISOString()
    },
    {
      id: 'srv_rasha_a', name: 'رشا عطية', username: '01206060606', password: '0000', phone: '01206060606',
      address: 'غير محدد', churchId: 'Krm1', stage: "الخدام والكاهن", role: Role.Servant, notes: '', needsVisitation: false, joinedAt: new Date().toISOString()
    },
    {
      id: 'srv_magdy', name: 'مجدي', username: '01207070707', password: '0000', phone: '01207070707',
      address: 'غير محدد', churchId: 'Krm1', stage: "الخدام والكاهن", role: Role.Servant, notes: '', needsVisitation: false, joinedAt: new Date().toISOString()
    },
    {
      id: 'srv_bishoy_h', name: 'بيشوي حنين', username: '01208080808', password: '0000', phone: '01208080808',
      address: 'غير محدد', churchId: 'Krm1', stage: "الخدام والكاهن", role: Role.Servant, notes: '', needsVisitation: false, joinedAt: new Date().toISOString()
    },
    {
      id: 'srv_romany_g', name: 'روماني جورج', username: '01209090909', password: '0000', phone: '01209090909',
      address: 'غير محدد', churchId: 'Krm1', stage: "الخدام والكاهن", role: Role.Servant, notes: '', needsVisitation: false, joinedAt: new Date().toISOString()
    }
  ],
  attendance: []
};
