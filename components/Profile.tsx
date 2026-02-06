
import React, { useState } from 'react';
import { Person, Role } from '../types';
import { updatePerson } from '../services/db';
import { User, Phone, MapPin, Lock, Shield, Calendar, Globe, Church, Save } from 'lucide-react';

interface ProfileProps {
  user: Person;
  onUpdate: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState<Partial<Person>>({
    name: user.name,
    phone: user.phone,
    address: user.address,
    password: user.password,
    governorate: user.governorate,
    diocese: user.diocese
  });

  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser = { ...user, ...formData } as Person;
    updatePerson(updatedUser);
    setMessage('تم حفظ التعديلات بنجاح');
    onUpdate();
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
       <h2 className="text-2xl font-bold text-slate-900 mb-4">حسابي</h2>
       
       <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-purple-700 h-24 relative">
             <div className="absolute -bottom-10 right-8">
                 <div className="w-24 h-24 bg-white rounded-full p-1.5 shadow-lg">
                    <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-4xl font-bold text-purple-700">
                        {user.name.charAt(0)}
                    </div>
                 </div>
             </div>
          </div>
          
          <div className="pt-12 px-8 pb-8">
             <div className="flex justify-between items-start mb-6">
                <div>
                   <h3 className="text-xl font-bold text-slate-900">{user.name}</h3>
                   <div className="flex gap-2 mt-2">
                      <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-bold border border-purple-100">{user.role}</span>
                      <span className="bg-slate-50 text-slate-600 px-3 py-1 rounded-full text-xs font-bold border border-slate-100 font-mono">{user.username}</span>
                   </div>
                </div>
                <div className="text-xs text-slate-400 font-bold flex flex-col items-end gap-1">
                   <div className="flex items-center gap-1"><Calendar size={12}/> انضم في</div>
                   <span className="dir-ltr font-mono">{new Date(user.joinedAt).toLocaleDateString('en-GB')}</span>
                </div>
             </div>

             <form onSubmit={handleSubmit} className="space-y-4">
                {message && (
                  <div className="bg-green-50 text-green-700 p-3 rounded-xl text-center font-bold text-sm border border-green-200 animate-in fade-in">
                    {message}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 mr-2">الاسم</label>
                      <div className="relative">
                         <User className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                         <input 
                           type="text" 
                           className="w-full border-2 border-slate-100 rounded-xl p-3 pr-10 text-sm font-bold text-slate-800 outline-none focus:border-purple-500"
                           value={formData.name}
                           onChange={e => setFormData({...formData, name: e.target.value})}
                         />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 mr-2">رقم الهاتف</label>
                      <div className="relative">
                         <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                         <input 
                           type="tel" 
                           className="w-full border-2 border-slate-100 rounded-xl p-3 pr-10 text-sm font-bold text-slate-800 outline-none focus:border-purple-500 dir-ltr text-right font-mono"
                           value={formData.phone}
                           onChange={e => setFormData({...formData, phone: e.target.value})}
                         />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 mr-2">كلمة المرور</label>
                      <div className="relative">
                         <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                         <input 
                           type="text" 
                           className="w-full border-2 border-slate-100 rounded-xl p-3 pr-10 text-sm font-bold text-slate-800 outline-none focus:border-purple-500"
                           value={formData.password}
                           onChange={e => setFormData({...formData, password: e.target.value})}
                         />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 mr-2">العنوان</label>
                      <div className="relative">
                         <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                         <input 
                           type="text" 
                           className="w-full border-2 border-slate-100 rounded-xl p-3 pr-10 text-sm font-bold text-slate-800 outline-none focus:border-purple-500"
                           value={formData.address}
                           onChange={e => setFormData({...formData, address: e.target.value})}
                         />
                      </div>
                   </div>

                   {/* Disabled fields for context */}
                   <div className="space-y-2 opacity-70">
                      <label className="text-xs font-bold text-slate-500 mr-2">المحافظة</label>
                      <div className="relative">
                         <Globe className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                         <input disabled className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pr-10 text-sm font-bold text-slate-600" value={formData.governorate || ''} />
                      </div>
                   </div>
                   <div className="space-y-2 opacity-70">
                      <label className="text-xs font-bold text-slate-500 mr-2">الإيبارشية</label>
                      <div className="relative">
                         <Church className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                         <input disabled className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pr-10 text-sm font-bold text-slate-600" value={formData.diocese || ''} />
                      </div>
                   </div>

                </div>

                <div className="pt-4 mt-6 border-t border-slate-100">
                  <button type="submit" className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-100 flex items-center justify-center gap-2">
                    <Save size={18} />
                    حفظ التغييرات
                  </button>
                </div>
             </form>
          </div>
       </div>
    </div>
  );
};
