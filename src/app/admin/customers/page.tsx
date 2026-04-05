"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User, ShoppingBag, DollarSign, Search, Phone, MessageSquare, Send, Award, Clock } from "lucide-react";
import { fmt } from "@/lib/data";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // 1. Fetch Profiles
    const { data: profiles } = await supabase.from('profiles').select('*');
    // 2. Fetch Orders to calculate LTV and Risk
    const { data: orders } = await supabase.from('orders').select('phone, total, status, receipt_attempts');

    if (profiles) {
      const merged = profiles.map(p => {
        const userOrders = orders?.filter(o => o.phone === p.phone) || [];
        const completedOrders = userOrders.filter(o => o.status === 'completed');
        const rejectedOrders = userOrders.filter(o => o.status === 'rejected' || o.status === 'cancelled');
        const ltv = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        
        return {
          ...p,
          name: p.full_name, // Map full_name to name
          orderCount: userOrders.length,
          completedCount: completedOrders.length,
          rejectedCount: rejectedOrders.length,
          ltv: ltv,
          isVIP: ltv > 1000000 
        };
      });

      // Sort by spending
      merged.sort((a, b) => b.ltv - a.ltv);
      setCustomers(merged);
      setFiltered(merged);
    }
    setLoading(false);
  };

  const toggleBlock = async (id: string, currentStatus: boolean) => {
    if (!confirm(currentStatus ? "Mijozni blokdan chiqarmoqchimisiz?" : "HAQIQATDAN HAM USHBU MIJOZNI BLOKLAMOQCHIMISIZ?")) return;
    const { error } = await supabase.from('profiles').update({ is_blocked: !currentStatus }).eq('id', id);
    if (!error) fetchData();
  };

  useEffect(() => {
    const res = customers.filter(c => 
      c.name?.toLowerCase().includes(search.toLowerCase()) || 
      c.phone?.includes(search)
    );
    setFiltered(res);
  }, [search, customers]);

  if (loading) return <div className="flex h-[60vh] items-center justify-center animate-pulse font-black text-slate-300 uppercase tracking-tighter">Mijozlar bazasi yuklanmoqda...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mijozlar CRM <span className="text-red-600">({filtered.length})</span></h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Sizning sodiq mijozlaringiz</p>
        </div>
        <div className="relative">
           <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
           <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Mijoz ismi yoki tel..." className="h-12 w-80 rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm font-bold outline-none focus:border-red-500 shadow-sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {filtered.map((c) => (
           <div key={c.id} className="group relative overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-1 transition border border-white">
              {c.isVIP && (
                <div className="absolute top-0 right-0 rounded-bl-[1.5rem] bg-orange-50 px-4 py-1.5 text-[9px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-1.5 border-l border-b border-orange-100">
                   <Award size={10} /> VIP Mijoz
                </div>
              )}
              
              <div className="flex items-center gap-5 mb-8 mt-2">
                 <div className={`h-16 w-16 rounded-3xl flex items-center justify-center text-2xl font-black shadow-inner border-4 border-white ${c.is_blocked ? 'bg-red-50 text-red-500' : c.isVIP ? 'bg-orange-50 text-orange-500' : 'bg-slate-50 text-slate-300'}`}>
                    {c.is_blocked ? "🚫" : (c.name?.[0]?.toUpperCase() || <User size={24} />)}
                 </div>
                 <div>
                    <h3 className={`text-lg font-black leading-tight ${c.is_blocked ? 'text-red-600' : 'text-slate-900'}`}>{c.name || 'Noma\'lum'}</h3>
                    <p className="font-bold text-slate-400 text-sm">{c.phone}</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                 <div className="rounded-3xl bg-slate-50 p-4 border border-slate-100/50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Buyurtmalar</p>
                    <div className="flex items-center gap-2">
                       <ShoppingBag size={14} className="text-red-500" />
                       <span className="font-black text-slate-800">{c.orderCount}</span>
                       <span className="text-[10px] font-bold text-slate-400">({c.rejectedCount} xato)</span>
                    </div>
                 </div>
                 <div className="rounded-3xl bg-slate-50 p-4 border border-slate-100/50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Xarid Summasi</p>
                    <div className="flex items-center gap-1.5">
                       <DollarSign size={14} className="text-emerald-500" />
                       <span className="font-black text-slate-800">{fmt(c.ltv)}</span>
                    </div>
                 </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                 <button 
                   onClick={() => toggleBlock(c.id, c.is_blocked)}
                   className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[10px] font-black uppercase transition-all active:scale-95 ${c.is_blocked ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                 >
                   {c.is_blocked ? "Blokdan chiqarish" : "Bloklash"}
                 </button>
                 <div className="flex gap-2">
                    <a href={`https://t.me/${c.phone}`} target="_blank" className="p-2.5 rounded-xl bg-sky-50 text-sky-500 hover:bg-sky-100 transition border border-sky-100"><Send size={14} /></a>
                    <a href={`https://wa.me/${c.phone}`} target="_blank" className="p-2.5 rounded-xl bg-emerald-50 text-emerald-500 hover:bg-emerald-100 transition border border-emerald-100"><MessageSquare size={14} /></a>
                 </div>
              </div>
           </div>
         ))}

         {filtered.length === 0 && (
           <div className="col-span-full flex flex-col items-center justify-center p-20 text-slate-300 font-bold opacity-30 italic">
              Mijoz topilmadi
           </div>
         )}
      </div>
    </div>
  );
}
