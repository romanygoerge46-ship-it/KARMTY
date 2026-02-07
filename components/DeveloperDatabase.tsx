
import React, { useState } from 'react';
import { Person } from '../types';
import { Search, Database, Download } from 'lucide-react';

interface DeveloperDatabaseProps {
  people: Person[];
}

export const DeveloperDatabase: React.FC<DeveloperDatabaseProps> = ({ people }) => {
  const [filter, setFilter] = useState('');

  const filtered = people.filter(p => 
    p.name.includes(filter) || 
    p.phone.includes(filter) || 
    p.username?.includes(filter) ||
    p.diocese?.includes(filter)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
           <Database className="text-purple-700" />
           قاعدة البيانات المركزية
         </h2>
         <span className="bg-slate-800 text-white px-3 py-1 rounded-lg text-xs font-bold">
           {filtered.length} سجل
         </span>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
         <div className="relative">
           <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
           <input 
             type="text"
             placeholder="بحث شامل (الاسم، الهاتف، المستخدم، الإيبارشية)..."
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
               <th className="p-3 font-bold whitespace-nowrap">ID</th>
               <th className="p-3 font-bold whitespace-nowrap">الاسم</th>
               <th className="p-3 font-bold whitespace-nowrap">الدور</th>
               <th className="p-3 font-bold whitespace-nowrap">المرحلة</th>
               <th className="p-3 font-bold whitespace-nowrap">الهاتف</th>
               <th className="p-3 font-bold whitespace-nowrap">المستخدم</th>
               <th className="p-3 font-bold whitespace-nowrap">كلمة المرور</th>
               <th className="p-3 font-bold whitespace-nowrap">الإيبارشية</th>
               <th className="p-3 font-bold whitespace-nowrap">تاريخ الانضمام</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
             {filtered.map((person) => (
               <tr key={person.id} className="hover:bg-slate-50 transition-colors">
                 <td className="p-3 font-mono text-slate-500 text-xs">{person.id.slice(-4)}</td>
                 <td className="p-3 font-bold text-slate-900">{person.name}</td>
                 <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      person.role === 'مطور النظام' ? 'bg-black text-white' :
                      person.role === 'كاهن' ? 'bg-slate-700 text-white' :
                      person.role === 'خادم' ? 'bg-indigo-100 text-indigo-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {person.role}
                    </span>
                 </td>
                 <td className="p-3 text-slate-600 font-medium">{person.stage}</td>
                 <td className="p-3 font-mono dir-ltr text-right font-bold text-slate-800">{person.phone}</td>
                 <td className="p-3 font-mono text-slate-700">{person.username}</td>
                 <td className="p-3 font-mono text-slate-400">{person.password}</td>
                 <td className="p-3 text-slate-800">{person.diocese}</td>
                 <td className="p-3 font-mono text-xs text-slate-500">
                   {new Date(person.joinedAt).toLocaleDateString('en-GB')}
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
         {filtered.length === 0 && (
           <div className="p-8 text-center text-slate-500 font-bold">لا توجد نتائج مطابقة</div>
         )}
      </div>
    </div>
  );
};
