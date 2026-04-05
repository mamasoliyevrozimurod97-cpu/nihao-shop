"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Layers, Plus, Search, Filter, MoreVertical, ArrowUpDown, AlertCircle, Package, X, Edit2, Trash2 } from "lucide-react";
import { fmt } from "@/lib/data";

type Material = {
  id: string;
  name: string;
  unit: string;
  stock: number;
  min_stock: number;
  price_per_unit: number;
  category: string;
};

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    unit: 'kg',
    stock: 0,
    min_stock: 0,
    price_per_unit: 0,
    category: 'Xomashyo'
  });

  const fetchMaterials = async () => {
    const { data } = await supabase.from('materials').select('*').order('created_at', { ascending: false });
    if (data) {
      setMaterials(data);
      setFilteredMaterials(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMaterials();
    const sub = supabase.channel('materials').on('postgres_changes', { event: '*', schema: 'public', table: 'materials' }, fetchMaterials).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  useEffect(() => {
    const result = materials.filter(m => 
      m.name.toLowerCase().includes(search.toLowerCase()) || 
      m.category.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredMaterials(result);
  }, [search, materials]);

  const handleOpenModal = (material: Material | null = null) => {
    if (material) {
      setEditingMaterial(material);
      setFormData({ 
        name: material.name, 
        unit: material.unit, 
        stock: material.stock, 
        min_stock: material.min_stock, 
        price_per_unit: material.price_per_unit, 
        category: material.category 
      });
    } else {
      setEditingMaterial(null);
      setFormData({ name: '', unit: 'kg', stock: 0, min_stock: 0, price_per_unit: 0, category: 'Xomashyo' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (editingMaterial) {
      await supabase.from('materials').update(formData).eq('id', editingMaterial.id);
    } else {
      await supabase.from('materials').insert([formData]);
    }
    setIsModalOpen(false);
    fetchMaterials();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Ushbu materialni o'chirishni tasdiqlaysizmi?")) {
      await supabase.from('materials').delete().eq('id', id);
      fetchMaterials();
    }
  };

  if (loading && materials.length === 0) return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-red-600"></div>
      <p className="font-black text-slate-300 uppercase tracking-widest text-xs italic">Materiallar yuklanmoqda...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 flex items-center gap-4">
               <Layers size={32} className="text-red-600" /> Materiallar Ombori <span className="text-red-600/30">({filteredMaterials.length})</span>
            </h1>
            <p className="text-slate-400 font-bold flex items-center gap-2 uppercase text-[10px] tracking-widest">
               Xomashyo va butlovchi qismlar nazorati
            </p>
         </div>
         <div className="flex items-center gap-4">
            <div className="relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <input 
                  type="text" 
                  placeholder="Material nomi..." 
                  className="h-14 w-64 rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm font-bold focus:border-red-500 outline-none transition shadow-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
               />
            </div>
            <button 
               onClick={() => handleOpenModal()}
               className="flex items-center gap-3 rounded-2xl bg-red-600 px-8 py-4 text-sm font-black text-white shadow-xl shadow-red-100 hover:bg-red-700 transition active:scale-95"
            >
               <Plus size={20} /> Yangi Material
            </button>
         </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <StatCard title="Jami qiymat" value={fmt(materials.reduce((s, m) => s + (m.stock * m.price_per_unit), 0))} icon={<Package size={20} />} color="bg-blue-50 text-blue-600" />
         <StatCard title="Kam qolgan" value={materials.filter(m => m.stock <= m.min_stock).length.toString()} icon={<AlertCircle size={20} />} color="bg-red-50 text-red-600" />
         <StatCard title="Kategoriyalar" value={`${new Set(materials.map(m => m.category)).size} ta`} icon={<Filter size={20} />} color="bg-emerald-50 text-emerald-600" />
      </div>

      {/* Materials Table */}
      <div className="overflow-hidden rounded-[2.5rem] bg-white shadow-xl shadow-slate-200/40 border border-white">
         <table className="w-full border-collapse text-left">
            <thead>
               <tr className="border-b border-slate-50 bg-slate-50/50">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Material Nomi</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Kategoriya</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Mavjud</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Birligi</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Narxi</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Holat</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Amallar</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {filteredMaterials.map((m) => (
                  <tr key={m.id} className="group hover:bg-slate-50/50 transition-colors">
                     <td className="px-8 py-6">
                        <div className="font-black text-slate-800">{m.name}</div>
                        <div className="text-[10px] font-bold text-slate-400">ID: #{m.id.split('-')[0].toUpperCase()}</div>
                     </td>
                     <td className="px-8 py-6">
                        <span className="inline-block px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase">{m.category}</span>
                     </td>
                     <td className="px-8 py-6 font-black text-slate-700">{m.stock.toLocaleString()}</td>
                     <td className="px-8 py-6 font-bold text-slate-400 uppercase text-[10px]">{m.unit}</td>
                     <td className="px-8 py-6 font-black text-slate-900">{fmt(m.price_per_unit)}</td>
                     <td className="px-8 py-6">
                        {m.stock <= m.min_stock ? (
                           <span className="flex items-center gap-1 text-[10px] font-black text-red-600 uppercase tracking-tighter">
                              <AlertCircle size={12} /> Kam qolgan
                           </span>
                        ) : (
                           <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase tracking-tighter">
                              Yetarli
                           </span>
                        )}
                     </td>
                     <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <button onClick={() => handleOpenModal(m)} className="p-2 rounded-xl text-slate-300 hover:text-blue-600 hover:bg-blue-50 transition border border-transparent hover:border-blue-100"><Edit2 size={18} /></button>
                           <button onClick={() => handleDelete(m.id)} className="p-2 rounded-xl text-slate-300 hover:text-red-600 hover:bg-red-50 transition border border-transparent hover:border-red-100"><Trash2 size={18} /></button>
                        </div>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-lg rounded-[2.5rem] bg-white p-10 shadow-3xl animate-in zoom-in-95 duration-300">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-slate-900">{editingMaterial ? "Materialni Tahrirlash" : "Yangi Material Qo'shish"}</h2>
                <button onClick={() => setIsModalOpen(false)} className="rounded-full bg-slate-50 p-2 text-slate-400"><X size={24} /></button>
             </div>
             
             <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Material Nomi</label>
                   <input required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-red-500 shadow-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Kategoriya</label>
                      <select value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})} className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-red-500 shadow-sm appearance-none">
                         <option value="Xomashyo">Xomashyo</option>
                         <option value="Furnitura">Furnitura</option>
                         <option value="Yordamchi">Yordamchi</option>
                         <option value="Qadoq">Qadoq</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Birligi</label>
                      <input required value={formData.unit} onChange={e=>setFormData({...formData, unit: e.target.value})} placeholder="kg, dona, metr..." className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-red-500 shadow-sm" />
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Mavjud Miqdor</label>
                      <input type="number" required value={formData.stock} onChange={e=>setFormData({...formData, stock: Number(e.target.value)})} className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-red-500 shadow-sm" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Min. Miqdor (Alert)</label>
                      <input type="number" required value={formData.min_stock} onChange={e=>setFormData({...formData, min_stock: Number(e.target.value)})} className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-red-500 shadow-sm" />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Birlik Narxi (So'm)</label>
                   <input type="number" required value={formData.price_per_unit} onChange={e=>setFormData({...formData, price_per_unit: Number(e.target.value)})} className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-red-500 shadow-sm" />
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

function StatCard({ title, value, icon, color }: any) {
   return (
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-white flex items-center justify-between group transition-all hover:-translate-y-1">
         <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{title}</p>
            <p className="text-2xl font-black text-slate-900 tracking-tighter">{value}</p>
         </div>
         <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 ${color}`}>
            {icon}
         </div>
      </div>
   );
}
