"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Hexagon, Plus, User, Users, MoreHorizontal, MapPin, Briefcase, Activity, X, Edit2, Trash2 } from "lucide-react";

type Department = {
  id: string;
  name: string;
  deputy: string;
  staff_count: number;
  status: 'active' | 'inactive';
  location: string;
};

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDep, setEditingDep] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    deputy: '',
    staff_count: 0,
    status: 'active' as Department['status'],
    location: ''
  });

  const fetchDeps = async () => {
    const { data } = await supabase.from('departments').select('*').order('created_at', { ascending: false });
    if (data) {
      setDepartments(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDeps();
    const sub = supabase.channel('departments').on('postgres_changes', { event: '*', schema: 'public', table: 'departments' }, fetchDeps).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  const handleOpenModal = (dep: Department | null = null) => {
    if (dep) {
      setEditingDep(dep);
      setFormData({ name: dep.name, deputy: dep.deputy, staff_count: dep.staff_count, status: dep.status, location: dep.location });
    } else {
      setEditingDep(null);
      setFormData({ name: '', deputy: '', staff_count: 0, status: 'active', location: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (editingDep) {
      await supabase.from('departments').update(formData).eq('id', editingDep.id);
    } else {
      await supabase.from('departments').insert([formData]);
    }
    setIsModalOpen(false);
    fetchDeps();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Ushbu bo'limni o'chirishni tasdiqlaysizmi?")) {
      await supabase.from('departments').delete().eq('id', id);
      fetchDeps();
    }
  };

  if (loading && departments.length === 0) return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-red-600"></div>
      <p className="font-black text-slate-300 uppercase tracking-widest text-xs italic">Bo'limlar yuklanmoqda...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 flex items-center gap-4 uppercase italic">
               <Hexagon size={32} className="text-red-600 animate-spin-slow" /> Bo'limlar <span className="text-red-600/30">({departments.length})</span>
            </h1>
            <p className="text-slate-400 font-bold flex items-center gap-2 uppercase text-[10px] tracking-widest leading-none">
               Tashkiliy tuzilma va mas'ul xodimlar boshqaruvi
            </p>
         </div>
         <button onClick={() => handleOpenModal()} className="flex items-center gap-3 rounded-2xl bg-slate-900 px-8 py-4 text-sm font-black text-white shadow-2xl hover:bg-slate-800 transition active:scale-95">
            <Plus size={20} /> Yangi Bo'lim
         </button>
      </div>

      {/* Grid of Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
         {departments.map((dep) => (
            <div key={dep.id} className="group relative overflow-hidden rounded-[3rem] bg-white p-8 shadow-xl shadow-slate-200/40 border border-white transition-all hover:-translate-y-1 hover:shadow-2xl">
               <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-slate-50 opacity-50 transition-transform group-hover:scale-150 duration-700" />
               
               <div className="relative z-10 flex flex-col gap-6">
                  <div className="flex justify-between items-start">
                     <div className="h-14 w-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 shadow-inner">
                        <Hexagon size={24} />
                     </div>
                     <div className="flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${dep.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                           {dep.status === 'active' ? 'Faol' : 'Nofaol'}
                        </span>
                        <div className="flex gap-1">
                           <button onClick={() => handleOpenModal(dep)} className="p-2 hover:bg-blue-50 rounded-xl transition text-slate-300 hover:text-blue-600">
                              <Edit2 size={18} />
                           </button>
                           <button onClick={() => handleDelete(dep.id)} className="p-2 hover:bg-red-50 rounded-xl transition text-slate-300 hover:text-red-600">
                              <Trash2 size={18} />
                           </button>
                        </div>
                     </div>
                  </div>

                  <div>
                     <h3 className="text-xl font-black text-slate-800 mb-1">{dep.name}</h3>
                     <p className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest"><MapPin size={12} className="text-red-500" /> {dep.location}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-slate-50 p-4 rounded-3xl border border-white shadow-inner">
                        <div className="flex items-center gap-3 mb-2">
                           <div className="h-8 w-8 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                              <User size={16} />
                           </div>
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Mas'ul Shaxs</span>
                        </div>
                        <p className="font-black text-slate-800 text-sm truncate">{dep.deputy}</p>
                     </div>
                     <div className="bg-slate-50 p-4 rounded-3xl border border-white shadow-inner">
                        <div className="flex items-center gap-3 mb-2">
                           <div className="h-8 w-8 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                              <Users size={16} />
                           </div>
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Xodimlar</span>
                        </div>
                        <p className="font-black text-slate-800 text-sm">{dep.staff_count} ta</p>
                     </div>
                  </div>

                  <div className="pt-2">
                     <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                        <span>Ish Yuklamasi</span>
                        <span className="text-red-500 font-black">75%</span>
                     </div>
                     <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-red-600 to-orange-400 rounded-full" style={{ width: '75%' }}></div>
                     </div>
                  </div>
               </div>
            </div>
         ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-lg rounded-[2.5rem] bg-white p-10 shadow-3xl animate-in zoom-in-95 duration-300">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-slate-900">{editingDep ? "Bo'limni Tahrirlash" : "Yangi Bo'lim Qo'shish"}</h2>
                <button onClick={() => setIsModalOpen(false)} className="rounded-full bg-slate-50 p-2 text-slate-400"><X size={24} /></button>
             </div>
             
             <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Bo'lim Nomi</label>
                   <input required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-red-500 shadow-sm" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Mas'ul Shaxs (Deputy)</label>
                   <input required value={formData.deputy} onChange={e=>setFormData({...formData, deputy: e.target.value})} className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-red-500 shadow-sm" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Manzil (Bino, Qavat...)</label>
                   <input required value={formData.location} onChange={e=>setFormData({...formData, location: e.target.value})} className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-red-500 shadow-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Xodimlar Soni</label>
                      <input type="number" required value={formData.staff_count} onChange={e=>setFormData({...formData, staff_count: Number(e.target.value)})} className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-red-500 shadow-sm" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Status</label>
                      <select value={formData.status} onChange={e=>setFormData({...formData, status: e.target.value as any})} className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-red-500 shadow-sm appearance-none">
                         <option value="active">Faol</option>
                         <option value="inactive">Nofaol</option>
                      </select>
                   </div>
                </div>
                
                <button type="submit" className="w-full rounded-2xl bg-red-600 py-4 text-sm font-black text-white shadow-xl shadow-red-100 hover:bg-red-700 transition active:scale-95 uppercase tracking-widest mt-4">
                   Saqlash
                </button>
             </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
      `}</style>
    </div>
  );
}
