"use client";
import { useState, useEffect } from "react";
import { Megaphone, Send, History, Users, Sparkles, TrendingUp, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminMarketingPage() {
  const [msg, setMsg] = useState("");
  const [title, setTitle] = useState("");
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    const { data } = await supabase.from('marketing_logs').select('*').order('created_at', { ascending: false });
    if (data) setHistory(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    
    // In a real app, this would trigger FCM/Telegram
    // Here we log to Supabase
    const { error } = await supabase.from('marketing_logs').insert([{
      title,
      message: msg,
      reach: Math.floor(Math.random() * 500) + 100 // Simulated reach
    }]);

    if (!error) {
      setTitle("");
      setMsg("");
      fetchHistory();
      alert("Xabar muvaffaqiyatli yuborildi va tarixga saqlandi!");
    } else {
      alert("Xato yuz berdi: Jadval mavjudligini tekshiring.");
    }
    setSending(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Ushbu logni o'chirish?")) {
      await supabase.from('marketing_logs').delete().eq('id', id);
      fetchHistory();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
         <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Marketing <span className="text-red-600">& Push</span></h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Mijozlarni jalb qilish va xabarlar yuborish</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         {/* Push Notification Composer */}
         <div className="rounded-[3rem] bg-white p-10 shadow-2xl shadow-slate-200/50 border border-white">
            <div className="flex items-center gap-3 mb-8">
               <div className="p-3 rounded-2xl bg-red-50 text-red-600"><Megaphone size={24} /></div>
               <h2 className="text-xl font-black text-slate-800 tracking-tight">Yangi Bildirishnoma</h2>
            </div>

            <form onSubmit={handleSend} className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Sarlavha (Title)</label>
                  <input required value={title} onChange={e=>setTitle(e.target.value)} placeholder="Masalan: 🏷️ Bayram Chegirmalari!" className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-black outline-none focus:border-red-500 focus:bg-white transition shadow-sm" />
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Xabar matni (Message)</label>
                  <textarea required rows={4} value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Mijozlaringizga aytmoqchi bo'lgan gaplaringiz..." className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-black outline-none focus:border-red-500 focus:bg-white transition shadow-sm resize-none" />
               </div>

               <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600">
                  <Users size={20} />
                  <p className="text-xs font-black uppercase tracking-widest">Ayni paytda: 142 ta faol qurilma</p>
               </div>

               <button disabled={sending} className="w-full rounded-[1.5rem] bg-red-600 py-5 text-sm font-black text-white shadow-xl shadow-red-100 hover:bg-red-700 transition flex items-center justify-center gap-2 uppercase tracking-widest active:scale-95">
                  {sending ? 'Yuborilmoqda...' : <><Send size={18} /> Bildirishnomani yuborish</>}
               </button>
            </form>
         </div>

         {/* Stats & History */}
         <div className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
               <div className="rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-xl flex flex-col justify-between h-40">
                  <TrendingUp className="text-red-500" />
                  <div>
                    <div className="text-3xl font-black italic">2.4k</div>
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Umumiy ko'rishlar</div>
                  </div>
               </div>
               <div className="rounded-[2.5rem] bg-white p-8 shadow-xl border border-white flex flex-col justify-between h-40">
                  <Sparkles className="text-orange-500" />
                  <div>
                    <div className="text-3xl font-black text-slate-900">8.2%</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Konversiya (CTR)</div>
                  </div>
               </div>
            </div>

            <div className="rounded-[2.5rem] bg-white p-8 shadow-2xl shadow-slate-200/40 border border-white max-h-[400px] overflow-y-auto custom-scrollbar">
               <div className="flex items-center gap-3 mb-6 sticky top-0 bg-white pb-4 z-10">
                  <History size={20} className="text-slate-400" />
                  <h3 className="font-black text-slate-800 uppercase text-xs tracking-[0.2em]">Yuborilganlar Tarixi</h3>
               </div>
               
               <div className="space-y-4">
                  {loading ? (
                    <div className="py-10 text-center animate-pulse text-xs font-black text-slate-300 italic uppercase">Yuklanmoqda...</div>
                  ) : history.length > 0 ? history.map(h => (
                    <div key={h.id} className="group p-5 rounded-3xl bg-slate-50 border border-slate-100 flex justify-between items-start transition hover:bg-white hover:shadow-lg">
                       <div className="space-y-1 pr-4">
                          <div className="font-black text-slate-900 text-sm tracking-tight">{h.title}</div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed line-clamp-2">{h.message}</div>
                          <div className="text-[8px] font-black text-red-400 mt-2">{new Date(h.created_at).toLocaleString('uz-UZ')}</div>
                       </div>
                       <div className="flex flex-col items-end gap-2">
                          <div className="px-2 py-1 bg-white rounded-lg border text-[8px] font-black text-slate-500 shadow-sm whitespace-nowrap">REACH: {h.reach}</div>
                          <button onClick={() => handleDelete(h.id)} className="p-1 px-2 text-slate-300 hover:text-red-600 transition opacity-0 group-hover:opacity-100"><X size={14} /></button>
                       </div>
                    </div>
                  )) : (
                    <div className="py-10 text-center italic text-slate-300 font-bold opacity-30">Tarix bo'sh</div>
                  )}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
