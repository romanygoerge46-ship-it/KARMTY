
import React, { useState } from 'react';
import { LogIn, UserPlus, Grape, Zap, AlertTriangle, ArrowLeft, CheckCircle, Code, ShieldCheck, Loader2, Phone, Lock, User } from 'lucide-react';
import { Person, Role } from '../types';
import { getDB, addPerson } from '../services/db';

interface LoginProps {
  onLogin: (user: Person) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'instant' | 'login' | 'register'>('instant');
  
  // Instant Auth State
  const [instantMode, setInstantMode] = useState<'new' | 'existing'>('new');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [visitorName, setVisitorName] = useState('');
  
  // Standard Auth State
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  
  // Developer Mode Transition State
  const [isDevAccessing, setIsDevAccessing] = useState(false);
  
  // Collision Handling (Smart Login)
  const [multiUserSelect, setMultiUserSelect] = useState<Person[] | null>(null);
  
  const [error, setError] = useState<string | null>(null);

  const db = getDB();

  // Helper: Complete Login and Remember Device
  const completeLogin = (user: Person) => {
      try {
        localStorage.setItem('karmaty_last_user_id', user.id);
      } catch (e) {
        console.error("Could not save to local storage", e);
      }
      onLogin(user);
  };

  // --- Instant Registration Logic ---
  const handleInstantRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Developer Check (Direct)
    if (pin === '0000') {
        initiateDevLogin();
        return;
    }

    // 2. Validation
    if (!visitorName.trim()) {
        setError('يرجى كتابة الاسم للبدء');
        return;
    }

    if (pin.length < 4) {
        setError('يرجى اختيار رقم سري مكون من 4 أرقام على الأقل');
        return;
    }

    if (pin !== confirmPin) {
        setError('الأرقام السرية غير متطابقة');
        return;
    }

    // Create Guest
    const randomSuffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    const fakePhone = `012${randomSuffix}`;
    const validChurchCode = 'Krm1'; 

    const newPerson: Person = {
        id: '', 
        name: visitorName, 
        username: fakePhone,
        phone: fakePhone,
        password: pin,
        address: 'تسجيل فوري',
        diocese: '',
        churchId: validChurchCode,
        stage: 'الخدام والكاهن',
        role: Role.Servant,
        notes: 'تم التسجيل عبر الدخول الفوري',
        needsVisitation: false,
        joinedAt: new Date().toISOString()
    };

