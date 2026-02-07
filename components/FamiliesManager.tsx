
import React, { useState } from 'react';
import { Family, Person } from '../types';
import { addFamily, deleteFamily, updateFamily, toggleFamilyPayment, handoverPayments } from '../services/db';
import { Plus, Search, Edit2, Trash2, Phone, CheckCircle, XCircle, Users, Calendar, Coins, Lock, HandCoins, ArrowRightLeft } from 'lucide-react';

interface FamiliesManagerProps {
  families: Family[];
  onDataChange: () => void;
  currentUser: Person;
}

const SUBSCRIPTION_AMOUNT = 100;
const ACCESS_PIN = '0000';

export const FamiliesManager: React.FC<FamiliesManagerProps> = ({ families, onDataChange, currentUser }) => {
  // Lock Screen State
  const [isLocked, setIsLocked] = useState(true);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFamily, setEditingFamily] = useState<Family | null>(null);
  
  // Date State for payment filtering
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const months = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];

  const [formData, setFormData] = useState<Partial<Family>>({
    familyName: '',
    membersCount: 1,
    phone1: '',
    phone2: '',
    password: '0000',
    notes: '',
    payments: {}
  });

  // --- Lock Logic ---
  const handleUnlock = (e: React.FormEvent) => {
      e.preventDefault();
      if (pinInput === ACCESS_PIN) {
          setIsLocked(false);
      } else {
          setPinError(true);
          setPinInput('');
      }
  };

  if (isLocked) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in zoom-in duration-300">
            <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-sm w-full border border-slate-100">
                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">بيانات الأسر محمية</h2>
                <p className="text-slate-500 text-sm mb-6 font-semibold">أدخل الرمز السري لعرض البيانات والماليات</p>
                <form onSubmit={handleUnlock}>
                    <input 
                        type="password" 
                        maxLength={4}
                        autoFocus
                        className={`w-full text-center text-3xl tracking-[0.5em] py-3 border-2 rounded-2xl outline-none transition-all mb-4 ${pinError ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:border-purple-500'}`}
                        placeholder="••••"
                        value={pinInput}
                        onChange={(e) => { setPinError(false); setPinInput(e.target.value); }}
                    />
                    {pinError && <p className="text-red-600 text-xs mb-4 font-bold">الرمز غير صحيح</p>}
                    <button type="submit" className="w-full bg-purple-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-200 hover:bg-purple-800 transition-transform active:scale-95">
                        فتح السجلات
                    </button>
                </form>
            </div>
        </div>
      );
  }

  // --- Main Logic ---

  const filteredFamilies = families.filter(f => 
    f.familyName.includes(searchTerm) || f.phone1.includes(searchTerm)
  );

  // Helper to check payment status for selected month
  const getPaymentInfo = (family: Family) => {
      const key = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
      return family.payments?.[key] || null;
  };

  const handleAddNew = () => {
    setEditingFamily(null);
    setFormData({
        familyName: '',
        membersCount: 1,
        phone1: '',
        phone2: '',
        password: '0000',
        notes: '',
        payments: {}
    });
    setIsModalOpen(true);
  };

  const handleEdit = (family: Family) => {
    setEditingFamily(family);
    setFormData(family);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الأسرة؟')) {
      deleteFamily(id);
      onDataChange();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.familyName || !formData.phone1) return;

    if (editingFamily) {
      updateFamily({ ...editingFamily, ...formData } as Family);
    } else {
      addFamily({ ...formData, password: '0000', payments: {} } as Family);
    }
    setIsModalOpen(false);
    onDataChange();
  };

  const handleTogglePayment = (familyId: string) => {
      toggleFamilyPayment(familyId, selectedYear, selectedMonth);
      onDataChange();
  };

  const handleHandover = () => {
      if (confirm(`هل أنت متأكد من تسليم كل المبالغ المحصلة لشهر ${months[selectedMonth]}؟`)) {
          handoverPayments(selectedYear, selectedMonth);
          onDataChange();
      }
  };

  // --- Financial Stats ---
  const totalFamilies = filteredFamilies.length;
  
  // Calculate payments based on ALL families (not just filtered, usually for financials we look at total scope, but here filtered makes sense if searching)
  // Let's use filteredFamilies for display stats to allow drilling down, but Handover affects ALL DB records for that month.
  
  // For the Stats Bar, we will use the *Filtered* list to match what is seen.
  const paidFamiliesInView = filteredFamilies.filter(f => getPaymentInfo(f) !== null);
  const paidCount = paidFamiliesInView.length;
  
  const collectedAmount = paidCount * SUBSCRIPTION_AMOUNT;
  
  // Handover Logic (Look at the payment info)
  const handedOverCount = paidFamiliesInView.filter(f => getPaymentInfo(f)?.handedOver).length;
  const handedOverAmount = handedOverCount * SUBSCRIPTION_AMOUNT;
  const pendingHandoverAmount = collectedAmount - handedOverAmount;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
       
       {/* Header & Controls */}
       <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Users className="text-purple-700" />
                    <span>إدارة الأسر</span>
                </h2>
                <button 
                    onClick={handleAddNew}
                    className="flex items-center gap-2 bg-purple-700 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-purple-200 hover:bg-purple-800 transition-all font-bold text-sm"
                >
                    <Plus size={18} />
                    <span className="hidden sm:inline">إضافة أسرة</span>
                </button>
            </div>

            {/* Date Filter */}
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                <Calendar size={20} className="text-slate-400 mr-1" />
                <select 
                    className="bg-transparent text-sm font-bold text-slate-800 outline-none flex-1"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                >
                    {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
                <select 
                    className="bg-transparent text-sm font-bold text-slate-800 outline-none border-r border-slate-300 pr-2"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                    {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>

            {/* Financial Dashboard Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-4 text-white shadow-md">
                <div className="flex justify-between items-start mb-4 border-b border-slate-700 pb-2">
                    <div className="flex items-center gap-2">
                        <Coins className="text-yellow-400" size={20}/>
                        <span className="font-bold text-sm">الماليات الشهرية ({months[selectedMonth]})</span>
                    </div>
                    {pendingHandoverAmount > 0 && (
                        <button 
                            onClick={handleHandover}
                            className="bg-yellow-500 hover:bg-yellow-600 text-black text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors animate-pulse"
                        >
                            <HandCoins size={14} />
                            تسليم المبلغ ({pendingHandoverAmount})
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white/10 p-2 rounded-lg">
                        <p className="text-[10px] text-slate-300 mb-1">إجمالي الاشتراكات</p>
                        <p className="font-mono font-bold text-lg">{collectedAmount}</p>
                        <p className="text-[10px] text-slate-400">جنية</p>
                    </div>
                    <div className="bg-green-500/20 p-2 rounded-lg border border-green-500/30">
                        <p className="text-[10px] text-green-200 mb-1">تم التسليم</p>
                        <p className="font-mono font-bold text-lg text-green-300">{handedOverAmount}</p>
                        <p className="text-[10px] text-green-400">جنية</p>
                    </div>
                    <div className="bg-red-500/20 p-2 rounded-lg border border-red-500/30">
                        <p className="text-[10px] text-red-200 mb-1">مع الخادم</p>
                        <p className="font-mono font-bold text-lg text-red-300">{pendingHandoverAmount}</p>
                        <p className="text-[10px] text-red-400">جنية</p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                    type="text"
                    placeholder="بحث عن أسرة..."
                    className="w-full pr-10 pl-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none shadow-sm text-slate-900 placeholder:text-slate-500 font-medium text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
       </div>

      <div className="grid grid-cols-1 gap-4">
          {filteredFamilies.map(family => {
              const paymentInfo = getPaymentInfo(family);
              const isPaid = paymentInfo !== null;
              const isHandedOver = paymentInfo?.handedOver || false;
              const paymentDate = paymentInfo ? new Date(paymentInfo.date) : null;

              return (
                <div key={family.id} className={`bg-white p-4 rounded-2xl shadow-sm border transition-all ${isPaid ? 'border-green-200' : 'border-slate-200'}`}>
                    {/* Card Header */}
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold border-2 border-white shadow-sm">
                                {family.familyName.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">{family.familyName}</h3>
                                <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold mt-0.5">
                                    <Users size={12} />
                                    <span>{family.membersCount} أفراد</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <button onClick={() => handleEdit(family)} className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-purple-700 hover:bg-purple-50 transition-colors"><Edit2 size={14}/></button>
                            <button onClick={() => handleDelete(family.id)} className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={14}/></button>
                        </div>
                    </div>
                    
                    {/* Phones */}
                    <div className="flex flex-wrap gap-2 text-xs mb-4">
                        <a href={`tel:${family.phone1}`} className="flex items-center gap-1 bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-100 hover:border-purple-200 transition-colors">
                            <Phone size={12} className="text-slate-400"/>
                            <span className="font-mono font-bold text-slate-700 dir-ltr">{family.phone1}</span>
                        </a>
                        {family.phone2 && (
                            <a href={`tel:${family.phone2}`} className="flex items-center gap-1 bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-100 hover:border-purple-200 transition-colors">
                                <Phone size={12} className="text-slate-400"/>
                                <span className="font-mono font-bold text-slate-700 dir-ltr">{family.phone2}</span>
                            </a>
                        )}
                    </div>

                    {/* Payment Action Bar - Professional Style */}
                    <div className={`p-3 rounded-xl flex items-center justify-between transition-colors ${isPaid ? (isHandedOver ? 'bg-green-100/50 border border-green-200' : 'bg-green-50 border border-green-100') : 'bg-slate-50 border border-slate-100'}`}>
                        <div className="flex items-center gap-2">
                             <div className={`p-1.5 rounded-full ${isPaid ? 'bg-green-200 text-green-700' : 'bg-slate-200 text-slate-500'}`}>
                                <Coins size={16} />
                             </div>
                             <div className="flex flex-col">
                                 <span className={`text-xs font-bold ${isPaid ? 'text-green-800' : 'text-slate-500'}`}>
                                     {isPaid ? 'تم الاشتراك' : 'لم يتم الدفع'}
                                 </span>
                                 {isPaid && paymentDate && (
                                     <div className="flex items-center gap-1">
                                        <span className="text-[10px] font-mono font-semibold text-green-600 dir-ltr text-right">
                                            {paymentDate.toLocaleDateString('en-GB')}
                                        </span>
                                        {isHandedOver && (
                                            <span className="text-[9px] bg-green-200 text-green-800 px-1 rounded flex items-center gap-0.5">
                                                <ArrowRightLeft size={8} /> سلمت
                                            </span>
                                        )}
                                     </div>
                                 )}
                             </div>
                        </div>
                        
                        <button 
                          onClick={() => handleTogglePayment(family.id)}
                          // Disable button if already handed over to prevent untoggling paid status after handover (optional, but good for integrity)
                          // For flexibility, we allow untoggling but it warns in real apps. Here we allow it.
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1.5 ${
                              isPaid 
                              ? 'bg-white text-green-700 border border-green-200 hover:bg-green-50' 
                              : 'bg-slate-800 text-white hover:bg-slate-700'
                          }`}
                        >
                            {isPaid ? (
                                <>
                                  <span>تعديل</span>
                                  <Edit2 size={10} />
                                </>
                            ) : (
                                <>
                                  <CheckCircle size={12} />
                                  <span>تسجيل {SUBSCRIPTION_AMOUNT}ج</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
              );
          })}
          
          {filteredFamilies.length === 0 && (
             <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                 <Users className="mx-auto mb-2 opacity-50" size={32} />
                 <p className="font-bold text-sm">لا توجد أسر مطابقة للبحث</p>
             </div>
          )}
      </div>

      {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-lg p-5 shadow-xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
               <h3 className="font-bold text-lg mb-4 text-slate-900 flex items-center gap-2">
                   {editingFamily ? <Edit2 size={20} className="text-purple-700"/> : <Plus size={20} className="text-purple-700"/>}
                   {editingFamily ? 'تعديل بيانات أسرة' : 'إضافة أسرة جديدة'}
               </h3>
               <form onSubmit={handleSubmit} className="space-y-4">
                   <div>
                       <label className="text-xs font-bold text-slate-600 mb-1 block">اسم الأسرة</label>
                       <input required className="w-full border-2 border-slate-200 p-3 rounded-xl outline-none focus:border-purple-600 font-bold text-slate-900 text-sm" 
                         value={formData.familyName} onChange={e => setFormData({...formData, familyName: e.target.value})} placeholder="مثال: أسرة أ. مينا مجدي" />
                   </div>
                   <div>
                       <label className="text-xs font-bold text-slate-600 mb-1 block">عدد الأفراد</label>
                       <input type="number" min="1" className="w-full border-2 border-slate-200 p-3 rounded-xl outline-none focus:border-purple-600 font-bold text-slate-900 text-sm" 
                         value={formData.membersCount} onChange={e => setFormData({...formData, membersCount: parseInt(e.target.value)})} />
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                       <div>
                           <label className="text-xs font-bold text-slate-600 mb-1 block">رقم هاتف 1 (أساسي)</label>
                           <input required className="w-full border-2 border-slate-200 p-3 rounded-xl outline-none focus:border-purple-600 font-bold text-right dir-ltr font-mono text-sm" 
                             value={formData.phone1} onChange={e => setFormData({...formData, phone1: e.target.value})} placeholder="01xxxxxxxxx" />
                       </div>
                       <div>
                           <label className="text-xs font-bold text-slate-600 mb-1 block">رقم هاتف 2 (اختياري)</label>
                           <input className="w-full border-2 border-slate-200 p-3 rounded-xl outline-none focus:border-purple-600 font-bold text-right dir-ltr font-mono text-sm" 
                             value={formData.phone2} onChange={e => setFormData({...formData, phone2: e.target.value})} placeholder="01xxxxxxxxx" />
                       </div>
                   </div>

                   <div>
                       <label className="text-xs font-bold text-slate-600 mb-1 block">كلمة المرور</label>
                       <input 
                         disabled
                         className="w-full bg-slate-100 border border-slate-200 p-3 rounded-xl outline-none font-bold text-slate-500 text-sm" 
                         value={formData.password} 
                       />
                       <p className="text-[10px] text-slate-400 mt-1">كلمة المرور الافتراضية هي 0000</p>
                   </div>
                   
                   <div>
                       <label className="text-xs font-bold text-slate-600 mb-1 block">ملاحظات</label>
                       <textarea 
                         rows={2}
                         className="w-full border-2 border-slate-200 p-3 rounded-xl outline-none focus:border-purple-600 font-bold text-slate-900 text-sm" 
                         value={formData.notes} 
                         onChange={e => setFormData({...formData, notes: e.target.value})}
                         placeholder="أي تفاصيل إضافية..."
                       />
                   </div>

                   <div className="flex gap-3 pt-2">
                       <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 py-3.5 rounded-xl font-bold text-slate-700 hover:bg-slate-200 transition-colors">إلغاء</button>
                       <button type="submit" className="flex-1 bg-purple-700 py-3.5 rounded-xl font-bold text-white shadow-lg shadow-purple-200 hover:bg-purple-800 transition-colors">حفظ البيانات</button>
                   </div>
               </form>
            </div>
          </div>
      )}
    </div>
  );
};
