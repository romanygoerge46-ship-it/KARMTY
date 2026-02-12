
import React, { useState } from 'react';
import { Person, Stage, Role } from '../types';
import { updatePerson, deletePerson, getDB } from '../services/db';
import { Search, Database, Edit2, Trash2, X, Save, User, Phone, Lock, MapPin, Church, ShieldAlert, Info, Ban, Building2 } from 'lucide-react';

interface DeveloperDatabaseProps {
  people: Person[];
  onDataChange: () => void;
  currentUser: Person;
}

export const DeveloperDatabase: React.FC<DeveloperDatabaseProps> = ({ people, onDataChange, currentUser }) => {
  const [filter, setFilter] = useState('');
  
  // Edit State
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [formData, setFormData] = useState<Partial<Person>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const db = getDB();
  const availableStages = db.stages;

  const filtered = people.filter(p => 
    p.name.includes(filter) || 
    p.phone.includes(filter) || 
    p.username?.includes(filter) ||
    p.diocese?.includes(filter) ||
    p.churchId?.includes(filter) // Search by Church Code
  );

  const handleDelete = (id: string) => {
      if (id === currentUser.id) {
          alert("عذراً، لا يمكنك حذف حسابك الشخصي وأنت تستخدم النظام.");
          return;
      }

      if (window.confirm('تنبيه: هل أنت متأكد من (إزالة) هذا المستخدم نهائياً؟')) {
          const success = deletePerson(id);
          if (success) {
              onDataChange();
          } else {
              alert('فشل الحذف. قد يكون السجل غير موجود.');
          }
      }
  };

  const handleEdit = (person: Person) => {
      setEditingPerson(person);
      setFormData({ ...person });
      setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingPerson && formData.name && formData.phone) {
          const updated = { ...editingPerson, ...formData, username: formData.phone } as Person;
          const success = updatePerson(updated);
          if (success) {
              onDataChange();
              setIsModalOpen(false);
          } else {
              alert('فشل التعديل.');
          }
      }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
         <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
           <Database className="text-purple-700" />
           قاعدة البيانات المركزية
         </h2>
         <span className="bg-slate-800 text-white px-3 py-1 rounded-lg text-xs font-bold">
           {filtered.length} سجل
         </span>
      </div>

      {/* Explanatory Box */}
      <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded-l-lg shadow-sm">
        <div className="flex items-start gap-3">
            <Info className="text-blue-600 flex-shrink-0 mt-1" size={24} />
            <div>
                <h4 className="font-bold text-blue-900 text-sm mb-1">شرح الصلاحيات وإدارة البيانات</h4>
                <p className="text-xs text-blue-800 leading-relaxed font-semibold">
                    هذه هي القاعدة الرئيسية. <strong>المطور وحده</strong> يملك كافة الصلاحيات هنا. 
                    البيانات المسجلة تظل محفوظة ولا يتم حذفها أبداً إلا إذا قمت بالضغط على زر <strong>"إزالة"</strong>.
                    يمكنك استخدام زر <strong>"تعديل"</strong> لتغيير (الصلاحية) الخاصة بأي مستخدم (من مخدوم إلى خادم أو العكس).
                </p>
            </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
         <div className="relative">
           <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
           <input 
             type="text"
             placeholder="بحث شامل (الاسم، الهاتف، الصلاحية، كود الكنيسة)..."
             className="w-full border-2 border-slate-100 rounded-lg py-2 pr-10 pl-4 focus:border-purple-600 outline-none text-slate-800 font-bold"
             value={filter}
             onChange={e => setFilter(e.target.value)}
           />
         </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
         <table className="w-full text-sm text-right">
           <thead className="bg-slate-900 text-white">
             <tr>
               <th className="p-3 font-bold whitespace-nowrap">الاسم</th>
               <th className="p-3 font-bold whitespace-nowrap">الصلاحية</th>
               <th className="p-3 font-bold whitespace-nowrap">كود الكنيسة</th>
               <th className="p-3 font-bold whitespace-nowrap">المرحلة</th>
               <th className="p-3 font-bold whitespace-nowrap">الهاتف (المستخدم)</th>
               <th className="p-3 font-bold whitespace-nowrap">كلمة المرور</th>
               <th className="p-3 font-bold whitespace-nowrap">إضافة / إزالة</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
             {filtered.map((person) => {
               const isSelf = person.id === currentUser.id;
               return (
                <tr key={person.id} className={`transition-colors ${isSelf ? 'bg-purple-50' : 'hover:bg-slate-50'}`}>
                  <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                    {person.name}
                    {isSelf && <span className="bg-purple-200 text-purple-800 text-[9px] px-1.5 py-0.5 rounded-full">أنت</span>}
                  </td>
                  <td className="p-3">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold border ${
                        person.role === 'مطور النظام' ? 'bg-black text-white border-black' :
                        person.role === 'كاهن' ? 'bg-slate-700 text-white border-slate-700' :
                        person.role === 'خادم' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-purple-100 text-purple-700 border-purple-200'
                      }`}>
                        {person.role}
                      </span>
                  </td>
                  <td className="p-3 text-slate-600 font-bold font-mono">{person.churchId}</td>
                  <td className="p-3 text-slate-600 font-medium">{person.stage}</td>
                  <td className="p-3 font-mono dir-ltr text-right font-bold text-slate-800">{person.phone}</td>
                  <td className="p-3 font-mono text-slate-400">{person.password}</td>
                  <td className="p-3 flex gap-2">
                      <button 
                          onClick={() => handleEdit(person)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-bold text-xs border border-blue-100"
                          title="تعديل البيانات والصلاحية"
                      >
                          <Edit2 size={12} />
                          تعديل / إضافة
                      </button>
                      <button 
                          onClick={() => handleDelete(person.id)}
                          disabled={isSelf}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors font-bold text-xs border ${
                            isSelf 
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50' 
                            : 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100'
                          }`}
                          title={isSelf ? "لا يمكن حذف حسابك الحالي" : "إزالة المستخدم"}
                      >
                          {isSelf ? <Ban size={12} /> : <Trash2 size={12} />}
                          إزالة
                      </button>
                  </td>
                </tr>
               );
             })}
           </tbody>
         </table>
         {filtered.length === 0 && (
           <div className="p-8 text-center text-slate-500 font-bold">لا توجد نتائج مطابقة</div>
         )}
      </div>

      {/* Database Edit Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
             <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Edit2 className="text-purple-700" size={24} />
                        تعديل البيانات والصلاحية
                    </h3>
                    <button onClick={() => setIsModalOpen(false)} className="bg-slate-100 p-2 rounded-full hover:bg-slate-200">
                        <X size={20} className="text-slate-600" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-200 mb-4 flex gap-2">
                        <ShieldAlert size={20} className="text-yellow-600 flex-shrink-0" />
                        <p className="text-xs text-yellow-800 font-bold">تغيير "الصلاحية" هنا سيمنح أو يسحب حقوق الوصول من المستخدم فوراً.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">الاسم</label>
                        <div className="relative">
                            <User className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input required className="w-full border-2 border-slate-200 rounded-xl p-3 pr-10 font-bold text-slate-900 outline-none focus:border-purple-600" 
                                value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500">الصلاحية (الدور)</label>
                            <select className="w-full border-2 border-slate-200 rounded-xl p-3 font-bold text-slate-900 outline-none focus:border-purple-600 bg-white"
                                value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as Role})}>
                                <option value={Role.Student}>مخدوم</option>
                                <option value={Role.Servant}>خادم</option>
                                <option value={Role.Priest}>كاهن</option>
                                <option value={Role.Developer}>مطور النظام</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500">المرحلة</label>
                            <select className="w-full border-2 border-slate-200 rounded-xl p-3 font-bold text-slate-900 outline-none focus:border-purple-600 bg-white"
                                value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value})}>
                                {availableStages.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">كود الكنيسة / الخدمة</label>
                        <div className="relative">
                            <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input className="w-full border-2 border-slate-200 rounded-xl p-3 pr-10 font-bold text-slate-900 outline-none focus:border-purple-600" 
                                value={formData.churchId || ''} onChange={e => setFormData({...formData, churchId: e.target.value})} />
                        </div>
                        <p className="text-[10px] text-slate-400">تنبيه: تغيير هذا الكود سينقل المستخدم إلى مجموعة كنسية أخرى.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500">الهاتف (المستخدم)</label>
                            <div className="relative">
                                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input required className="w-full border-2 border-slate-200 rounded-xl p-3 pr-10 font-bold text-slate-900 outline-none focus:border-purple-600 font-mono text-right dir-ltr" 
                                    value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500">كلمة المرور</label>
                            <div className="relative">
                                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input required className="w-full border-2 border-slate-200 rounded-xl p-3 pr-10 font-bold text-slate-900 outline-none focus:border-purple-600" 
                                    value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">الإيبارشية</label>
                        <div className="relative">
                            <Church className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input className="w-full border-2 border-slate-200 rounded-xl p-3 pr-10 font-bold text-slate-900 outline-none focus:border-purple-600" 
                                value={formData.diocese || ''} onChange={e => setFormData({...formData, diocese: e.target.value})} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">العنوان</label>
                        <div className="relative">
                            <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input className="w-full border-2 border-slate-200 rounded-xl p-3 pr-10 font-bold text-slate-900 outline-none focus:border-purple-600" 
                                value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} />
                        </div>
                    </div>
                    
                    <button type="submit" className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-200 mt-4 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]">
                        <Save size={18} />
                        حفظ التعديلات في قاعدة البيانات
                    </button>
                </form>
             </div>
          </div>
      )}
    </div>
  );
};
