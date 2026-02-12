
import React, { useState } from 'react';
import { Lock, Phone, User, LogIn, UserPlus, Grape, Church, ChevronDown, Building2 } from 'lucide-react';
import { Person, Role } from '../types';
import { getDB, addPerson } from '../services/db';

interface LoginProps {
  onLogin: (user: Person) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<Role>(Role.Student);
  
  // Form State
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [diocese, setDiocese] = useState('');
  const [churchId, setChurchId] = useState(''); // Church Code
  const [selectedStage, setSelectedStage] = useState('');
  
  const [error, setError] = useState<string | null>(null);

  const db = getDB();
  // Filter stages for student registration
  const studentStages = db.stages.filter(s => s !== "الخدام والكاهن");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Developer Backdoor
    if (phone === 'R') {
       const dev = db.people.find(p => p.role === Role.Developer);
       if (dev && dev.password === password) { 
           onLogin(dev);
           return;
       } else if (dev) {
           onLogin(dev);
           return;
       }
    }

    if (!churchId) {
        setError('يرجى إدخال كود الكنيسة / الخدمة');
        return;
    }

    // Search for user matching Phone + Password + Church Code
    const user = db.people.find(p => 
        p.phone === phone && 
        p.password === password && 
        p.churchId === churchId.trim()
    );

    if (user) {
      onLogin(user);
    } else {
      setError('بيانات الدخول غير صحيحة. تأكد من رقم الهاتف، كلمة المرور، وكود الكنيسة.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic fields check
    if (!phone || !password || !name || !churchId) {
      setError('يرجى ملء كافة البيانات المطلوبة بما فيها كود الكنيسة');
      return;
    }

    // 1. Password Length Check
    if (password.length < 4) {
        setError('كلمة المرور يجب أن لا تقل عن 4 أرقام/أحرف');
        return;
    }

    // 2. Egyptian Phone Regex Check
    const egyptianPhoneRegex = /^01[0125][0-9]{8}$/;
    if (!egyptianPhoneRegex.test(phone)) {
        setError('رقم الهاتف غير صحيح. يجب أن يكون 11 رقم ويبدأ بـ 01');
        return;
    }

    // 3. Strict Church Code Validation
    const churchCodeRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9]{4}$/;
    if (!churchCodeRegex.test(churchId)) {
        setError('كود الكنيسة غير صحيح. يجب أن يتكون من 4 خانات ويحتوي على: حرف كبير، حرف صغير، ورقم.');
        return;
    }

    if (selectedRole === Role.Student && !selectedStage) {
        setError('يرجى اختيار المرحلة الدراسية');
        return;
    }

    // Determine Stage based on Role
    const finalStage = selectedRole === Role.Student ? selectedStage : "الخدام والكاهن";

    const newPerson: Person = {
      id: '', // Will be generated in addPerson
      name,
      username: phone,
      phone,
      password,
      address,
      diocese,
      churchId: churchId.trim(), // Save church ID
      stage: finalStage,
      role: selectedRole,
      notes: 'تم التسجيل من التطبيق',
      needsVisitation: false,
      joinedAt: new Date().toISOString()
    };

    const result = addPerson(newPerson);
    if (result.success) {
      onLogin({ ...newPerson, id: Date.now().toString() }); // Optimistic Login
    } else {
      setError(result.message || 'حدث خطأ أثناء التسجيل');
    }
  };

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

