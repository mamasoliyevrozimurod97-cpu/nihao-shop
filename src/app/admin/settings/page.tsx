"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Save, Shield, Truck, CreditCard, Smartphone, CheckCircle2, Loader2, Sparkles, MapPin, Navigation } from "lucide-react";

export default function AdminSettingsPage() {
  const [config, setConfig] = useState({
    nearbyPrice: 20000,
    farPrice: 40000,
    freeThreshold: 1000000,
    store_name: "NIHAO PRO",
    telegram_bot_token: "",
    is_maintenance: false,
    store_address: "",
    store_maps_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    const { data } = await supabase.from('store_settings').select('*').eq('key', 'delivery_config').single();
    if (data && data.value) {
      setConfig(prev => ({ ...prev, ...data.value }));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from('store_settings').upsert({
      key: 'delivery_config',
      value: config
    });

    if (!error) {
      alert("Sozlamalar muvaffaqiyatli saqlandi!");
    } else {
      alert("Xatolik: Jadval mavjudligini tekshiring.");
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
      <Loader2 size={40} className="animate-spin text-red-600" />
      <p className="text-xs font-black uppercase tracking-widest text-slate-300 italic">Tizim sozlamalari yuklanmoqda...</p>
    </div>
  );

  return (
    <div className="max-w-5xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
               <Shield size={32} className="text-red-600" /> Tizim Sozlamalari
            </h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">
               Do'kon parametrlari va integratsiyalarni boshqarish
            </p>
         </div>
         <button 
           disabled={saving}
           onClick={handleSave} 
           className="flex items-center gap-3 rounded-2xl bg-red-600 px-10 py-5 text-sm font-black text-white shadow-2xl shadow-red-100 hover:bg-red-700 transition active:scale-95 uppercase tracking-widest disabled:opacity-50"
         >
            {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            {saving ? 'Saqlanmoqda...' : 'O'+"'"+'zgarishlarni Saqlash'}
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         {/* Left Column - General & Delivery */}
         <div className="lg:col-span-2 space-y-10">
            {/* Delivery Section */}
            <section className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50 border border-white relative overflow-hidden group">
               <div className="absolute right-0 top-0 h-40 w-40 bg-red-50/30 rounded-bl-[5rem] -z-0 transition-transform group-hover:scale-110 duration-700" />
               
               <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-4">
                     <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 shadow-inner">
                        <Truck size={24} />
                     </div>
                     <h2 className="text-xl font-black text-slate-800 tracking-tight italic uppercase">Yetkazib Berish Narxlari</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4 italic">Asosiy shahar (Toshkent)</label>
                        <div className="relative">
                           <input 
                              type="number" 
                              value={config.nearbyPrice} 
                              onChange={e => setConfig({...config, nearbyPrice: Number(e.target.value)})}
                              className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 p-5 font-black text-slate-900 outline-none focus:border-red-500 focus:bg-white transition shadow-inner" 
                           />
                           <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">UZS</span>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4 italic">Viloyatlar va uzoq hududlar</label>
                        <div className="relative">
                           <input 
                              type="number" 
                              value={config.farPrice} 
                              onChange={e => setConfig({...config, farPrice: Number(e.target.value)})}
                              className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 p-5 font-black text-slate-900 outline-none focus:border-red-500 focus:bg-white transition shadow-inner" 
                           />
                           <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">UZS</span>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4 italic">Bepul yetkazib berish (Chegara)</label>
                     <div className="relative">
                        <input 
                           type="number" 
                           value={config.freeThreshold} 
                           onChange={e => setConfig({...config, freeThreshold: Number(e.target.value)})}
                           className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 p-5 font-black text-red-600 outline-none focus:border-red-500 focus:bg-white transition shadow-inner" 
                        />
                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase italic">Bepul chegara</span>
                     </div>
                     <p className="px-4 text-[9px] font-bold text-slate-300 uppercase tracking-widest italic">Ushbu summadan yuqori xaridlar uchun yetkazib berish 0 so'm bo'ladi.</p>
                  </div>
               </div>
            </section>

            {/* Location Section */}
            <section className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50 border border-white relative overflow-hidden group">
               <div className="absolute right-0 top-0 h-40 w-40 bg-emerald-50/30 rounded-bl-[5rem] -z-0 transition-transform group-hover:scale-110 duration-700" />
               <div className="relative z-10 space-y-6">
                 <div className="flex items-center gap-4">
                   <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner">
                     <MapPin size={24} />
                   </div>
                   <h2 className="text-xl font-black text-slate-800 tracking-tight italic uppercase">Do'kon Lokatsiyasi</h2>
                 </div>

                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4 italic">Do'kon Manzili</label>
                   <input
                     type="text"
                     placeholder="Toshkent sh., Chilonzor t., Bunyodkor ko'chasi, 12-uy"
                     value={config.store_address}
                     onChange={e => setConfig({...config, store_address: e.target.value})}
                     className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 p-5 font-bold text-slate-900 outline-none focus:border-emerald-500 focus:bg-white transition shadow-inner"
                   />
                 </div>

                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4 italic">Google Maps Havolasi</label>
                   <input
                     type="url"
                     placeholder="https://maps.google.com/?q=..."
                     value={config.store_maps_url}
                     onChange={e => setConfig({...config, store_maps_url: e.target.value})}
                     className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 p-5 font-bold text-slate-900 outline-none focus:border-emerald-500 focus:bg-white transition shadow-inner"
                   />
                   {config.store_maps_url && (
                     <a href={config.store_maps_url} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-2 mt-2 ml-4 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:underline">
                       <Navigation size={12} /> Xaritada ko'rish
                     </a>
                   )}
                 </div>
               </div>
             </section>

            {/* Integrations Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-white">
                  <div className="flex items-center gap-4 mb-6">
                     <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
                        <Smartphone size={20} />
                     </div>
                     <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Telegram Bot</h3>
                  </div>
                  <input 
                     type="password"
                     placeholder="Bot Token (HTTP API)"
                     value={config.telegram_bot_token}
                     onChange={e => setConfig({...config, telegram_bot_token: e.target.value})}
                     className="w-full rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs font-bold outline-none focus:border-blue-500 transition"
                  />
               </div>
               <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-white">
                  <div className="flex items-center gap-4 mb-6">
                     <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shadow-inner">
                        <CreditCard size={20} />
                     </div>
                     <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">To'lov Tizimi</h3>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 italic">
                     <span className="text-[10px] font-black text-slate-400 pl-2 uppercase">Payme / Click</span>
                     <span className="px-3 py-1 bg-white rounded-lg text-[8px] font-black text-orange-400 border uppercase tracking-widest">Tez orada</span>
                  </div>
               </div>
            </section>
         </div>

         {/* Right Column - Status & Info */}
         <div className="space-y-8">
            <div className="bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden">
               <div className="absolute -right-4 -bottom-4 h-32 w-32 bg-white/5 rounded-full" />
               <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-3">
                     <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                     <h3 className="text-xs font-black uppercase tracking-widest text-emerald-500 italic">Tizim Onlayn</h3>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Loyiha Nomi</p>
                    <input 
                       value={config.store_name}
                       onChange={e => setConfig({...config, store_name: e.target.value})}
                       className="bg-transparent border-none text-2xl font-black focus:ring-0 p-0 w-full italic"
                    />
                  </div>
                  <div className="pt-4 border-t border-white/10 space-y-4">
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Texnik tanaffus</span>
                        <button 
                           onClick={() => setConfig({...config, is_maintenance: !config.is_maintenance})}
                           className={`h-6 w-12 rounded-full transition-colors relative ${config.is_maintenance ? 'bg-red-500' : 'bg-white/10'}`}
                        >
                           <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${config.is_maintenance ? 'left-7' : 'left-1'}`} />
                        </button>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 border border-white">
               <div className="flex items-center gap-4 mb-6">
                  <Sparkles className="text-yellow-500" size={20} />
                  <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Tizim Ma'lumotlari</h3>
               </div>
               <div className="space-y-4">
                  <InfoRow label="Loyiha Versiyasi" value="v1.4.2" />
                  <InfoRow label="Build Sanasi" value={new Date().toLocaleDateString('uz-UZ')} />
                  <InfoRow label="Xavfsizlik" value="SSL / AES-256" />
                  <div className="pt-4 mt-4 border-t border-slate-50 flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                     <CheckCircle2 size={14} /> Barcha tizimlar soz
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">{label}</span>
      <span className="text-xs font-black text-slate-700">{value}</span>
    </div>
  );
}
