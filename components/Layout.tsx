
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, CalendarCheck, LogOut, UserCog, Grape, ShieldCheck, UserCircle, Database, HeartHandshake, MessageCircle, CreditCard, Heart, Smartphone, Copy } from 'lucide-react';
import { Person, Role } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onChangeView: (view: string) => void;
  onLogout: () => void;
  currentUser: Person;
}

const DonationBanner = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev === 0 ? 1 : 0));
    }, 5000); // Rotate every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('تم نسخ الرقم: ' + text);
  };

  return (
    <div className="mx-4 mt-4 mb-2 rounded-2xl overflow-hidden shadow-md relative h-28 sm:h-24 transition-all duration-500">
       {/* Slide 1: Donation/Dev Support */}
       <div className={`absolute inset-0 bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-between px-6 transition-opacity duration-700 ${activeSlide === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
          <div className="text-white flex-1">
             <div className="flex items-center gap-2 mb-1">
                <Heart className="text-pink-500 fill-pink-500 animate-pulse" size={20} />
                <h3 className="font-bold text-sm sm:text-base">ساهم في تطوير التطبيق</h3>
             </div>
             <p className="text-[10px] sm:text-xs text-purple-200 font-medium mb-2">تبرعك يساعدنا في إضافة ميزات جديدة وتحسين الخدمة.</p>
             <div className="flex flex-wrap gap-3">
                 <button onClick={() => handleCopy('01204062941')} className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-[10px] text-white transition-colors border border-white/10">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Instapay_logo.png/600px-Instapay_logo.png?20230815132333" className="w-4 h-4 object-contain invert" alt="IP" />
                    <span className="font-mono font-bold dir-ltr">01204062941</span>
                 </button>
                  <button onClick={() => handleCopy('01017090618')} className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-[10px] text-white transition-colors border border-white/10">
                    <Smartphone size={12} />
                    <span className="font-mono font-bold dir-ltr">01017090618</span>
                 </button>
             </div>
          </div>
          <div className="hidden sm:block opacity-20">
              <Database size={60} />
          </div>
       </div>

       {/* Slide 2: Subscription */}
       <div className={`absolute inset-0 bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 flex items-center justify-between px-6 transition-opacity duration-700 ${activeSlide === 1 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
          <div className="text-white flex-1">
             <div className="flex items-center gap-2 mb-1">
                <CreditCard className="text-emerald-400" size={20} />
                <h3 className="font-bold text-sm sm:text-base">دفع اشتراك الخدمة</h3>
             </div>
             <p className="text-[10px] sm:text-xs text-teal-200 font-medium mb-2">يمكنك دفع اشتراكك الشهري أو السنوي بسهولة.</p>
             <div className="flex flex-wrap gap-3">
                 <button onClick={() => handleCopy('01204062941')} className="flex items-center gap-1 bg-emerald-500/20 hover:bg-emerald-500/30 px-2 py-1 rounded text-[10px] text-emerald-100 transition-colors border border-emerald-500/30">
                    <span className="font-bold">InstaPay:</span>
                    <span className="font-mono font-bold dir-ltr">01204062941</span>
                 </button>
                 <button onClick={() => handleCopy('01017090618')} className="flex items-center gap-1 bg-emerald-500/20 hover:bg-emerald-500/30 px-2 py-1 rounded text-[10px] text-emerald-100 transition-colors border border-emerald-500/30">
                    <span className="font-bold">Wallet:</span>
                    <span className="font-mono font-bold dir-ltr">01017090618</span>
                 </button>
             </div>
          </div>
          <div className="hidden sm:block opacity-20">
              <HeartHandshake size={60} />
          </div>
       </div>
       
       {/* Dots */}
       <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20">
          <div className={`w-1.5 h-1.5 rounded-full transition-all ${activeSlide === 0 ? 'bg-white w-3' : 'bg-white/40'}`} />
          <div className={`w-1.5 h-1.5 rounded-full transition-all ${activeSlide === 1 ? 'bg-white w-3' : 'bg-white/40'}`} />
       </div>
    </div>
  );
};

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
    navItems.push({ id: 'friends', label: 'الأصدقاء', icon: MessageCircle });
  } else if (currentUser.role === Role.Priest || currentUser.role === Role.Servant) {
    navItems.push({ id: 'people', label: 'المخدومين', icon: Users });
    navItems.push({ id: 'attendance', label: 'الغياب', icon: CalendarCheck });
    navItems.push({ id: 'servants', label: 'الخدام', icon: UserCog });
    navItems.push({ id: 'families', label: 'الأسر', icon: HeartHandshake });
    navItems.push({ id: 'friends', label: 'الأصدقاء', icon: MessageCircle });
  } else if (currentUser.role === Role.Student) {
    navItems.push({ id: 'attendance', label: 'حضوري', icon: CalendarCheck });
    navItems.push({ id: 'friends', label: 'الأصدقاء', icon: MessageCircle });
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
      <main className="flex-1 overflow-y-auto pb-28 md:p-6 max-w-4xl mx-auto w-full">
          <DonationBanner />
          <div className="p-4 pt-2">
             {children}
          </div>
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
