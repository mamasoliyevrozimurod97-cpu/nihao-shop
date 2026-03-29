"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Edit3, Trash2, Check, X, MapPin, Search, Zap, Globe, Save } from "lucide-react";
import { fmt } from "@/lib/data";

const DEFAULT_REGIONS = [
  "Toshkent shahri", "Toshkent viloyati", "Samarqand viloyati", 
  "Farg'ona viloyati", "Andijon viloyati", "Namangan viloyati",
  "Buxoro viloyati", "Navoiy viloyati", "Qashqadaryo viloyati",
  "Surxondaryo viloyati", "Jizzax viloyati", "Sirdaryo viloyati",
  "Xorazm viloyati", "Qoraqalpog'iston Respublikasi"
];

export default function AdminDeliveryPage() {
  const [regions, setRegions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", price: 0 });
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    const { data } = await supabase.from('delivery_regions').select('*').order('name');
    if (data) setRegions(data);
    setLoading(false);
  };

  const seedRegions = async () => {
    setIsSeeding(true);
    try {
      const defaults = DEFAULT_REGIONS.map(name => ({
        name,
        price: name.includes('shahri') ? 25000 : 45000,
        is_active: true
      }));
      
      const { error } = await supabase.from('delivery_regions').insert(defaults);
      if (error) throw error;
      await fetchRegions();
    } catch (err) {
      console.error(err);
      alert("Xatolik: Jadval yaratilmagan bo'lishi mumkin.");
    } finally {
      setIsSeeding(false);
    }
  };

  const handleUpdate = async (id: string) => {
    await supabase.from('delivery_regions').update(editForm).eq('id', id);
    setEditingId(null);
    fetchRegions();
  };

  const filtered = regions.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="p-12 text-center animate-pulse text-2xl font-black text-gray-300">Yuklanmoqda...</div>;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 flex items-center gap-3">
             <Globe className="text-red-600" size={32} /> Yetkazib berish (14 Hudud)
          </h1>
          <p className="mt-2 text-lg font-medium text-gray-500">Viloyatlar va shaharlar uchun narxlarni tahrirlash</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
             <input 
               value={search}
               onChange={e => setSearch(e.target.value)}
               placeholder="Qidirish..." 
               className="h-14 w-64 rounded-2xl border-none bg-white pl-12 pr-4 font-bold shadow-sm ring-1 ring-gray-100 focus:ring-2 focus:ring-red-500 transition-all outline-none"
             />
           </div>
           
           <button 
              onClick={seedRegions}
              disabled={isSeeding}
              className="group flex h-14 items-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-red-800 px-8 font-black text-white shadow-xl shadow-red-100 transition hover:scale-105 active:scale-95"
            >
              <Zap size={20} className={isSeeding ? "animate-spin" : "group-hover:animate-bounce"} />
              {isSeeding ? "Bajarilmoqda..." : "🚀 14 Hududni Avto-to'ldirish"}
           </button>
        </div>
      </div>

      {regions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[3rem] border-4 border-dashed border-gray-100 p-20 text-center bg-white/50 backdrop-blur-sm">
           <div className="mb-6 rounded-3xl bg-red-50 p-6 text-red-600 ring-8 ring-red-50/50">
              <MapPin size={48} />
           </div>
           <h2 className="text-3xl font-black text-gray-900 mb-2">Ro'yxat hali bo'sh!</h2>
           <p className="max-w-md text-lg font-medium text-gray-500 mb-10">Tepada joylashgan "Avto-to'ldirish" tugmasini bosing va barcha 14 ta hudud namunaviy narxlar bilan paydo bo'ladi.</p>
           <button 
             onClick={seedRegions}
             className="flex items-center gap-3 rounded-2xl bg-gray-900 px-10 py-5 text-lg font-black text-white shadow-2xl transition hover:bg-red-600 hover:scale-105"
           >
             <Save size={24} /> Boshlash
           </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((r) => (
            <div key={r.id} className="group relative overflow-hidden rounded-[2.5rem] border border-gray-50 bg-white p-8 shadow-sm transition-all hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-2">
              
              {editingId === r.id ? (
                <div className="space-y-6">
                  <div>
                     <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block font-black">Viloyat/Shahar</label>
                     <input 
                      className="w-full rounded-2xl border-none bg-gray-50 p-4 font-black text-gray-900 ring-1 ring-gray-100 focus:ring-2 focus:ring-red-500 outline-none"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    />
                  </div>
                  <div>
                     <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block font-black">Yetkazib berish (so'm)</label>
                     <input 
                      type="number"
                      className="w-full rounded-2xl border-none bg-gray-50 p-4 font-black text-red-600 ring-1 ring-gray-100 focus:ring-2 focus:ring-red-500 outline-none"
                      value={editForm.price}
                      onChange={(e) => setEditForm({...editForm, price: Number(e.target.value)})}
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => handleUpdate(r.id)} className="flex-1 rounded-2xl bg-green-600 py-4 font-black text-white shadow-lg shadow-green-100 transition hover:bg-green-700">SAQLASH</button>
                    <button onClick={() => setEditingId(null)} className="flex-1 rounded-2xl bg-gray-100 py-4 font-black transition hover:bg-gray-200">BEKOR</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-gray-400 transition group-hover:bg-red-50 group-hover:text-red-600">
                      <MapPin size={22} />
                    </div>
                    <button 
                      onClick={() => { setEditingId(r.id); setEditForm({ name: r.name, price: Number(r.price) }); }}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 bg-white text-gray-400 transition hover:bg-gray-900 hover:text-white shadow-sm"
                    >
                      <Edit3 size={18} />
                    </button>
                  </div>
                  
                  <h3 className="text-xl font-black text-gray-900 group-hover:text-red-600 transition-colors">{r.name}</h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-gray-900">{fmt(r.price).split(' ')[0]}</span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{fmt(r.price).split(' ')[1] || 'so\'m'}</span>
                  </div>
                  
                  <div className="mt-8 flex items-center justify-between border-t border-gray-50 pt-6">
                     <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Holati: Faol</span>
                     </div>
                     <button 
                       onClick={async () => { if(confirm("O'chirish?")) { await supabase.from('delivery_regions').delete().eq('id', r.id); fetchRegions(); } }}
                       className="text-[10px] font-black uppercase tracking-widest text-red-200 hover:text-red-700 transition"
                     >
                       O'chirish
                     </button>
                  </div>
                </>
              )}
            </div>
          ))}
          
          {/* New Card Trigger */}
          <button 
            onClick={() => {
              const name = prompt("Yangi hudud nomi?");
              if(name) {
                supabase.from('delivery_regions').insert([{ name, price: 45000 }]).then(() => fetchRegions());
              }
            }}
            className="flex flex-col items-center justify-center rounded-[2.5rem] border-4 border-dashed border-gray-50 p-12 text-gray-300 transition-all hover:border-red-100 hover:text-red-200 hover:bg-red-50/20"
          >
            <Plus size={48} className="mb-4" />
            <span className="font-black uppercase tracking-widest text-sm text-center">Yangi Hudud<br/>Qo'shish</span>
          </button>
        </div>
      )}
    </div>
  );
}
