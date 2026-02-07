
import React from 'react';
import { LayoutDashboard, Users, CalendarCheck, LogOut, UserCog, Grape, ShieldCheck, UserCircle, Database, HeartHandshake } from 'lucide-react';
import { Person, Role } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onChangeView: (view: string) => void;
  onLogout: () => void;
  currentUser: Person;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onChangeView, onLogout, currentUser }) => {
  const isDeveloper = currentUser.role === Role.Developer;

  // Base items visible to everyone
  let navItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
  ];

  // Role Based Navigation
  if (isDeveloper) {
    // Developer sees everything + Database
    navItems.push({ id: 'database', label: 'قاعدة البيانات', icon: Database });
    navItems.push({ id: 'people', label: 'المخدومين', icon: Users }); // Standard View too
    navItems.push({ id: 'attendance', label: 'الغياب', icon: CalendarCheck });
    navItems.push({ id: 'families', label: 'الأسر', icon: HeartHandshake });
  } else if (currentUser.role === Role.Priest || currentUser.role === Role.Servant) {
    navItems.push({ id: 'people', label: 'المخدومين', icon: Users });
    navItems.push({ id: 'attendance', label: 'الغياب', icon: CalendarCheck });
    navItems.push({ id: 'servants', label: 'الخدام', icon: UserCog });
    navItems.push({ id: 'families', label: 'الأسر', icon: HeartHandshake });
  } else if (currentUser.role === Role.Student) {
    navItems.push({ id: 'attendance', label: 'حضوري', icon: CalendarCheck });
  }

  // Everyone has a profile
  navItems.push({ id: 'profile', label: 'حسابي', icon: UserCircle });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Tajawal']">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-100 p-4 flex justify-between items-center sticky top-0 z-20 shadow-sm h-16">
         <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-md ${isDeveloper ? 'bg-slate-900' : 'bg-purple-700'}`}>
               {isDeveloper ? <ShieldCheck size={20} /> : <Grape size={20} />}
            </div>
            <h1 className="font-bold text-lg text-slate-900">
              {isDeveloper ? 'لوحة المطور' : 'كرمتي'}
            </h1>
         </div>
         
         <div className="flex items-center gap-3">
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
              <p className="text-[10px] text-slate-500 font-semibold">{currentUser.role}</p>
            </div>
            <button
              onClick={onLogout}
              className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors"
              title="تسجيل خروج"
            >
              <LogOut size={18} />
            </button>
         </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-28 p-4 md:p-6 max-w-4xl mx-auto w-full">
          {children}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-20 pb-2 px-2 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-30 flex justify-between items-center md:justify-center md:gap-8 overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`flex flex-col items-center justify-center gap-1 w-16 min-w-[64px] h-full transition-all duration-300 relative ${
                isActive
                  ? 'text-purple-700 -translate-y-1'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className={`p-1.5 rounded-full transition-all ${isActive ? 'bg-purple-50 shadow-sm' : 'bg-transparent'}`}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-bold ${isActive ? 'opacity-100' : 'opacity-80'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
