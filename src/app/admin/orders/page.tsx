"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Eye, X, Search, MessageSquare, Send, Clock, Check, MapPin, Receipt, CreditCard, ChevronRight, TrendingUp, AlertCircle, ShoppingCart, Trash2 } from "lucide-react";
import { fmt } from "@/lib/data";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [receiptModal, setReceiptModal] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, revenue: 0, completed: 0 });

  useEffect(() => {
    fetchOrders();
    const sub = supabase.channel('orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  useEffect(() => {
    let result = orders.filter(o =>
      (o.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.phone || "").includes(search) ||
      (o.id || "").includes(search)
    );
    if (statusFilter !== "all") {
      result = result.filter(o => o.status === statusFilter);
    }
    setFilteredOrders(result);
  }, [search, statusFilter, orders]);

  const calculateStats = (data: any[]) => {
    const s = { total: data.length, pending: 0, revenue: 0, completed: 0 };
    data.forEach(o => {
      if (o.status === 'pending' || o.status === 'verifying') s.pending++;
      if (o.status === 'completed') {
        s.completed++;
        s.revenue += (o.total || 0);
      }
    });
    setStats(s);
  };

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) {
      setOrders(data);
      setFilteredOrders(data);
      calculateStats(data);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, newStatus: string, note: string = "") => {
    setLoading(true);
    if (newStatus === 'resubmit') {
      await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'notify_status', orderId: id, status: 'resubmit' })
      });
    } else {
      await supabase.from('orders').update({ status: newStatus }).eq('id', id);

      // Add to history timeline
      await supabase.from('order_history').insert([{
        order_id: id,
        status: newStatus,
        note: note || `Holat ${newStatus} ga o'zgartirildi`
      }]);

      await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'notify_status', orderId: id, status: newStatus })
      });
    }

    fetchOrders();
    // Keep modal open but update local data if possible, or close to refresh
    setReceiptModal(null);
  };

  const deleteOrder = async (id: string) => {
    if (!window.confirm("Haqiqatdan ham ushbu buyurtmani o'chirib tashlamoqchimisiz?")) return;

    setLoading(true);
    const { error } = await supabase.from('orders').delete().eq('id', id);

    if (error) {
      alert("Xatolik: Buyurtmani o'chirish imkonsiz.");
    } else {
      setReceiptModal(null);
      fetchOrders();
    }
  };

  if (loading && orders.length === 0) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-red-600 shadow-lg"></div>
      <p className="font-black text-slate-300 uppercase tracking-[0.3em] text-xs">Ma'lumotlar yuklanmoqda...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Barcha <span className="text-red-600">Buyurtmalar</span></h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mt-1.5 flex items-center gap-2">
            <TrendingUp size={10} className="text-emerald-500" /> Savdo va amallar monitoringi
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-red-500" size={18} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ID, Ism yoki Tel..."
              className="h-14 w-64 rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm font-bold outline-none transition-all focus:border-red-500 focus:ring-4 focus:ring-red-50 shadow-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="h-14 rounded-2xl border border-slate-200 bg-white px-6 text-sm font-black outline-none transition-all focus:border-red-500 shadow-sm appearance-none cursor-pointer hover:bg-slate-50"
          >
            <option value="all">Barcha Holatlar</option>
            <option value="pending">Kutilmoqda</option>
            <option value="verifying">Tasdiqlanmoqda</option>
            <option value="processing">Tayyorlanmoqda</option>
            <option value="completed">Yakunlangan</option>
            <option value="rejected">Bekor qilingan</option>
          </select>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<ShoppingCart />} label="Jami Buyurtmalar" value={stats.total} color="bg-slate-900" />
        <StatCard icon={<Clock />} label="Kutilmoqda" value={stats.pending} color="bg-orange-500" />
        <StatCard icon={<Check />} label="Yakunlandi" value={stats.completed} color="bg-emerald-500" />
        <StatCard icon={<CreditCard />} label="Tushum" value={fmt(stats.revenue)} color="bg-red-600" isCurrency />
      </div>

      {/* Orders Table Container */}
      <div className="overflow-hidden rounded-[3rem] border border-white bg-white/40 backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 uppercase text-[9px] font-black tracking-[0.25em]">
                <th className="px-10 py-6">ID / Vaqt</th>
                <th className="px-10 py-6">Mijoz va Hudud</th>
                <th className="px-10 py-6">To'lov va Summa</th>
                <th className="px-10 py-6">Status</th>
                <th className="px-10 py-6 text-right">Aloqa</th>
                <th className="px-10 py-6 text-right">Boshqaruv</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="group transition-all hover:bg-white/80">
                  <td className="px-10 py-8">
                    <div className="font-black text-slate-800 text-base tracking-tighter">#{o.id.split('-')[0].toUpperCase()}</div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300 mt-1 uppercase tracking-widest">
                      <Clock size={10} /> {new Date(o.created_at).toLocaleString('uz-UZ', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="font-black text-slate-900 group-hover:text-red-700 transition-colors uppercase tracking-tight">{o.name}</div>
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 mt-1 uppercase">
                      <MapPin size={10} className="text-red-500/50" /> {o.region}
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="font-black text-red-600 text-lg">{fmt(o.total)}</div>
                    <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-300 uppercase tracking-[0.1em] mt-1.5">
                      <CreditCard size={10} /> {o.payment_method}
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                      <a href={`https://t.me/${o.phone}`} target="_blank" className="h-11 w-11 flex items-center justify-center rounded-2xl bg-sky-50 text-sky-600 hover:bg-sky-500 hover:text-white transition-all shadow-sm border border-sky-100">
                        <Send size={18} />
                      </a>
                      <a href={`https://wa.me/${o.phone}`} target="_blank" className="h-11 w-11 flex items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm border border-emerald-100">
                        <MessageSquare size={18} />
                      </a>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <button
                      onClick={() => setReceiptModal(o)}
                      className="group/btn relative inline-flex items-center gap-2 overflow-hidden rounded-[1.25rem] bg-slate-900 px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] text-white shadow-xl shadow-slate-200 hover:bg-red-600 hover:shadow-red-200 transition-all active:scale-95"
                    >
                      Boshqarish
                      <ChevronRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center opacity-30 grayscale">
            <ShoppingCart size={64} className="mb-4 text-slate-300" />
            <p className="font-black text-slate-400 uppercase tracking-widest italic">Hech qanday buyurtma topilmadi</p>
          </div>
        )}
      </div>

      {/* Premium Order Management Modal */}
      {receiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-10 overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-2xl" onClick={() => setReceiptModal(null)} />
          <div className="relative w-full max-w-6xl max-h-[95vh] overflow-hidden rounded-[4rem] bg-[#f8faff] shadow-[0_64px_128px_-32px_rgba(0,0,0,0.3)] animate-in zoom-in-95 fade-in duration-500">

            <div className="flex flex-col md:flex-row h-full max-h-[95vh]">
              {/* Image/Receipt Side */}
              <div className="w-full md:w-[45%] bg-slate-100/50 p-10 flex flex-col items-center border-r border-slate-200/50">
                <div className="mb-8 w-full flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-200"><Receipt size={20} /></div>
                    <h3 className="font-black uppercase tracking-[0.2em] text-slate-900 text-xs text-left">To'lov Tasdig'i</h3>
                  </div>
                  <button onClick={() => setReceiptModal(null)} className="h-10 w-10 flex items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm border border-slate-100 active:scale-90 transition"><X size={20} /></button>
                </div>

                <div className="relative w-full flex-1 min-h-[300px] overflow-hidden rounded-[3rem] border-8 border-white bg-slate-200/30 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] group/img">
                  {receiptModal.receipt_file_id ? (
                    <div className="h-full w-full">
                      <img
                        src={`/api/telegram/file?id=${receiptModal.receipt_file_id}`}
                        alt="Receipt"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover/img:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors cursor-zoom-in" />
                    </div>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-6 p-12 text-center">
                      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-xl text-slate-200 animate-bounce"><Eye size={48} /></div>
                      <div>
                        <p className="font-black text-slate-900 uppercase tracking-widest text-sm mb-2">Skrinshot kutilmoqda</p>
                        <p className="text-xs font-bold text-slate-400 leading-relaxed">Mijoz hali to'loving skrinshotini tizim orqali yuborgani yo'q.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Details/Action Side */}
              <div className="flex-1 p-10 md:p-14 overflow-y-auto bg-white custom-scrollbar">
                <div className="flex flex-col gap-10">
                  {/* Top Info */}
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center flex-wrap gap-3">
                      <span className="rounded-xl bg-slate-100 px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-200">ID #{receiptModal.id.split('-')[0]}</span>
                      <StatusBadge status={receiptModal.status} />
                    </div>
                    <div>
                      <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{receiptModal.name}</h2>
                      <p className="text-lg font-bold text-red-600 mt-2">{receiptModal.phone}</p>
                    </div>
                  </div>

                  {/* Items & Address Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="rounded-[2.5rem] bg-[#f8faff] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                      <div className="absolute -right-6 -top-6 h-28 w-28 bg-red-500/5 rounded-full" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-6 flex items-center gap-2"><ShoppingCart size={12} className="text-red-500" /> Mahsulotlar</p>
                      <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                        {receiptModal.items?.map((it: any, i: number) => (
                          <div key={i} className="flex justify-between items-start group">
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-slate-800 line-clamp-1 group-hover:text-red-600 transition-colors">{it.nameUz || it.name}</span>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{it.qty} x {fmt(it.price)}</span>
                            </div>
                            <span className="text-sm font-black text-slate-900 mt-1">{fmt(it.price * it.qty)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-8 pt-6 border-t-2 border-dashed border-slate-200 flex justify-between items-center">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Jami Summa</span>
                        <span className="text-2xl font-black text-red-600">{fmt(receiptModal.total)}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-6">
                      <div className="rounded-[2rem] bg-indigo-50/30 p-6 border border-indigo-100/50">
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.25em] mb-3 flex items-center gap-2"><MapPin size={12} /> Manzil</p>
                        <p className="text-sm font-black text-slate-800 leading-relaxed">{receiptModal.region}, {receiptModal.address}</p>
                      </div>
                      <div className="rounded-[2rem] bg-emerald-50/30 p-6 border border-emerald-100/50">
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.25em] mb-3 flex items-center gap-2"><CreditCard size={12} /> To'lov Turi</p>
                        <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{receiptModal.payment_method}</p>
                      </div>
                      <div className="rounded-[2rem] bg-orange-50/30 p-6 border border-orange-100/50">
                        <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.25em] mb-3 flex items-center gap-2"><Clock size={12} /> Buyurtma Vaqti</p>
                        <p className="text-sm font-black text-slate-800">{new Date(receiptModal.created_at).toLocaleString('uz-UZ')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Preview (Simplified placeholder for visual) */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Amallar Tarixi</h4>
                    <div className="flex items-center gap-3 px-2">
                      <div className="h-2 w-2 rounded-full bg-orange-500" />
                      <div className="h-[2px] flex-1 bg-slate-100" />
                      <div className="h-2 w-2 rounded-full bg-slate-200" />
                      <div className="h-[2px] flex-1 bg-slate-100" />
                      <div className="h-2 w-2 rounded-full bg-slate-200" />
                      <div className="h-[2px] flex-1 bg-slate-100" />
                      <div className="h-2 w-2 rounded-full bg-slate-200" />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <button
                      onClick={() => deleteOrder(receiptModal.id)}
                      className="h-16 w-16 flex items-center justify-center rounded-[1.5rem] bg-red-50 text-red-600 border-2 border-red-100 hover:bg-red-600 hover:text-white transition-all active:scale-95"
                      title="O'chirish"
                    >
                      <Trash2 size={24} />
                    </button>
                    <button
                      onClick={() => updateStatus(receiptModal.id, 'rejected', "Admin shaxsan rad etdi")}
                      className="flex-1 rounded-[1.5rem] bg-white border-2 border-slate-200 py-5 text-xs font-black uppercase text-slate-400 tracking-widest transition-all hover:bg-slate-100 hover:text-slate-600 active:scale-95"
                    >
                      Rad etish
                    </button>
                    {receiptModal.status === 'verifying' || receiptModal.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => updateStatus(receiptModal.id, 'resubmit', "Chekda xatolik aniqlandi")}
                          className="flex-1 rounded-[1.5rem] bg-orange-50 border-2 border-orange-100 py-5 text-xs font-black uppercase text-orange-600 tracking-widest transition-all hover:bg-orange-100 active:scale-95 flex items-center justify-center gap-2"
                        >
                          <AlertCircle size={16} /> Chekda xatolik
                        </button>
                        <button
                          onClick={() => updateStatus(receiptModal.id, 'processing', "To'lov tasdiqlandi, tayyorlanmoqda")}
                          className="flex-[2] rounded-[1.5rem] bg-slate-900 border-2 border-slate-900 py-5 text-xs font-black uppercase text-white tracking-widest shadow-2xl shadow-slate-200 transition-all hover:bg-red-600 hover:border-red-600 active:scale-95 flex items-center justify-center gap-3"
                        >
                          To'lovni Tasdiqlash <ChevronRight size={16} />
                        </button>
                      </>
                    ) : receiptModal.status === 'processing' ? (
                      <button
                        onClick={() => updateStatus(receiptModal.id, 'completed', "Buyurtma topshirildi")}
                        className="flex-[2] rounded-[1.5rem] bg-emerald-600 border-2 border-emerald-600 py-5 text-xs font-black uppercase text-white tracking-widest shadow-2xl shadow-emerald-100 transition-all hover:bg-emerald-700 active:scale-95 flex items-center justify-center gap-3"
                      >
                        Topshirilganini Tasdiqlash <Check size={16} />
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color, isCurrency = false }: any) {
  return (
    <div className="relative group overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-xl shadow-slate-200/40 border border-white hover:-translate-y-1 transition-all duration-500">
      <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-[0.03] transition-transform duration-700 group-hover:scale-150 ${color}`} />
      <div className="flex flex-col gap-4">
        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${color} transition-transform group-hover:scale-110 group-hover:rotate-3 duration-500`}>
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
          <h4 className="text-2xl font-black text-slate-900 tracking-tighter">{value}</h4>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    pending: "bg-orange-50 text-orange-600 border-orange-100",
    verifying: "bg-sky-50 text-sky-600 border-sky-100 animate-pulse",
    processing: "bg-indigo-50 text-indigo-600 border-indigo-100",
    completed: "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-50",
    rejected: "bg-red-50 text-red-600 border-red-100",
  };
  const labels: any = {
    pending: "Kutilmoqda",
    verifying: "Tasdiqlanmoqda",
    processing: "Tayyorda",
    completed: "Yetkazildi",
    rejected: "Bekor qilindi",
  };

  const currentStyle = styles[status] || styles.pending;
  const dotColor = currentStyle.split(' ').find((s: string) => s.startsWith('text-'))?.replace('text-', 'bg-') || 'bg-slate-400';

  return (
    <span className={`inline-flex items-center gap-2 rounded-[1.15rem] border px-4 py-2 text-[9px] font-black uppercase tracking-[0.15em] shadow-sm ${currentStyle}`}>
      <div className={`h-1.5 w-1.5 rounded-full ${status === 'verifying' ? 'animate-ping bg-sky-500' : dotColor} `} />
      {labels[status] || status || "Noma'lum"}
    </span>
  );
}