    const result = addPerson(newPerson);
    if (result.success) {
        const createdUser = getDB().people.find(p => p.username === fakePhone);
        if (createdUser) {
            completeLogin(createdUser);
        } else {
            completeLogin({ ...newPerson, id: Date.now().toString() });
        }
    } else {
        setError(result.message || 'حدث خطأ أثناء التسجيل، حاول مرة أخرى');
    }
  };

  const initiateDevLogin = () => {
      setError(null);
      setIsDevAccessing(true);

      // Try to find existing dev
      const dev = db.people.find(p => p.role === Role.Developer);
      
      // Fallback Dev Object if not found in DB
      const fallbackDev: Person = {
          id: 'dev_emergency_access',
          name: 'مطور النظام',
          username: '0000',
          phone: '0000',
          password: '0000',
          role: Role.Developer,
          stage: 'الخدام والكاهن',
          address: 'System',
          churchId: 'MAIN',
          notes: 'Emergency Access',
          needsVisitation: false,
          joinedAt: new Date().toISOString()
      };

      // Visual Delay for "Loading" effect
      setTimeout(() => {
          completeLogin(dev || fallbackDev);
      }, 1000);
  };

  const handleInstantLogin = (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setMultiUserSelect(null);
      
      // 1. Developer Check (Direct Login)
      if (pin === '0000') {
          initiateDevLogin();
          return;
      }

      // 2. Search users by PIN
      const matches = db.people.filter(p => p.password === pin && p.role !== Role.Developer);
      
      if (matches.length === 0) {
          setError('الرقم السري غير صحيح أو غير مسجل');
          return;
      }

      if (matches.length === 1) {
          completeLogin(matches[0]);
          return;
      }

      // 3. Smart Handling for Multiple Matches
      const lastUserId = localStorage.getItem('karmaty_last_user_id');
      const knownUser = matches.find(p => p.id === lastUserId);
      
      if (knownUser) {
          completeLogin(knownUser);
      } else {
          setMultiUserSelect(matches);
      }
  };

  // --- Standard Login Logic ---
  const handleStandardLogin = (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      // Clean phone input
      const cleanPhone = loginPhone.replace(/\D/g, '');
      
      if (!cleanPhone || !loginPassword) {
          setError('يرجى إدخال رقم الهاتف وكلمة المرور');
          return;
      }

      const user = db.people.find(p => p.phone === cleanPhone && p.password === loginPassword);
      
      if (user) {
          completeLogin(user);
      } else {
          setError('بيانات الدخول غير صحيحة، تأكد من الرقم وكلمة المرور');
      }
  };

  // --- Standard Register Logic ---
  const handleStandardRegister = (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!regName || !regPhone || !regPassword) {
          setError('يرجى ملء جميع البيانات');
          return;
      }

      // Default registration is as a Student (can be changed by admin)
      const newPerson: Person = {
          id: '',
          name: regName,
          phone: regPhone,
          username: regPhone,
          password: regPassword,
          address: '',
          diocese: '',
          churchId: 'Krm1', // Default Church
          stage: db.stages[0] || 'حضانة',
          role: Role.Student,
          notes: 'تسجيل ذاتي جديد',
          needsVisitation: false,
          joinedAt: new Date().toISOString()
      };

      const result = addPerson(newPerson);
      if (result.success) {
          // Auto login after register
          const created = getDB().people.find(p => p.phone === result.generatedUsername);
          if (created) completeLogin(created);
      } else {
          setError(result.message || 'حدث خطأ أثناء التسجيل');
      }
  };

  // --- Visual for Dev Access ---
  if (isDevAccessing) {
      return (
          <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 font-['Tajawal'] text-white animate-in zoom-in duration-500">
              <div className="relative">
                  <div className="absolute inset-0 bg-purple-500 blur-xl opacity-50 rounded-full animate-pulse"></div>
                  <ShieldCheck size={80} className="relative z-10 text-emerald-400 mb-6" />
              </div>
              <h2 className="text-2xl font-bold mb-2">جاري تفعيل وضع المطور</h2>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Loader2 size={16} className="animate-spin" />
                  <span>يرجى الانتظار، يتم تحميل الصلاحيات...</span>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-['Tajawal']">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-purple-700 p-6 text-center relative shrink-0">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Grape size={100} className="text-white transform rotate-12" />
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-2 shadow-inner">
               <Grape className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold text-white">تطبيق كرمتي</h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 shrink-0 bg-slate-50">
        <button onClick={() => { setActiveTab('instant'); setError(null); }} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'instant' ? 'text-purple-700 border-b-2 border-purple-700 bg-white' : 'text-slate-500 hover:bg-slate-100'}`}>
            <Zap size={18} className={activeTab === 'instant' ? "fill-purple-700" : ""} /> تسجيل فوري
        </button>
        <button onClick={() => { setActiveTab('login'); setError(null); }} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'login' ? 'text-purple-700 border-b-2 border-purple-700 bg-white' : 'text-slate-500 hover:bg-slate-100'}`}>
            <LogIn size={18} /> دخول
        </button>
        <button onClick={() => { setActiveTab('register'); setError(null); }} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'register' ? 'text-purple-700 border-b-2 border-purple-700 bg-white' : 'text-slate-500 hover:bg-slate-100'}`}>
            <UserPlus size={18} /> حساب جديد
        </button>
        </div>

        <div className="p-6 overflow-y-auto relative min-h-[350px]">
        {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold mb-4 text-center border border-red-100 flex items-center justify-center gap-2 animate-in slide-in-from-top-2">
            <AlertTriangle size={16} />
            {error}
            </div>
        )}

        {/* INSTANT TAB */}
        {activeTab === 'instant' && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
                {/* Mode Switcher */}
                {!multiUserSelect && (
                    <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                        <button 
                            onClick={() => { setInstantMode('new'); setError(null); setPin(''); setVisitorName(''); }}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${instantMode === 'new' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500'}`}
                        >
                            حساب جديد
                        </button>
                        <button 
                            onClick={() => { setInstantMode('existing'); setError(null); setPin(''); }}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${instantMode === 'existing' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500'}`}
                        >
                            لدي حساب
                        </button>
                    </div>
                )}

                {/* --- REGISTER NEW (INSTANT) --- */}
                {instantMode === 'new' && !multiUserSelect && (
                    <form onSubmit={handleInstantRegister} className="space-y-6">
                        <div className="text-center mb-2">
                            <h3 className="text-slate-900 font-bold mb-1">تسجيل زائر جديد</h3>
                            <p className="text-xs text-slate-500 font-medium">سجل اسمك وأنشئ رقم سري للدخول</p>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 mr-2">الاسم</label>
                                <input type="text" className="w-full border-2 border-slate-200 rounded-2xl p-3 outline-none focus:border-purple-600 font-bold text-slate-800 placeholder:text-slate-400 transition-colors" placeholder="اكتب اسمك هنا" value={visitorName} onChange={(e) => setVisitorName(e.target.value)} autoFocus />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 mr-2">اختر رقم سري</label>
                                <input type="password" inputMode="numeric" pattern="[0-9]*" maxLength={8} className="w-full text-center text-3xl tracking-[0.2em] py-3 border-2 border-slate-200 rounded-2xl outline-none focus:border-purple-600 font-bold text-slate-800 placeholder:text-lg transition-colors" placeholder="****" value={pin} onChange={(e) => { setPin(e.target.value); setError(null); }} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 mr-2">تأكيد الرقم السري</label>
                                <input type="password" inputMode="numeric" pattern="[0-9]*" maxLength={8} className="w-full text-center text-3xl tracking-[0.2em] py-3 border-2 border-slate-200 rounded-2xl outline-none focus:border-purple-600 font-bold text-slate-800 placeholder:text-lg transition-colors" placeholder="****" value={confirmPin} onChange={(e) => setConfirmPin(e.target.value)} />
                            </div>
                        </div>
                        <button className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-4 rounded-2xl shadow-lg shadow-purple-200 mt-2 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]">
                            <Zap size={20} className="fill-white" /> بدء الاستخدام
                        </button>
                    </form>
                )}

                {/* --- LOGIN EXISTING (INSTANT) --- */}
                {instantMode === 'existing' && !multiUserSelect && (
                    <form onSubmit={handleInstantLogin} className="space-y-6">
                        <div className="text-center mb-6">
                            <h3 className="text-slate-900 font-bold mb-1">أهلاً بعودتك</h3>
                            <p className="text-xs text-slate-500 font-medium">أدخل رقمك السري للدخول</p>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 mr-2">الرقم السري</label>
                                <input type="password" inputMode="numeric" className="w-full text-center text-4xl tracking-[0.2em] py-4 border-2 border-slate-200 rounded-2xl outline-none focus:border-purple-600 font-bold text-slate-800 placeholder:text-xl placeholder:tracking-normal transition-colors" placeholder="••••" value={pin} onChange={(e) => { setPin(e.target.value); setError(null); }} autoFocus />
                            </div>
                        </div>
                        <button className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg mt-4 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]">
                            <LogIn size={20} /> دخول
                        </button>
                    </form>
                )}

                {/* --- COLLISION RESOLVER --- */}
                {multiUserSelect && (
                    <div className="animate-in fade-in slide-in-from-right-4">
                        <div className="text-center mb-6">
                            <h3 className="text-slate-900 font-bold mb-1">اختر حسابك</h3>
                            <p className="text-xs text-slate-500 font-medium">يوجد أكثر من حساب بهذا الرقم السري</p>
                        </div>
                        <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                            {multiUserSelect.map(user => (
                                <button
                                    key={user.id}
                                    onClick={() => completeLogin(user)}
                                    className="w-full bg-white border-2 border-slate-100 hover:border-purple-500 hover:bg-purple-50 p-3 rounded-xl flex items-center gap-3 transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-purple-200 flex items-center justify-center text-slate-600 group-hover:text-purple-700 font-bold">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div className="text-right flex-1">
                                        <h4 className="font-bold text-slate-800 text-sm group-hover:text-purple-900">{user.name}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold">{new Date(user.joinedAt).toLocaleDateString('ar-EG')}</p>
                                    </div>
                                    <CheckCircle size={18} className="text-slate-300 group-hover:text-purple-600" />
                                </button>
                            ))}
                        </div>
                        <button 
                            onClick={() => { setMultiUserSelect(null); setPin(''); }}
                            className="w-full mt-4 py-3 text-slate-500 font-bold text-sm hover:text-slate-700 flex items-center justify-center gap-1"
                        >
                            <ArrowLeft size={16} /> إلغاء وعودة
                        </button>
                    </div>
                )}
            </div>
        )}

        {/* LOGIN TAB (STANDARD) */}
        {activeTab === 'login' && (
            <form onSubmit={handleStandardLogin} className="space-y-6 animate-in fade-in">
                <div className="text-center mb-6">
                    <h3 className="text-slate-900 font-bold mb-1">تسجيل الدخول</h3>
                    <p className="text-xs text-slate-500 font-medium">أدخل رقم الهاتف وكلمة المرور</p>
                </div>
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 mr-2">رقم الهاتف</label>
                        <div className="relative">
                            <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input type="tel" className="w-full border-2 border-slate-200 rounded-2xl p-3 pr-10 font-bold text-slate-900 outline-none focus:border-purple-600 dir-ltr text-right font-mono" placeholder="01xxxxxxxxx" value={loginPhone} onChange={e => setLoginPhone(e.target.value)} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 mr-2">كلمة المرور</label>
                        <div className="relative">
                            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input type="password" className="w-full border-2 border-slate-200 rounded-2xl p-3 pr-10 font-bold text-slate-900 outline-none focus:border-purple-600" placeholder="••••••" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
                        </div>
                    </div>
                </div>
                <button type="submit" className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-4 rounded-2xl shadow-lg mt-4 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]">
                    <LogIn size={20} /> دخول
                </button>
            </form>
        )}

        {/* REGISTER TAB (STANDARD) */}
        {activeTab === 'register' && (
            <form onSubmit={handleStandardRegister} className="space-y-5 animate-in fade-in">
                 <div className="text-center mb-4">
                    <h3 className="text-slate-900 font-bold mb-1">إنشاء حساب جديد</h3>
                    <p className="text-xs text-slate-500 font-medium">سجل بياناتك للانضمام للخدمة</p>
                </div>
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 mr-2">الاسم ثلاثي</label>
                        <div className="relative">
                            <User className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input type="text" className="w-full border-2 border-slate-200 rounded-2xl p-3 pr-10 font-bold text-slate-900 outline-none focus:border-purple-600" placeholder="اكتب اسمك" value={regName} onChange={e => setRegName(e.target.value)} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 mr-2">رقم الهاتف</label>
                        <div className="relative">
                            <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input type="tel" className="w-full border-2 border-slate-200 rounded-2xl p-3 pr-10 font-bold text-slate-900 outline-none focus:border-purple-600 dir-ltr text-right font-mono" placeholder="01xxxxxxxxx" value={regPhone} onChange={e => setRegPhone(e.target.value)} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 mr-2">كلمة المرور</label>
                        <div className="relative">
                            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input type="password" className="w-full border-2 border-slate-200 rounded-2xl p-3 pr-10 font-bold text-slate-900 outline-none focus:border-purple-600" placeholder="••••••" value={regPassword} onChange={e => setRegPassword(e.target.value)} />
                        </div>
                    </div>
                </div>
                <button type="submit" className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-4 rounded-2xl shadow-lg mt-2 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]">
                    <UserPlus size={20} /> إنشاء حساب
                </button>
            </form>
        )}

        </div>
      </div>
      <div className="fixed bottom-4 left-0 right-0 text-center text-slate-300 font-sans px-4">
        <p className="text-[10px] opacity-70">Karmaty v1.7.5</p>
        <div className="flex items-center justify-center gap-1.5 mt-0.5 text-[10px] font-bold text-purple-200/50">
           <Code size={10} />
           <span>تطوير: م/ روماني - اذكروني في صلواتكم</span>
        </div>
      </div>
    </div>
  );
};
