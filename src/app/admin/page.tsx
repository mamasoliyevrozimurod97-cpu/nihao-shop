"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ShoppingBag, TrendingUp, Users, DollarSign, Package, MapPin } from "lucide-react";
import { fmt } from "@/lib/data";

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

  const fetchStats = async () => {
    const { data: orders } = await supabase.from('orders').select('*');
    if (!orders) return;

    let revenue = 0;
    let cost = 0;
    let active = 0;
    const productCounts: Record<string, { name: string, qty: number, total: number }> = {};
    const daily: Record<string, number> = {};
    const regional: Record<string, { count: number, total: number }> = {};

    orders.forEach(o => {
      const isCompleted = o.status === 'processing' || o.status === 'completed' || o.status === 'delivered';
      
      if (o.status === 'pending' || o.status === 'verifying' || o.status === 'processing') {
        active++;
      }

      // Track products and finances
      o.items?.forEach((item: any) => {
        if (isCompleted) {
          revenue += (item.price || 0) * item.qty;
          cost += (item.costPrice || (item.price * 0.8) || 0) * item.qty;
        }
        
        const key = item.id;
        if (!productCounts[key]) {
          productCounts[key] = { name: item.nameUz || item.name, qty: 0, total: 0 };
        }
        productCounts[key].qty += item.qty;
        productCounts[key].total += (item.price || 0) * item.qty;
      });

      // Track daily and regional
      const day = new Date(o.created_at).toLocaleDateString();
      daily[day] = (daily[day] || 0) + Number(o.total || 0);

      const region = o.region || "Noma'lum";
      if (!regional[region]) regional[region] = { count: 0, total: 0 };
      regional[region].count++;
      regional[region].total += Number(o.total || 0);
    });

    const top = Object.values(productCounts)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    setStats({
      totalSales: revenue,
      totalProfit: revenue - cost,
      orderCount: orders.length,
      activeOrders: active,
      totalUsers: 0, // Profile count can be added if needed
      topProducts: top,
      dailyStats: Object.entries(daily).map(([day, total]) => ({ day, total })).slice(-7), // Last 7 days
      regionalStats: Object.entries(regional).map(([region, data]) => ({ region, ...data })).sort((a,b) => b.total - a.total)
    });
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
    const sub = supabase.channel('dashboard_stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchStats)
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  if (loading) return <div className="p-8 text-center animate-pulse">Statistika yuklanmoqda...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-gray-900">Dashboard Statistika</h1>
        <div className="text-sm font-medium text-gray-500">Oxirgi yangilanish: {new Date().toLocaleTimeString()}</div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Umumiy Savdo" value={fmt(stats.totalSales)} icon={<DollarSign className="text-green-600" />} color="bg-green-50" />
        <StatCard title="Jami Foida" value={fmt(stats.totalProfit)} icon={<TrendingUp className="text-cyan-600" />} color="bg-cyan-50" />
        <StatCard title="Jami Buyurtmalar" value={stats.orderCount.toString()} icon={<ShoppingBag className="text-blue-600" />} color="bg-blue-50" />
        <StatCard title="Faol Buyurtmalar" value={stats.activeOrders.toString()} icon={<TrendingUp className="text-orange-600" />} color="bg-orange-50" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Top Products */}
        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-black">
            <Package className="text-red-600" /> Eng ko'p sotilganlar
          </h2>
          <div className="space-y-4">
            {stats.topProducts.map((p, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-xs font-black text-red-600">#{i+1}</div>
                  <div>
                    <div className="font-bold text-gray-900">{p.name}</div>
                    <div className="text-xs text-gray-500">{p.qty} ta sotilgan</div>
                  </div>
                </div>
                <div className="font-black text-gray-900">{fmt(p.total)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Performance */}
        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-black">
            <MapPin className="text-blue-600" /> Viloyatlar bo'yicha savdo
          </h2>
          <div className="space-y-4">
            {stats.regionalStats.map((r, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
                <div className="font-bold text-gray-900">{r.region}</div>
                <div className="flex gap-4 text-sm font-bold">
                  <span className="text-gray-400">{r.count} ta buyurtma</span>
                  <span className="text-blue-600">{fmt(r.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Chart */}
      <div className="rounded-[2.5rem] border border-gray-100 bg-white p-10 shadow-xl">
         <h2 className="mb-8 text-2xl font-black text-gray-900">Do'kon Hisoboti (Oxirgi 7 kun)</h2>
         <div className="flex h-64 items-end gap-4 overflow-x-auto pb-4">
           {stats.dailyStats.map((d, i) => {
             const max = Math.max(...stats.dailyStats.map(s => s.total)) || 1;
             const height = (d.total / max) * 100;
             return (
               <div key={i} className="group relative flex-1 flex flex-col items-center min-w-[50px]">
                 <div className="absolute -top-10 scale-0 rounded-lg bg-gray-900 px-2 py-1 text-[10px] font-bold text-white transition group-hover:scale-100">
                    {fmt(d.total)}
                 </div>
                 <div 
                   className="w-full rounded-t-xl bg-gradient-to-t from-red-600 to-red-500 transition-all hover:from-red-500 hover:to-red-400" 
                   style={{ height: `${Math.max(height, 5)}%` }}
                 />
                 <div className="mt-4 text-[10px] font-black uppercase text-gray-400 rotate-45 sm:rotate-0 whitespace-nowrap">{d.day.split(',')[0]}</div>
               </div>
             );
           })}
         </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: string, icon: any, color: string }) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="mb-4 flex items-center gap-4">
        <div className={`p-3 rounded-2xl ${color}`}>{icon}</div>
        <div className="text-sm font-bold text-gray-400">{title}</div>
      </div>
      <div className="text-2xl font-black text-gray-900">{value}</div>
    </div>
  );
}
