"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ShoppingBag, TrendingUp, Users, DollarSign, Package, MapPin, ArrowUpRight, Clock, Download, Database, Loader2 } from "lucide-react";
import { fmt } from "@/lib/data";
import { seedProductsData } from "@/lib/seedData";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    orderCount: 0,
    activeOrders: 0,
    totalProfit: 0,
    totalUsers: 0, 
    topProducts: [] as any[],
    dailyStats: [] as { day: string, total: number }[],
    regionalStats: [] as { region: string, count: number, total: number }[]
  });
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  const fetchStats = async () => {
    const { data: orders, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    
    if (error || !orders || orders.length === 0) {
      setLoading(false);
      return;
    }

    let revenue = 0;
    let cost = 0;
    let active = 0;
    const productCounts: Record<string, { name: string, qty: number, total: number, img: string }> = {};
    const daily: Record<string, number> = {};
    const regional: Record<string, { count: number, total: number }> = {};

    orders.forEach(o => {
      const isCompleted = ['processing', 'completed', 'delivered'].includes(o.status);
      if (['pending', 'verifying', 'processing'].includes(o.status)) active++;

      o.items?.forEach((item: any) => {
        if (isCompleted) {
          revenue += (item.price || 0) * item.qty;
          cost += (item.costPrice || (item.price * 0.8) || 0) * item.qty;
        }
        const key = item.id;
        if (!productCounts[key]) productCounts[key] = { name: item.nameUz || item.name, qty: 0, total: 0, img: item.image };
        productCounts[key].qty += item.qty;
        productCounts[key].total += (item.price || 0) * item.qty;
      });

      const day = new Date(o.created_at).toLocaleDateString('uz-UZ', { weekday: 'short' });
      daily[day] = (daily[day] || 0) + Number(o.total || 0);

      const region = o.region || "Noma'lum";
      if (!regional[region]) regional[region] = { count: 0, total: 0 };
      regional[region].count++;
      regional[region].total += Number(o.total || 0);
    });

    setStats({
      totalSales: revenue,
      totalProfit: revenue - cost,
      orderCount: orders.length,
      activeOrders: active,
      totalUsers: 0,
      topProducts: Object.values(productCounts).sort((a,b) => b.qty - a.qty).slice(0, 5),
      dailyStats: Object.entries(daily).map(([day, total]) => ({ day, total })).slice(-7),
      regionalStats: Object.entries(regional).map(([region, data]) => ({ region, ...data })).sort((a,b) => b.total - a.total).slice(0,5)
    });
    setLoading(false);
  };

  const exportCSV = async () => {
    const { data: o } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (!o) return;
    const headers = ["Order ID", "Date", "Customer", "Phone", "Amount", "Status", "Region"];
    const rows = o.map((x: any) => [x.id, new Date(x.created_at).toLocaleString(), x.name, x.phone, x.total, x.status, x.region]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `nihao-shop-report-${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSeed = async () => {
    if (!confirm("Diqqat! Bu amal bazaga 27 ta yangi mahsulot qo'shadi. Davom etasizmi?")) return;
    setIsSeeding(true);
    try {
      for (const item of seedProductsData) {
        const { variants, ...p } = item;
        const productToInsert = {
          ...p,
          name_ru: p.name_uz,
          name_zh: p.name_uz,
          name_en: p.name_uz,
          description: `Ushbu ${p.name_uz} mahsuloti yuqori sifatli va zamonaviy dizaynga ega. Nihao shopda eng ko'p sotilgan mahsulotlardan biri.`,
          stock: 50,
          cost_price: p.price * 0.8,
          discount_percent: p.old_price ? Math.round(((p.old_price! - p.price) / p.old_price!) * 100) : 0
        };
        const { data: newProd, error } = await supabase.from('products').insert([productToInsert]).select().single();
        if (newProd && variants && variants.length > 0) {
          const variantsToInsert = variants.map(v => ({
            product_id: newProd.id,
            name: v.name,
            image_url: (v as any).image_url || null,
            stock: 20
          }));
          await supabase.from('product_variants').insert(variantsToInsert);
        }
      }
      alert("Baza muvaffaqiyatli to'ldirildi!");
      // Refresh stats if needed
      fetchStats();
    } catch (err) {
      console.error(err);
      alert("Xatolik yuz berdi.");
    } finally {
      setIsSeeding(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const sub = supabase.channel('admin_stats').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchStats).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  if (loading) return <div className="flex h-[60vh] items-center justify-center font-black animate-pulse text-slate-300">Statistika yuklanmoqda...</div>;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Header */}
      <div className="flex items-end justify-between">
         <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Salom, Admin <span className="animate-bounce inline-block">👋</span></h1>
            <p className="text-slate-400 font-bold flex items-center gap-2 uppercase text-[10px] tracking-widest"><Clock size={12} /> Oxirgi yangilanish: {new Date().toLocaleTimeString()}</p>
         </div>
         <div className="flex gap-4">
            <button 
             onClick={handleSeed} 
             disabled={isSeeding}
             className="flex items-center gap-2 rounded-2xl bg-amber-500 px-6 py-3 text-sm font-black text-white shadow-xl shadow-amber-100 transition hover:bg-amber-600 active:scale-95 disabled:opacity-50"
           >
             {isSeeding ? <Loader2 className="animate-spin" size={20} /> : <Database size={20} />}
             <span>Bazani to'ldirish</span>
           </button>
            <button 
               onClick={exportCSV} 
               className="flex items-center gap-2 rounded-2xl bg-white border border-slate-100 px-6 py-3 text-xs font-black text-slate-600 shadow-sm hover:shadow-md transition active:scale-95"
            >
               <Download size={18} className="text-red-600" /> Hisobot (CSV)
            </button>
            <button onClick={fetchStats} className="rounded-2xl bg-slate-900 px-6 py-3 text-xs font-black text-white shadow-xl hover:bg-slate-800 transition active:scale-95">Yangilash</button>
         </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard href="/admin/orders" title="Haftalik Savdo" value={fmt(stats.totalSales)} trend="+14.2%" icon={<DollarSign size={24} />} color="from-emerald-500 to-teal-600" />
        <MetricCard href="/admin/orders" title="Jami Foyda" value={fmt(stats.totalProfit)} trend="+8.4%" icon={<TrendingUp size={24} />} color="from-blue-500 to-indigo-600" />
        <MetricCard href="/admin/orders" title="Buyurtmalar" value={stats.orderCount.toString()} trend="+21" icon={<ShoppingBag size={24} />} color="from-orange-500 to-red-600" />
        <MetricCard href="/admin/customers" title="Faol Mijozlar" value="1,204" trend="+3.1%" icon={<Users size={24} />} color="from-fuchsia-500 to-purple-600" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
         {/* Main Chart */}
         <div className="lg:col-span-2 rounded-[2.5rem] bg-white p-10 shadow-2xl shadow-slate-200/50 border border-white relative overflow-hidden">
            <div className="flex items-center justify-between mb-10">
               <div>
                  <h3 className="text-xl font-black text-slate-800">Savdo Dinamikasi</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Haftalik hisobot</p>
               </div>
               <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-1 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                  <ArrowUpRight size={14} /> +12% O'sish
               </div>
            </div>
            
            {/* Custom SVG Area Chart */}
            <div className="relative h-64 w-full">
               <svg viewBox="0 0 700 200" className="h-full w-full overflow-visible">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path 
                    d="M0,150 C50,140 100,100 150,110 C200,120 250,60 300,70 C350,80 400,20 450,40 C500,60 550,50 600,30 C650,10 700,50 700,50 L700,200 L0,200 Z" 
                    fill="url(#chartGradient)" 
                  />
                  <path 
                    d="M0,150 C50,140 100,100 150,110 C200,120 250,60 300,70 C350,80 400,20 450,40 C500,60 550,50 600,30 C650,10 700,50 700,50" 
                    fill="none" 
                    stroke="#ef4444" 
                    strokeWidth="4" 
                    strokeLinecap="round" 
                  />
               </svg>
               <div className="absolute inset-0 flex items-end justify-between px-4 pt-10">
                  {stats.dailyStats.map((d, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                       <div className="h-12 w-1.5 rounded-full bg-slate-50 relative overflow-hidden group">
                          <div className="absolute bottom-0 left-0 w-full bg-red-500 rounded-full transition-all group-hover:bg-red-600" style={{ height: '60%' }}></div>
                       </div>
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{d.day}</span>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Sidebar Stats within Dashboard */}
         <div className="space-y-8">
            {/* Top Products */}
            <div className="rounded-[2.5rem] bg-white p-8 shadow-xl shadow-slate-200/40 border border-white">
                <h3 className="mb-6 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-800"><Package size={16} /> Eng ko'p sotilgan</h3>
                <div className="space-y-4">
                  {stats.topProducts.map((p, i) => (
                    <div key={i} className="flex items-center gap-4">
                       <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-black">#{i+1}</div>
                       <div className="flex-1">
                          <p className="text-sm font-black text-slate-800 truncate">{p.name}</p>
                          <p className="text-[10px] font-bold text-slate-400">{p.qty} ta sotilgan</p>
                       </div>
                       <p className="text-sm font-black text-slate-900">{fmt(p.total).split(' ')[0]}</p>
                    </div>
                  ))}
                </div>
            </div>

            {/* Regional Sales */}
            <div className="rounded-[2.5rem] bg-gradient-to-br from-indigo-900 to-slate-900 p-8 shadow-xl text-white">
                <h3 className="mb-6 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-indigo-300"><MapPin size={16} /> Viloyatlar bo'yicha</h3>
                <div className="space-y-3">
                  {stats.regionalStats.map((r, i) => (
                    <div key={i} className="flex items-center justify-between">
                       <span className="text-xs font-bold text-slate-300">{r.region}</span>
                       <div className="flex items-center gap-3">
                          <div className="h-1 w-20 rounded-full bg-white/10 overflow-hidden">
                             <div className="h-full bg-indigo-400" style={{ width: `${(r.total/stats.totalSales)*100}%` }}></div>
                          </div>
                          <span className="text-xs font-black">{Math.round((r.total/stats.totalSales)*100)}%</span>
                       </div>
                    </div>
                  ))}
                </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, trend, icon, color, href }: { title: string, value: string, trend: string, icon: any, color: string, href: string }) {
  return (
    <Link href={href} className="group relative block overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-xl shadow-slate-200/40 border border-white transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-95">
       <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br ${color} opacity-5 transition-transform group-hover:scale-150`} />
       <div className="mb-6 flex items-center justify-between">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg`}>
             {icon}
          </div>
          <div className="flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-1 font-black text-emerald-600 text-[10px]">
             <ArrowUpRight size={12} /> {trend}
          </div>
       </div>
       <div>
          <p className="mb-1 text-xs font-black uppercase tracking-[0.2em] text-slate-400">{title}</p>
          <p className="text-2xl font-black text-slate-800 tracking-tight">{value}</p>
       </div>
    </Link>
  );
}
