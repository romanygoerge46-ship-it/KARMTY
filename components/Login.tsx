
import React, { useState } from 'react';
import { Lock, User, Phone, Church, PlusCircle, ArrowRight, ShieldAlert, CheckCircle, Copy } from 'lucide-react';
import { Person, Role, Stage } from '../types';
import { getDB, addPerson } from '../services/db';
import { GOVERNORATES } from '../constants';

interface LoginProps {
  onLogin: (user: Person) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successUser, setSuccessUser] = useState<{username: string, name: string} | null>(null);

  // Registration State
  const [regData, setRegData] = useState({
    name: '',
    phone: '',
    // username removed - generated automatically
    password: '',
    confirmPassword: '',
    governorate: 'القاهرة',
    diocese: '',
    role: Role.Student, 
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const db = getDB();
    
    const user = db.people.find(p => 
      (p.username.toLowerCase() === identifier.toLowerCase() || p.phone === identifier) && 
      p.password === password
    );

    if (user) {
      onLogin(user);
    } else {
      setError('بيانات الدخول غير صحيحة، يرجى التأكد من البيانات.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
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
    // Simple Arabic check for name to ensure transliteration works well (optional but good practice)
    if (!/^[\u0600-\u06FF\s]+$/.test(regData.name)) {
       // Just a warning, we won't block it, but better for auto-generation
    }

    // Prepare Object (username is undefined here)
    const newPerson: Person = {
      id: '', 
      name: regData.name,
      // username will be generated in addPerson
      password: regData.password,
      phone: regData.phone,
      address: '', 
      governorate: regData.governorate,
      diocese: regData.diocese,
      stage: regData.role === Role.Student ? Stage.UniGrad : Stage.Servants, 
      role: regData.role,
      notes: 'تم التسجيل ذاتياً',
      needsVisitation: false,
      joinedAt: new Date().toISOString()
    };

    const result = addPerson(newPerson);
    
    if (result.success && result.generatedUsername) {
      setSuccessUser({
        username: result.generatedUsername,
        name: regData.name
      });
    } else {
      setError(result.message || 'فشل إنشاء الحساب.');
    }
  };

  if (successUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-['Tajawal']">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md text-center border border-green-100 animate-in zoom-in duration-300">
           <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
             <CheckCircle size={40} />
           </div>
           <h2 className="text-2xl font-bold text-slate-900 mb-2">تم إنشاء الحساب بنجاح!</h2>
           <p className="text-slate-600 mb-6 font-semibold">مرحباً بك يا {successUser.name}</p>
           
           <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 mb-6">
              <p className="text-xs text-slate-500 font-bold mb-2">اسم المستخدم الخاص بك للدخول (هام جداً)</p>
              <div className="flex items-center justify-center gap-2" onClick={() => navigator.clipboard.writeText(successUser.username)}>
                <span className="text-2xl font-mono font-bold text-purple-700 tracking-wider select-all">{successUser.username}</span>
                <Copy size={16} className="text-slate-400 cursor-pointer hover:text-purple-600" />
              </div>
           </div>

           <button 
             onClick={() => {
                setSuccessUser(null);
                setIsRegister(false);
                setIdentifier(successUser.username);
             }}
             className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-purple-200"
           >
             تسجيل الدخول الآن
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-['Tajawal']">
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl w-full max-w-md text-center border border-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Header Icon */}
        <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner transition-transform duration-500 hover:rotate-12">
          {isRegister ? <PlusCircle size={36} /> : <Lock size={36} />}
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {isRegister ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
        </h1>
        <p className="text-slate-600 mb-6 text-sm leading-relaxed font-semibold">
          {isRegister ? 'سجل بياناتك وسيتم إنشاء اسم مستخدم لك تلقائياً' : 'أهلاً بك مجدداً في تطبيق كرمتي'}
        </p>
        
        {/* Toggle Tabs */}
        <div className="flex bg-slate-200 p-1 rounded-xl mb-6">
          <button 
            onClick={() => { setIsRegister(false); setError(null); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isRegister ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
          >
            دخول
          </button>
          <button 
             onClick={() => { setIsRegister(true); setError(null); }}
             className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isRegister ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
          >
            حساب جديد
          </button>
        </div>

        {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-600 text-xs font-bold mb-4 text-right">
                <ShieldAlert size={16} className="flex-shrink-0" />
                <span>{error}</span>
            </div>
        )}

        {/* FORMS */}
        {!isRegister ? (
          // LOGIN FORM
          <form onSubmit={handleLogin} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="relative group">
               <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-600 transition-colors" size={20} />
               <input
                type="text"
                placeholder="اسم المستخدم أو رقم الهاتف"
                className="w-full pr-12 pl-4 py-3.5 border-2 border-slate-200 rounded-2xl outline-none focus:border-purple-600 transition-all bg-slate-50 focus:bg-white font-bold text-slate-900 placeholder:text-slate-500"
                value={identifier}
                onChange={(e) => { setError(null); setIdentifier(e.target.value); }}
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
              <span>دخول آمن</span>
              <ArrowRight size={18} />
            </button>

            <div className="mt-6 pt-4 border-t border-slate-200 text-xs text-slate-500">
               <p className="mb-2 font-bold text-slate-800">حسابات للتجربة:</p>
               <div className="flex flex-wrap gap-2 justify-center">
                 <span className="bg-slate-100 px-2 py-1 rounded text-black font-semibold border border-slate-200">R / 0000 (مطور)</span>
               </div>
            </div>
          </form>
        ) : (
          // REGISTER FORM
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

                 <div className="space-y-1">
                   <label className="text-[10px] font-bold text-slate-700 mr-1">المحافظة</label>
                   <select 
                     className="w-full border-2 border-slate-200 rounded-xl p-2.5 bg-slate-50 text-sm outline-none focus:border-purple-600 font-bold text-slate-900"
                     value={regData.governorate}
                     onChange={e => setRegData({...regData, governorate: e.target.value})}
                   >
                      {GOVERNORATES.map(g => <option key={g} value={g}>{g}</option>)}
                   </select>
                 </div>
             </div>

             <div className="relative group">
                <Church className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  required
                  type="text"
                  placeholder="اسم الإيبارشية"
                  className="w-full pr-10 pl-3 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-purple-600 text-sm bg-slate-50 focus:bg-white font-bold text-slate-900 placeholder:text-slate-500"
                  value={regData.diocese}
                  onChange={e => setRegData({...regData, diocese: e.target.value})}
                />
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
                <p className="text-[10px] text-slate-400 mt-1 mr-1">سيتم توليد اسم المستخدم تلقائياً من الاسم</p>
             </div>

             <div className="relative group">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  required
                  type="tel"
                  placeholder="رقم الهاتف (يجب أن يكون فريداً)"
                  className="w-full pr-10 pl-3 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-purple-600 text-sm bg-slate-50 focus:bg-white dir-ltr text-right font-mono font-bold text-slate-900 placeholder:text-slate-500"
                  value={regData.phone}
                  onChange={e => setRegData({...regData, phone: e.target.value})}
                />
             </div>

             {/* Username Field Removed */}

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
              إنشاء الحساب وتوليد اسم المستخدم
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
