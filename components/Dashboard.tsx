
import React from 'react';
import { Person, AttendanceRecord, Role } from '../types';
import { Grape, Sparkles, BookOpen, Quote } from 'lucide-react';

interface DashboardProps {
  people: Person[];
  attendance: AttendanceRecord[];
}

export const Dashboard: React.FC<DashboardProps> = ({ people }) => {
  const currentUserRole = people.find(p => p.role === Role.Priest || p.role === Role.Servant)?.role;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Welcome Hero */}
      <div className="bg-gradient-to-br from-purple-800 to-indigo-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Grape size={150} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4 bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
            <Sparkles size={14} className="text-yellow-300" />
            <span className="text-xs font-medium text-purple-100">مرحباً بك في كرمتي</span>
          </div>
          <h2 className="text-3xl font-bold mb-2">خدمة مدارس الأحد</h2>
          <p className="text-purple-200 text-sm max-w-xs leading-relaxed font-semibold">
            نظام متكامل لمتابعة المخدومين والحضور والنمو الروحي بشكل احترافي.
          </p>
        </div>
      </div>

      {/* Daily Verse / Quote */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
        <Quote className="absolute top-4 left-4 text-purple-100" size={40} />
        <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
          <BookOpen size={20} className="text-purple-600" />
          <span>آية اليوم</span>
        </h3>
        <p className="text-slate-800 italic text-center font-serif text-lg leading-loose font-medium">
          "أَنَا الْكَرْمَةُ وَأَنْتُمُ الأَغْصَانُ. الَّذِي يَثْبُتُ فِيَّ وَأَنَا فِيهِ هذَا يَأْتِي بِثَمَرٍ كَثِيرٍ."
        </p>
        <p className="text-left text-xs text-slate-500 mt-4 font-bold">- (يوحنا 15: 5)</p>
      </div>

      {/* Quick Info (Text based, no charts) */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-300 text-center">
         <p className="text-slate-600 text-sm mb-2 font-bold">تاريخ اليوم</p>
         <h4 className="text-2xl font-bold text-slate-900 dir-ltr font-mono">
            {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
         </h4>
         {currentUserRole !== Role.Student && (
           <p className="mt-4 text-xs text-slate-500 font-semibold">
             قم بالانتقال إلى صفحة الغياب لتسجيل حضور اليوم
           </p>
         )}
      </div>
    </div>
  );
};
