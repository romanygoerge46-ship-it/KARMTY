
import React, { useState } from 'react';
import { Lock, User, Phone, Church, PlusCircle, ArrowRight, ShieldAlert, CheckCircle, HelpCircle, RefreshCcw } from 'lucide-react';
import { Person, Role } from '../types';
import { getDB, addPerson, updatePerson } from '../services/db';

interface LoginProps {
  onLogin: (user: Person) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Forgot Password State
  const [resetData, setResetData] = useState({
    phone: '',
    name: '',
    diocese: '',
    newPassword: ''
  });

  // Registration State
  const [regData, setRegData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    diocese: '',
    role: Role.Student, 
  });

  // --- LOGIN ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const db = getDB();
    
    // Developer Backdoor
    if (phone === 'R' && password === '0000') {
       const dev = db.people.find(p => p.role === Role.Developer);
       if (dev) { onLogin(dev); return; }
    }

    const safePhone = phone.trim();
    
    // Login with Phone directly
    const user = db.people.find(p => 
      p.phone === safePhone && p.password === password
    );

    if (user) {
      onLogin(user);
    } else {
      setError('رقم الهاتف أو كلمة المرور غير صحيحة.');
    }
  };

  // --- REGISTER ---
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Validations
    if (regData.password !== regData.confirmPassword) {
      setError('كلمة المرور غير متطابقة.');
      return;
    }
    if (regData.password.length < 3) {
      setError('كلمة المرور ضعيفة جداً.');
      return;
    }
    if (!regData.diocese) {
        setError('يرجى إدخال اسم الإيبارشية.');
        return;
    }
    if (!regData.name.trim()) {
        setError('يرجى إدخال الاسم.');
        return;
    }

    const db = getDB();
    const defaultStage = regData.role === Role.Student 
        ? (db.stages.filter(s => s !== "الخدام والكاهن")[0] || "عام") // First available stage
        : "الخدام والكاهن";

    const newPerson: Person = {
      id: '', 
      name: regData.name.trim(),
      phone: regData.phone.trim(),
      username: regData.phone.trim(), // Username is Phone
      password: regData.password,
      address: '', 
      diocese: regData.diocese,
      stage: defaultStage, 
      role: regData.role,
      notes: 'تم التسجيل ذاتياً',
      needsVisitation: false,
      joinedAt: new Date().toISOString()
    };

    const result = addPerson(newPerson);
    
    if (result.success) {
      // Auto login or show success
      setSuccessMsg('تم إنشاء الحساب بنجاح. يمكنك الدخول الآن برقم الهاتف.');
      setIsRegister(false);
      setPhone(regData.phone);
      setPassword('');
    } else {
      setError(result.message || 'فشل إنشاء الحساب.');
    }
  };

  // --- FORGOT PASSWORD ---
  const handleResetPassword = (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setSuccessMsg(null);
      
      const db = getDB();
      // Security Check: Phone + Name + Diocese must match
      const user = db.people.find(p => 
         p.phone === resetData.phone.trim() && 
         p.name.trim() === resetData.name.trim() &&
         p.diocese?.trim() === resetData.diocese.trim()
      );

      if (user) {
         if (resetData.newPassword.length < 3) {
             setError('كلمة المرور الجديدة ضعيفة.');
             return;
         }
         
         // Update the user password securely
         const updatedUser = { ...user, password: resetData.newPassword.trim() };
         updatePerson(updatedUser);
         
         setSuccessMsg('تم تغيير كلمة المرور بنجاح. سجل دخولك الآن.');
         setTimeout(() => {
             setIsForgotPassword(false);
             setPhone(resetData.phone);
             setPassword('');
         }, 1500);
         
      } else {
         setError('بيانات التحقق غير صحيحة. تأكد من الاسم ورقم الهاتف والإيبارشية كما تم تسجيلهم.');
      }
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-['Tajawal']">
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl w-full max-w-md text-center border border-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Header Icon */}
        <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner transition-transform duration-500 hover:rotate-12">
          {isForgotPassword ? <RefreshCcw size={36}/> : isRegister ? <PlusCircle size={36} /> : <Lock size={36} />}
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {isForgotPassword ? 'استعادة الحساب' : isRegister ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
        </h1>
        <p className="text-slate-600 mb-6 text-sm leading-relaxed font-semibold">
          {isForgotPassword ? 'أدخل بياناتك للتحقق من هويتك' : isRegister ? 'سجل بياناتك للدخول برقم الهاتف' : 'أهلاً بك مجدداً في تطبيق كرمتي'}
        </p>
        
        {/* Toggle Tabs (Only show when not in Forgot Password mode) */}
        {!isForgotPassword && (
            <div className="flex bg-slate-200 p-1 rounded-xl mb-6">
            <button 
                onClick={() => { setIsRegister(false); setError(null); setSuccessMsg(null); }}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isRegister ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
            >
                دخول
            </button>
            <button 
                onClick={() => { setIsRegister(true); setError(null); setSuccessMsg(null); }}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isRegister ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
            >
                حساب جديد
            </button>
            </div>
        )}

        {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-600 text-xs font-bold mb-4 text-right">
                <ShieldAlert size={16} className="flex-shrink-0" />
                <span>{error}</span>
            </div>
        )}

        {successMsg && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2 text-green-700 text-xs font-bold mb-4 text-right">
                <CheckCircle size={16} className="flex-shrink-0" />
                <span>{successMsg}</span>
            </div>
        )}

        {/* --- FORGOT PASSWORD FORM --- */}
        {isForgotPassword ? (
            <form onSubmit={handleResetPassword} className="space-y-3 animate-in fade-in duration-300 text-right">
                <div className="relative group">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input required type="tel" placeholder="رقم الهاتف" className="w-full pr-10 pl-3 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-purple-600 text-sm bg-slate-50 font-bold text-slate-900" 
                        value={resetData.phone} onChange={e => setResetData({...resetData, phone: e.target.value})} />
                </div>
                <div className="relative group">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input required type="text" placeholder="الاسم ثلاثي (كما سجلته)" className="w-full pr-10 pl-3 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-purple-600 text-sm bg-slate-50 font-bold text-slate-900" 
                        value={resetData.name} onChange={e => setResetData({...resetData, name: e.target.value})} />
                </div>
                <div className="relative group">
                    <Church className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input required type="text" placeholder="الإيبارشية (كما سجلتها)" className="w-full pr-10 pl-3 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-purple-600 text-sm bg-slate-50 font-bold text-slate-900" 
                        value={resetData.diocese} onChange={e => setResetData({...resetData, diocese: e.target.value})} />
                </div>
                 <div className="relative group">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input required type="password" placeholder="كلمة المرور الجديدة" className="w-full pr-10 pl-3 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-purple-600 text-sm bg-slate-50 font-bold text-slate-900" 
                        value={resetData.newPassword} onChange={e => setResetData({...resetData, newPassword: e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg mt-4">إعادة تعيين</button>
                <button type="button" onClick={() => setIsForgotPassword(false)} className="w-full text-slate-500 text-xs font-bold mt-2 hover:text-purple-700">العودة لتسجيل الدخول</button>
            </form>
        ) : (
            <>
                {/* --- LOGIN FORM --- */}
                {!isRegister && (
                <form onSubmit={handleLogin} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="relative group">
                    <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-600 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="رقم الهاتف"
                        className="w-full pr-12 pl-4 py-3.5 border-2 border-slate-200 rounded-2xl outline-none focus:border-purple-600 transition-all bg-slate-50 focus:bg-white font-bold text-slate-900 placeholder:text-slate-500 dir-ltr text-right font-mono"
                        value={phone}
                        onChange={(e) => { setError(null); setPhone(e.target.value); }}
                    />
                    </div>
                    
                    <div className="relative group">
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-600 transition-colors" size={20} />
                    <input
                        type="password"
                        placeholder="كلمة المرور"
                        className="w-full pr-12 pl-4 py-3.5 border-2 border-slate-200 rounded-2xl outline-none focus:border-purple-600 transition-all bg-slate-50 focus:bg-white font-bold text-slate-900 placeholder:text-slate-500"
                        value={password}
                        onChange={(e) => { setError(null); setPassword(e.target.value); }}
                    />
                    </div>
                    
                    <button 
                    type="submit"
                    className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-purple-200 active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                    <span>دخول</span>
                    <ArrowRight size={18} />
                    </button>

                    <button 
                        type="button" 
                        onClick={() => setIsForgotPassword(true)}
                        className="text-xs text-slate-500 hover:text-purple-700 font-bold flex items-center justify-center gap-1 mx-auto mt-4"
                    >
                        <HelpCircle size={14} />
                        نسيت كلمة المرور؟
                    </button>

                    <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-500">
                        <p className="mb-2 font-bold text-slate-800">حسابات للتجربة:</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            <span className="bg-slate-100 px-2 py-1 rounded text-black font-semibold border border-slate-200">R / 0000 (مطور)</span>
                        </div>
                    </div>
                </form>
                )}

                {/* --- REGISTER FORM --- */}
                {isRegister && (
                <form onSubmit={handleRegister} className="space-y-3 animate-in fade-in slide-in-from-left-4 duration-300 text-right">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-700 mr-1">صفتك</label>
                        <select 
                            className="w-full border-2 border-slate-200 rounded-xl p-2.5 bg-slate-50 text-sm outline-none focus:border-purple-600 font-bold text-slate-900"
                            value={regData.role}
                            onChange={e => setRegData({...regData, role: e.target.value as Role})}
                        >
                            <option value={Role.Student}>مخدوم</option>
                            <option value={Role.Servant}>خادم</option>
                            <option value={Role.Priest}>كاهن</option>
                        </select>
                        </div>
                        <div className="space-y-1 relative group">
                            <label className="text-[10px] font-bold text-slate-700 mr-1">الإيبارشية</label>
                            <input
                            required
                            type="text"
                            placeholder="اسم الإيبارشية"
                            className="w-full border-2 border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:border-purple-600 font-bold text-slate-900 placeholder:text-slate-500"
                            value={regData.diocese}
                            onChange={e => setRegData({...regData, diocese: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="relative group">
                        <User className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                        required
                        type="text"
                        placeholder="الاسم ثلاثي (عربي)"
                        className="w-full pr-10 pl-3 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-purple-600 text-sm bg-slate-50 focus:bg-white font-bold text-slate-900 placeholder:text-slate-500"
                        value={regData.name}
                        onChange={e => setRegData({...regData, name: e.target.value})}
                        />
                    </div>

                    <div className="relative group">
                        <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                        required
                        type="tel"
                        placeholder="رقم الهاتف (اسم المستخدم)"
                        className="w-full pr-10 pl-3 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-purple-600 text-sm bg-slate-50 focus:bg-white dir-ltr text-right font-mono font-bold text-slate-900 placeholder:text-slate-500"
                        value={regData.phone}
                        onChange={e => setRegData({...regData, phone: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <input
                        required
                        type="password"
                        placeholder="كلمة المرور"
                        className="w-full px-3 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-purple-600 text-sm bg-slate-50 focus:bg-white font-bold text-slate-900 placeholder:text-slate-500"
                        value={regData.password}
                        onChange={e => setRegData({...regData, password: e.target.value})}
                        />
                        <input
                        required
                        type="password"
                        placeholder="تأكيد المرور"
                        className="w-full px-3 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-purple-600 text-sm bg-slate-50 focus:bg-white font-bold text-slate-900 placeholder:text-slate-500"
                        value={regData.confirmPassword}
                        onChange={e => setRegData({...regData, confirmPassword: e.target.value})}
                        />
                    </div>

                    <button 
                    type="submit"
                    className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-purple-200 active:scale-[0.98] mt-4"
                    >
                    إنشاء الحساب
                    </button>
                </form>
                )}
            </>
        )}
      </div>
    </div>
  );
};
