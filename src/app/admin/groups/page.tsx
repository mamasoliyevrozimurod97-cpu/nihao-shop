"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Boxes, Plus, Search, UserCheck, ShieldCheck, MoreVertical, Calendar, X, Edit2, Trash2 } from "lucide-react";

type Group = {
  id: string;
  name: string;
  supervisor: string;
  members_count: number;
  status: 'active' | 'in_mission' | 'standby';
  last_activity: string;
};

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    supervisor: '',
    members_count: 0,
    status: 'active' as Group['status']
  });

  const fetchGroups = async () => {
    const { data } = await supabase.from('groups').select('*').order('created_at', { ascending: false });
    if (data) {
      setGroups(data);
      setFilteredGroups(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGroups();
    const sub = supabase.channel('groups').on('postgres_changes', { event: '*', schema: 'public', table: 'groups' }, fetchGroups).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  useEffect(() => {
    const result = groups.filter(g => 
      g.name.toLowerCase().includes(search.toLowerCase()) || 
      g.supervisor.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredGroups(result);
  }, [search, groups]);

  const handleOpenModal = (group: Group | null = null) => {
    if (group) {
      setEditingGroup(group);
      setFormData({ name: group.name, supervisor: group.supervisor, members_count: group.members_count, status: group.status });
    } else {
      setEditingGroup(null);
      setFormData({ name: '', supervisor: '', members_count: 0, status: 'active' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (editingGroup) {
      await supabase.from('groups').update(formData).eq('id', editingGroup.id);
    } else {
      await supabase.from('groups').insert([formData]);
    }
    setIsModalOpen(false);
    fetchGroups();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Ushbu guruhni o'chirishni tasdiqlaysizmi?")) {
      await supabase.from('groups').delete().eq('id', id);
      fetchGroups();
    }
  };

  if (loading && groups.length === 0) return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-red-600"></div>
      <p className="font-black text-slate-300 uppercase tracking-widest text-xs italic">Guruhlar yuklanmoqda...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-1 flex items-center gap-4 uppercase italic">
               <Boxes size={36} className="text-red-600 drop-shadow-lg" /> Jamoalar <span className="text-red-600/30">({filteredGroups.length})</span>
            </h1>
            <p className="text-slate-400 font-bold flex items-center gap-2 uppercase text-[10px] tracking-widest">
               Xizmat guruhlari va jamoa boshqaruvi
            </p>
         </div>
         <div className="flex items-center gap-4">
            <div className="relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <input 
                  type="text" 
                  placeholder="Guruh yoki Supervisor..." 
                  className="h-14 w-64 rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm font-bold focus:border-red-500 outline-none transition shadow-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
               />
            </div>
            <button onClick={() => handleOpenModal()} className="flex items-center gap-4 rounded-2xl bg-red-600 px-8 py-4 text-sm font-black text-white shadow-xl shadow-red-100 transition-all hover:bg-red-700 active:scale-95 uppercase tracking-widest">
               <Plus size={20} /> Yangi Guruh
            </button>
         </div>
      </div>

      {/* Modern Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {filteredGroups.map((group) => (
            <div key={group.id} className="group relative rounded-[3rem] bg-white p-8 shadow-2xl shadow-slate-200/50 border border-white transition-all hover:-translate-y-2">
               <div className="absolute right-0 top-0 h-32 w-32 bg-slate-50 rounded-bl-[4rem] group-hover:bg-red-50 transition-colors -z-0" />
               
               <div className="relative z-10 space-y-6">
                  <div className="flex justify-between items-center">
                     <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                        group.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                        group.status === 'in_mission' ? 'bg-blue-50 text-blue-600 border border-blue-100 animate-pulse' : 
                        'bg-slate-100 text-slate-400 border border-slate-200'
                     }`}>
                        <ShieldCheck size={14} /> {group.status === 'in_mission' ? 'Vazifada' : group.status === 'active' ? 'Faol' : 'Kutilmoqda'}
                     </div>
                     <div className="flex gap-2">
                        <button onClick={() => handleOpenModal(group)} className="p-2 rounded-xl text-slate-300 hover:text-blue-600 hover:bg-blue-50 transition"><Edit2 size={18} /></button>
                        <button onClick={() => handleDelete(group.id)} className="p-2 rounded-xl text-slate-300 hover:text-red-600 hover:bg-red-50 transition"><Trash2 size={18} /></button>
                     </div>
                  </div>

                  <div>
                     <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-tight mb-2 truncate">{group.name}</h3>
                     <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                        <Calendar size={14} /> {new Date(group.last_activity).toLocaleDateString('uz-UZ')}
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-white">
                        <div className="flex items-center gap-3">
                           <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-red-500">
                              <UserCheck size={18} />
                           </div>
                           <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Supervisor</div>
                        </div>
                        <span className="font-black text-slate-900 text-sm truncate max-w-[120px]">{group.supervisor}</span>
                     </div>

                     <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-white">
                        <div className="flex items-center gap-3">
                           <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-500 text-xs font-black">
                              {group.members_count}
                           </div>
                           <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Jamoa Soni</div>
                        </div>
                        <div className="flex -space-x-2">
                           {[1,2,3].map(i => <div key={i} className={`h-8 w-8 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black uppercase ${i===1 ? 'bg-indigo-100 text-indigo-600' : i===2 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>U{i}</div>)}
                        </div>
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
                <h2 className="text-2xl font-black text-slate-900">{editingGroup ? "Guruhni Tahrirlash" : "Yangi Guruh Qo'shishi"}</h2>
                <button onClick={() => setIsModalOpen(false)} className="rounded-full bg-slate-50 p-2 text-slate-400"><X size={24} /></button>
             </div>
             
             <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Guruh Nomi</label>
                   <input required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-red-500 shadow-sm" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Supervisor Ismi</label>
                   <input required value={formData.supervisor} onChange={e=>setFormData({...formData, supervisor: e.target.value})} className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-red-500 shadow-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Xodimlar Soni</label>
                      <input type="number" required value={formData.members_count} onChange={e=>setFormData({...formData, members_count: Number(e.target.value)})} className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-red-500 shadow-sm" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Status</label>
                      <select value={formData.status} onChange={e=>setFormData({...formData, status: e.target.value as any})} className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-red-500 shadow-sm appearance-none">
                         <option value="active">Faol</option>
                         <option value="in_mission">Vazifada</option>
                         <option value="standby">Kutilmoqda</option>
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
    </div>
  );
}