        {/* Role Selection Tabs */}
        <div className="flex bg-purple-800 p-1 shrink-0">
            {[Role.Student, Role.Servant, Role.Priest].map((role) => (
                <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`flex-1 py-2 text-xs font-bold transition-colors duration-200 ${
                        selectedRole === role 
                        ? 'bg-white text-purple-800 rounded-t-lg shadow-sm translate-y-1' 
                        : 'text-purple-200 hover:text-white'
                    }`}
                >
                    {role === Role.Student ? 'مخدوم' : role === Role.Servant ? 'خادم' : 'كاهن'}
                </button>
            ))}
        </div>

        {/* Auth Mode Tabs (Login vs Register) */}
        <div className="flex border-b border-slate-100 shrink-0">
          <button
            onClick={() => { setActiveTab('login'); setError(null); }}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'login' ? 'text-purple-700 border-b-2 border-purple-700 bg-purple-50' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <LogIn size={18} />
            تسجيل دخول
          </button>
          <button
            onClick={() => { setActiveTab('register'); setError(null); }}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'register' ? 'text-purple-700 border-b-2 border-purple-700 bg-purple-50' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <UserPlus size={18} />
            حساب جديد
          </button>
        </div>

        {/* Form Area */}
        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold mb-4 text-center border border-red-100">
              {error}
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 mr-2">كود الكنيسة / الخدمة</label>
                <div className="relative">
                  <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    required
                    className="w-full border-2 border-slate-200 rounded-xl p-3 pr-10 outline-none focus:border-purple-600 font-bold text-slate-800"
                    placeholder="رمز الكنيسة"
                    value={churchId}
                    onChange={(e) => setChurchId(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 mr-2">رقم الهاتف</label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text" 
                    className="w-full border-2 border-slate-200 rounded-xl p-3 pr-10 outline-none focus:border-purple-600 font-bold text-slate-800 dir-ltr text-right font-mono"
                    placeholder="01xxxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 mr-2">كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="password"
                    className="w-full border-2 border-slate-200 rounded-xl p-3 pr-10 outline-none focus:border-purple-600 font-bold text-slate-800"
                    placeholder="••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-200 transition-transform active:scale-[0.98] mt-4">
                دخول
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
               <div className="bg-purple-50 p-3 rounded-xl mb-4 border border-purple-100">
                   <p className="text-xs text-purple-800 font-bold text-center">
                       تسجيل حساب جديد كـ {selectedRole === Role.Student ? 'مخدوم' : selectedRole === Role.Servant ? 'خادم' : 'كاهن'}
                   </p>
               </div>

              {/* Church Code Field */}
              <div className="relative">
                <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  required
                  type="text"
                  maxLength={4}
                  className="w-full border-2 border-slate-200 rounded-xl p-3 pr-10 outline-none focus:border-purple-600 font-bold text-sm text-slate-800"
                  placeholder="كود الكنيسة (4 خانات: حرف كبير، صغير، رقم)"
                  value={churchId}
                  onChange={(e) => setChurchId(e.target.value)}
                />
              </div>

              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  required
                  type="text"
                  className="w-full border-2 border-slate-200 rounded-xl p-3 pr-10 outline-none focus:border-purple-600 font-bold text-sm text-slate-800"
                  placeholder="الاسم ثلاثي"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  required
                  type="tel"
                  className="w-full border-2 border-slate-200 rounded-xl p-3 pr-10 outline-none focus:border-purple-600 font-bold text-sm text-slate-800 dir-ltr text-right font-mono"
                  placeholder="رقم الهاتف (01xxxxxxxxx)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {selectedRole === Role.Student && (
                 <div className="relative">
                    <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    <select
                        required
                        className="w-full border-2 border-slate-200 rounded-xl p-3 outline-none focus:border-purple-600 font-bold text-sm text-slate-800 bg-white appearance-none"
                        value={selectedStage}
                        onChange={(e) => setSelectedStage(e.target.value)}
                    >
                        <option value="">اختر المرحلة الدراسية</option>
                        {studentStages.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                 </div>
              )}

              <div className="relative">
                 <Church className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                 <input
                   type="text"
                   className="w-full border-2 border-slate-200 rounded-xl p-3 pr-10 outline-none focus:border-purple-600 font-bold text-sm text-slate-800"
                   placeholder="الإيبارشية"
                   value={diocese}
                   onChange={(e) => setDiocese(e.target.value)}
                 />
              </div>

              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  required
                  type="password"
                  className="w-full border-2 border-slate-200 rounded-xl p-3 pr-10 outline-none focus:border-purple-600 font-bold text-sm text-slate-800"
                  placeholder="كلمة المرور (4 أرقام على الأقل)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-200 transition-transform active:scale-[0.98] mt-2">
                إنشاء حساب
              </button>
            </form>
          )}
        </div>
      </div>
      
      <div className="fixed bottom-4 text-[10px] text-slate-300 font-sans">
        Karmaty v1.1
      </div>
    </div>
  );
};
