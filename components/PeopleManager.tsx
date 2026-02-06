
import React, { useState } from 'react';
import { Person, Stage, Role } from '../types';
import { STAGE_OPTIONS, STAGE_PINS, GOVERNORATES } from '../constants';
import { Search, Trash2, Edit2, AlertCircle, Phone, MapPin, Lock, ArrowRight, Plus, UserPlus, ShieldAlert, Church, Globe } from 'lucide-react';
import { addPerson, deletePerson, updatePerson } from '../services/db';

interface PeopleManagerProps {
  people: Person[];
  onDataChange: () => void;
  currentUser: Person;
  showServantsOnly?: boolean;
}

export const PeopleManager: React.FC<PeopleManagerProps> = ({ people, onDataChange, currentUser, showServantsOnly = false }) => {
  const isDeveloper = currentUser.role === Role.Developer;
  // If Developer or showing servants, default to list view. Students view needs stage selection.
  const [view, setView] = useState<'stages' | 'list'>((showServantsOnly || isDeveloper) ? 'list' : 'stages');
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  
  // PIN Logic
  const [showPinModal, setShowPinModal] = useState(false);
  const [targetStage, setTargetStage] = useState<Stage | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Search/Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Add/Edit State
  const [isAdding, setIsAdding] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Person>>({
    name: '',
    username: '',
    password: '',
    phone: '',
    address: '',
    governorate: 'القاهرة',
    diocese: '',
    stage: Stage.Prim12,
    role: Role.Student,
    notes: '',
    needsVisitation: false
  });

  // --- PIN Handlers ---
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

  // --- Filtering ---
  const filteredPeople = people.filter(p => {
    // Developer sees everyone in the main list, unless specific filtering is added later
    if (isDeveloper && !showServantsOnly) {
         // Developer logic: Show everyone matching search
         return p.name.includes(searchTerm) || p.phone.includes(searchTerm) || p.username?.includes(searchTerm);
    }

    if (showServantsOnly) {
       // Show Servants, Priests, and Developers
       if (p.role === Role.Student) return false;
    } else {
       // Normal View (Students)
       if (p.role !== Role.Student) return false;
       if (selectedStage && p.stage !== selectedStage) return false;
    }
    const matchesSearch = p.name.includes(searchTerm) || p.phone.includes(searchTerm);
    return matchesSearch;
  });

  const canEdit = (targetPerson?: Person) => {
    if (isDeveloper) return true; // Developer can edit everyone
    if (currentUser.role === Role.Student) return false;
    if (currentUser.role === Role.Priest) return true;
    if (currentUser.role === Role.Servant) {
      if (!targetPerson) return true;
      if (targetPerson.role === Role.Priest || targetPerson.role === Role.Developer) return false;
      return true; 
    }
    return false;
  };

  // --- Actions ---
  const handleAddNew = () => {
    setEditingPerson(null);
    setIsAdding(true);
    setFormError(null);
    setFormData({
      name: '',
      username: '',
      password: '',
      phone: '',
      address: '',
      governorate: 'القاهرة',
      diocese: '',
      stage: selectedStage || Stage.Prim12,
      role: showServantsOnly ? Role.Servant : Role.Student,
      notes: '',
      needsVisitation: false
    });
    setIsModalOpen(true);
  };

  const handleEdit = (person: Person) => {
    setEditingPerson(person);
    setIsAdding(false);
    setFormError(null);
    setFormData(person);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name || !formData.phone || !formData.password) {
      setFormError('يرجى ملء الاسم، الهاتف، وكلمة المرور.');
      return;
    }

    if (isAdding) {
      // Create new person with Validation
      const result = addPerson({ ...formData } as Person);
      if (!result.success) {
        setFormError(result.message || 'حدث خطأ أثناء الإضافة');
        return;
      }
    } else if (editingPerson) {
      // Update existing
      updatePerson({ ...editingPerson, ...formData } as Person);
    }

    setIsModalOpen(false);
    onDataChange();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد تماماً؟ سيتم حذف هذا الشخص وجميع سجلات حضوره.')) {
      const success = deletePerson(id);
      if (success) {
        onDataChange();
      } else {
        alert("حدث خطأ أثناء الحذف");
      }
    }
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
          <h3 className="text-lg font-bold text-slate-800 mb-1">رمز الدخول</h3>
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

  // 2. Stage Selection View (Skipped for Developer)
  if (view === 'stages' && !isDeveloper) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">قائمة المخدومين</h2>
          <p className="text-slate-600 text-sm mt-1 font-semibold">اختر المرحلة للدخول</p>
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

  // 3. List View (Developer Dashboard or Standard List)
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
              {!showServantsOnly && !isDeveloper && (
                <button onClick={() => setView('stages')} className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200">
                  <ArrowRight size={20} className="text-slate-600" />
                </button>
              )}
              <h2 className="text-xl font-bold text-slate-900">
                {isDeveloper 
                    ? 'لوحة تحكم المطور (كل البيانات)' 
                    : showServantsOnly 
                        ? 'قائمة الخدام' 
                        : `مرحلة ${selectedStage}`
                }
              </h2>
           </div>
           
           {canEdit() && (
             <button 
               onClick={handleAddNew}
               className="flex items-center gap-2 bg-purple-700 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-purple-200 hover:bg-purple-800 transition-all font-bold text-sm"
             >
               <Plus size={18} />
               <span className="hidden sm:inline">إضافة جديد</span>
               <span className="sm:hidden">إضافة</span>
             </button>
           )}
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input
            type="text"
            placeholder={isDeveloper ? "بحث في كل البيانات..." : "بحث بالاسم أو الهاتف..."}
            className="w-full pr-10 pl-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none shadow-sm text-slate-900 placeholder:text-slate-500 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredPeople.map(person => (
          <div key={person.id} className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden ${person.needsVisitation ? 'border-r-4 border-r-red-500' : ''}`}>
            
            {/* Top Section */}
            <div className="p-4 pb-2 flex items-start gap-4">
               {/* Avatar */}
               <div className={`w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center text-xl font-bold shadow-sm ${person.role === Role.Student ? 'bg-purple-100 text-purple-700' : person.role === Role.Developer ? 'bg-slate-800 text-white' : 'bg-indigo-100 text-indigo-700'}`}>
                  {person.name.charAt(0)}
               </div>

               {/* Info Area */}
               <div className="flex-1 min-w-0 pt-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 leading-tight truncate pl-2">{person.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold border border-slate-200">{person.role}</span>
                          {isDeveloper && <span className="text-[10px] bg-blue-50 px-2 py-0.5 rounded text-blue-700 font-bold border border-blue-100">{person.stage}</span>}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    {canEdit(person) && (
                      <div className="flex items-center gap-2 flex-shrink-0 mr-auto">
                        <button 
                          onClick={() => handleEdit(person)} 
                          className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-purple-700 bg-slate-50 hover:bg-purple-50 rounded-lg transition-colors border border-slate-200"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(person.id)} 
                          className="w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-700 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors border border-slate-200"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
               </div>
            </div>

            {/* Details Section */}
            <div className="px-4 pb-4 pt-2 space-y-2">
              <div className="bg-slate-50 rounded-xl p-3 flex flex-col gap-2 text-sm border border-slate-100">
                <div className="flex items-center gap-2">
                   <Phone size={14} className="text-slate-500" />
                   <a href={`tel:${person.phone}`} className="hover:text-purple-700 font-mono dir-ltr font-bold text-slate-800">{person.phone}</a>
                </div>
                {person.address && (
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-slate-500 mt-0.5" />
                    <span className="leading-tight text-slate-700 font-medium">{person.address}</span>
                  </div>
                )}
                
                {/* Developer Fields: Governorate / Diocese */}
                {(isDeveloper || person.governorate) && (
                    <div className="grid grid-cols-2 gap-2 mt-1 pt-2 border-t border-slate-200">
                        <div className="flex items-center gap-1.5 text-xs">
                             <Globe size={12} className="text-slate-500"/>
                             <span className="text-slate-500 font-semibold">المحافظة:</span>
                             <span className="font-bold text-slate-800">{person.governorate || '-'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                             <Church size={12} className="text-slate-500"/>
                             <span className="text-slate-500 font-semibold">الإيبارشية:</span>
                             <span className="font-bold text-slate-800">{person.diocese || '-'}</span>
                        </div>
                    </div>
                )}

                {person.username && (
                   <div className="flex items-center gap-2 text-xs text-slate-400 pt-1 border-t border-slate-200 mt-1">
                      <span className="font-semibold text-slate-500">اسم المستخدم:</span>
                      <span className="font-mono text-slate-700 font-bold">{person.username}</span>
                   </div>
                )}
              </div>

              {person.notes && (
                <div className="bg-amber-50 p-2.5 rounded-lg text-xs text-amber-900 border border-amber-200 mt-2">
                  <strong className="text-amber-800">ملاحظات:</strong> {person.notes}
                </div>
              )}
            </div>
            
            {person.needsVisitation && (
              <div className="bg-red-50 text-red-700 px-4 py-1.5 text-xs font-bold border-t border-red-100 flex items-center justify-center gap-2">
                <AlertCircle size={12} />
                <span>هذا الشخص يحتاج إلى افتقاد عاجل</span>
              </div>
            )}
          </div>
        ))}

        {filteredPeople.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            <UserPlus size={40} className="mb-2 opacity-50 text-slate-400" />
            <p className="text-slate-500 font-semibold">لا توجد بيانات..</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="p-5 bg-slate-50 border-b flex justify-between items-center sticky top-0 z-10">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                {isAdding ? <UserPlus size={20} className="text-purple-700"/> : <Edit2 size={20} className="text-purple-700"/>}
                {isAdding ? 'إضافة جديد' : 'تعديل البيانات'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-300">
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              
              {formError && (
                 <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-3 text-red-700 text-sm">
                    <ShieldAlert size={20} className="flex-shrink-0 mt-0.5" />
                    <p className="font-bold">{formError}</p>
                 </div>
              )}

              {/* Data Section */}
              <div className="space-y-4">
                 {/* Credentials Section */}
                 <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 space-y-3">
                    <h4 className="text-purple-800 font-bold text-xs mb-1 flex items-center gap-1">
                       <Lock size={12} /> بيانات الدخول
                    </h4>
                    <div>
                      <input
                        required
                        type="text"
                        className="w-full border border-purple-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-purple-600 outline-none font-bold text-slate-900 placeholder:text-slate-400"
                        placeholder="اسم المستخدم"
                        value={formData.username}
                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                        disabled={!isAdding && !isDeveloper} 
                      />
                    </div>
                    <div>
                      <input
                        required
                        type="text"
                        className="w-full border border-purple-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-purple-600 outline-none font-bold text-slate-900 placeholder:text-slate-400"
                        placeholder="كلمة المرور"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>
                 </div>

                 {/* Basic Info */}
                 <div className="grid grid-cols-1 gap-4">
                    <input
                      required
                      type="text"
                      className="w-full border-2 border-slate-200 rounded-xl p-3 focus:border-slate-400 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-500"
                      placeholder="الاسم ثلاثي"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                    <input
                      required
                      type="tel"
                      className="w-full border-2 border-slate-200 rounded-xl p-3 focus:border-slate-400 outline-none transition-all text-right dir-ltr font-mono font-bold text-slate-900 placeholder:text-slate-500"
                      placeholder="رقم الهاتف"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-bold text-slate-700 mb-1.5">المرحلة</label>
                     <select 
                       disabled={!isAdding && !showServantsOnly && !isDeveloper} 
                       className="w-full border-2 border-slate-200 rounded-xl p-3 bg-slate-50 text-sm font-bold text-slate-900"
                       value={formData.stage}
                       onChange={e => setFormData({...formData, stage: e.target.value as Stage})}
                     >
                       {STAGE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">الدور</label>
                      <select 
                          disabled={!isDeveloper && !isAdding}
                          className="w-full border-2 rounded-xl p-3 font-bold text-sm bg-slate-50 border-slate-200 text-slate-900"
                          value={formData.role}
                          onChange={e => setFormData({...formData, role: e.target.value as Role})}
                      >
                        <option value={Role.Student}>مخدوم</option>
                        <option value={Role.Servant}>خادم</option>
                        {isDeveloper && <option value={Role.Priest}>كاهن</option>}
                        {isDeveloper && <option value={Role.Developer}>مطور</option>}
                      </select>
                   </div>
                </div>

                {/* Location - Developer / Admin fields */}
                <div className="grid grid-cols-2 gap-3">
                   <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">المحافظة</label>
                      <select 
                        className="w-full border-2 border-slate-200 rounded-xl p-3 bg-slate-50 text-sm font-bold text-slate-900"
                        value={formData.governorate}
                        onChange={e => setFormData({...formData, governorate: e.target.value})}
                      >
                         {GOVERNORATES.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">الإيبارشية</label>
                      <input
                        type="text"
                        className="w-full border-2 border-slate-200 rounded-xl p-3 text-sm focus:border-purple-600 outline-none font-bold text-slate-900"
                        value={formData.diocese}
                        onChange={e => setFormData({ ...formData, diocese: e.target.value })}
                      />
                   </div>
                </div>

                <input
                    type="text"
                    className="w-full border-2 border-slate-200 rounded-xl p-3 focus:border-slate-400 outline-none font-bold text-slate-900 placeholder:text-slate-500"
                    placeholder="العنوان بالتفصيل"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                  />

                <textarea
                    className="w-full border-2 border-slate-200 rounded-xl p-3 focus:border-slate-400 outline-none font-bold text-slate-900 placeholder:text-slate-500"
                    rows={2}
                    placeholder="ملاحظات..."
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-100 text-slate-800 py-3.5 rounded-xl hover:bg-slate-200 font-bold transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-700 text-white py-3.5 rounded-xl hover:bg-purple-800 font-bold shadow-lg shadow-purple-200 transition-all active:scale-95"
                >
                  {isAdding ? 'حفظ البيانات' : 'حفظ التعديلات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
