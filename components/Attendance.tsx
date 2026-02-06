
import React, { useState } from 'react';
import { Person, AttendanceRecord, Stage, Role } from '../types';
import { STAGE_OPTIONS, STAGE_PINS } from '../constants';
import { markAttendance } from '../services/db';
import { Check, Lock, Grape, Phone, ArrowRight, XCircle, AlertCircle } from 'lucide-react';

interface AttendanceProps {
  people: Person[];
  attendance: AttendanceRecord[];
  onDataChange: () => void;
  currentUser: Person;
}

export const Attendance: React.FC<AttendanceProps> = ({ people, attendance, onDataChange, currentUser }) => {
  const [view, setView] = useState<'stages' | 'list'>(currentUser.role === Role.Student ? 'list' : 'stages');
  const [selectedStage, setSelectedStage] = useState<Stage | null>(currentUser.role === Role.Student ? currentUser.stage : null);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // PIN Logic States
  const [showPinModal, setShowPinModal] = useState(false);
  const [targetStage, setTargetStage] = useState<Stage | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const isReadOnly = currentUser.role === Role.Student;

  // Helper to get Fridays
  const getFridaysInMonth = (year: number, month: number) => {
    const fridays = [];
    const date = new Date(year, month, 1);
    while (date.getMonth() === month) {
      if (date.getDay() === 5) { // 5 is Friday
        fridays.push(new Date(date));
      }
      date.setDate(date.getDate() + 1);
    }
    return fridays;
  };

  const fridays = getFridaysInMonth(selectedYear, selectedMonth);
  const months = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];

  // Logic to handle stage selection
  const handleStageClick = (stage: Stage) => {
    setTargetStage(stage);
    setPinInput('');
    setPinError(false);
    setShowPinModal(true);
  };

  const verifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStage) return;
    const correctPin = STAGE_PINS[targetStage];
    if (pinInput === correctPin) {
      setSelectedStage(targetStage);
      setView('list');
      setShowPinModal(false);
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  // List Data
  const students = people.filter(p => 
    p.role === Role.Student && 
    (currentUser.role === Role.Student ? p.id === currentUser.id : p.stage === selectedStage)
  );

  const getStatus = (id: string, dateStr: string) => {
    return attendance.find(a => a.personId === id && a.date === dateStr)?.isPresent || false;
  };

  const toggleAttendance = (id: string, dateStr: string, currentStatus: boolean) => {
    if (isReadOnly) return;
    markAttendance(id, dateStr, !currentStatus);
    onDataChange();
  };

  const getMonthAttendanceCount = (studentId: string) => {
    return fridays.reduce((acc, friday) => {
      const dateStr = friday.toISOString().split('T')[0];
      return acc + (getStatus(studentId, dateStr) ? 1 : 0);
    }, 0);
  };

  // Logic for Reward vs Failure
  const isMonthPast = () => {
    const now = new Date();
    // Use a simple comparison: if selected year < current year OR (selected year == current year AND selected month < current month)
    if (selectedYear < now.getFullYear()) return true;
    if (selectedYear === now.getFullYear() && selectedMonth < now.getMonth()) return true;
    return false;
  };

  const getRewardStatus = (studentId: string) => {
    const count = getMonthAttendanceCount(studentId);
    if (count >= 4) return 'success';
    if (isMonthPast()) return 'failed';
    return 'pending';
  };

  // --- RENDER ---

  // 1. PIN Modal
  if (showPinModal) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xs p-6 text-center animate-in zoom-in duration-200">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Lock size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">رمز الدخول</h3>
          <p className="text-slate-600 mb-4 text-xs font-semibold">أدخل الرمز لـ {targetStage}</p>
          
          <form onSubmit={verifyPin}>
            <input 
              type="password" 
              maxLength={4}
              autoFocus
              className={`w-full text-center text-2xl tracking-[0.5em] py-2 border-2 rounded-xl outline-none transition-all mb-4 ${pinError ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:border-purple-500'}`}
              placeholder="••••"
              value={pinInput}
              onChange={(e) => { setPinError(false); setPinInput(e.target.value); }}
            />
            {pinError && <p className="text-red-600 text-xs mb-3 font-bold">الرمز غير صحيح</p>}
            
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowPinModal(false)} className="flex-1 py-2 rounded-xl text-slate-700 bg-slate-100 text-sm font-bold">إلغاء</button>
              <button type="submit" className="flex-1 py-2 rounded-xl bg-purple-600 text-white text-sm font-bold shadow-lg shadow-purple-200">دخول</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 2. Stage Selection
  if (view === 'stages') {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">اختر المرحلة</h2>
          <p className="text-slate-600 text-sm mt-1 font-semibold">القائمة محمية برمز دخول</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {STAGE_OPTIONS.map((stage, index) => (
            <button
              key={stage}
              onClick={() => handleStageClick(stage as Stage)}
              className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="text-right">
                   <h3 className="font-bold text-slate-800">{stage}</h3>
                </div>
              </div>
              <div className="bg-slate-50 p-2 rounded-full">
                 <Lock size={16} className="text-slate-400" />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 3. Attendance List (Card View)
  return (
    <div className="space-y-4">
      {/* Filters Header */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
             {!isReadOnly && (
               <button onClick={() => setView('stages')} className="p-1.5 bg-slate-50 rounded-lg">
                 <ArrowRight size={18} className="text-slate-600" />
               </button>
             )}
             <div>
                <h2 className="font-bold text-slate-800 text-sm">{selectedStage}</h2>
             </div>
           </div>
           
           <div className="flex gap-2">
              <select 
                className="bg-slate-50 text-sm border-none rounded-lg p-1.5 font-bold text-slate-800 outline-none"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
              <select 
                className="bg-slate-50 text-sm border-none rounded-lg p-1.5 font-bold text-slate-800 outline-none"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
           </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 gap-3 pb-4">
        {students.map(student => {
          const rewardStatus = getRewardStatus(student.id);

          return (
            <div key={student.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 relative overflow-hidden">
               <div className="flex items-start justify-between mb-4">
                  {/* Right Side: Info */}
                  <div className="flex items-start gap-3">
                     <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold border-2 border-white shadow-sm">
                        {student.name.charAt(0)}
                     </div>
                     <div>
                        <h3 className="font-bold text-slate-900">{student.name}</h3>
                        <div className="flex items-center gap-1 text-slate-500 mt-1">
                           <Phone size={12} />
                           <span className="text-xs dir-ltr font-mono font-bold">{student.phone}</span>
                        </div>
                     </div>
                  </div>

                  {/* Left Side: Reward Status Icon */}
                  <div className="flex-shrink-0">
                     {rewardStatus === 'success' && (
                        <div className="flex flex-col items-center animate-bounce">
                           <Grape className="text-purple-600 drop-shadow-sm" size={28} fill="currentColor" />
                           <span className="text-[9px] font-bold text-purple-700 mt-1">تمت</span>
                        </div>
                     )}
                     {rewardStatus === 'failed' && (
                        <div className="flex flex-col items-center opacity-50">
                           <XCircle className="text-slate-400" size={28} />
                           <span className="text-[9px] font-bold text-slate-500 mt-1">لم يتم</span>
                        </div>
                     )}
                     {rewardStatus === 'pending' && (
                        <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center">
                           <Grape className="text-slate-300" size={16} />
                        </div>
                     )}
                  </div>
               </div>

               {/* Attendance Toggles - The 4 Marks */}
               <div className="flex items-center justify-between gap-2 bg-slate-50 p-2 rounded-xl">
                  {fridays.map((date, i) => {
                     const dateStr = date.toISOString().split('T')[0];
                     const isPresent = getStatus(student.id, dateStr);
                     
                     return (
                        <div key={i} className="flex flex-col items-center gap-1 flex-1">
                           <span className="text-[10px] text-slate-500 font-bold">{date.getDate()}</span>
                           <button
                             onClick={() => toggleAttendance(student.id, dateStr, isPresent)}
                             disabled={isReadOnly}
                             className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${
                               isPresent 
                                 ? 'bg-purple-700 text-white scale-100' 
                                 : 'bg-white border border-slate-300 text-slate-300'
                             }`}
                           >
                             {isPresent && <Check size={16} strokeWidth={3} />}
                           </button>
                        </div>
                     );
                  })}
               </div>
            </div>
          );
        })}

        {students.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-slate-500">
             <AlertCircle size={32} className="mb-2 opacity-50" />
             <p className="text-sm font-bold">لا توجد أسماء في هذه القائمة</p>
          </div>
        )}
      </div>
    </div>
  );
};
