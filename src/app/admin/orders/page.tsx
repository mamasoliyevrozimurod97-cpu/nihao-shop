"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CheckCircle, XCircle, Eye, X } from "lucide-react";
import { fmt } from "@/lib/data";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [receiptModal, setReceiptModal] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
    const sub = supabase.channel('orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) setOrders(data);
  };

  const notifyBot = async (orderId: string, status: string) => {
    await fetch('/api/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'notify_status', orderId, status })
    });
  };

  const approveOrder = async (id: string) => {
    await supabase.from('orders').update({ status: 'processing' }).eq('id', id);
    await notifyBot(id, 'processing');
    fetchOrders();
    setReceiptModal(null);
  };

  const rejectOrder = async (id: string) => {
    await supabase.from('orders').update({ status: 'rejected' }).eq('id', id);
    fetchOrders();
    setReceiptModal(null);
  };

  const rejectReceipt = async (id: string) => {
    await notifyBot(id, 'resubmit');
    fetchOrders();
    setReceiptModal(null);
  };

  const completeOrder = async (id: string) => {
    await supabase.from('orders').update({ status: 'completed' }).eq('id', id);
    fetchOrders();
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Buyurtmalar ({orders.length})</h1>
          <p className="text-sm font-bold text-gray-500">Savdo tarixingiz va to'lovlarni boshqaring</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-xl shadow-gray-100/50">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/50 text-gray-400">
            <tr>
              <th className="p-6 font-black uppercase tracking-widest text-[10px]">ID / Sana</th>
              <th className="p-6 font-black uppercase tracking-widest text-[10px]">Mijoz</th>
              <th className="p-6 font-black uppercase tracking-widest text-[10px]">Hudud</th>
              <th className="p-6 font-black uppercase tracking-widest text-[10px]">Summa</th>
              <th className="p-6 font-black uppercase tracking-widest text-[10px]">Holat</th>
              <th className="p-6 text-right font-black uppercase tracking-widest text-[10px]">Harakatlar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.map((o) => (
              <tr key={o.id} className="group transition hover:bg-gray-50/50">
                <td className="p-6">
                  <div className="font-black text-gray-900">#{o.id.split('-')[0].toUpperCase()}</div>
                  <div className="text-[10px] font-bold text-gray-400">{new Date(o.created_at).toLocaleString()}</div>
                  {o.receipt_attempts > 0 && (
                    <div className="mt-1 text-[10px] font-black text-red-500">Urinishlar: {o.receipt_attempts}/3</div>
                  )}
                </td>
                <td className="p-6">
                  <div className="font-black text-gray-900">{o.name}</div>
                  <div className="font-bold text-gray-500">{o.phone}</div>
                </td>
                <td className="p-6">
                  <div className="font-black text-gray-800">{o.region}</div>
                  <div className="text-[10px] font-bold text-gray-400 max-w-[150px] truncate">{o.address}</div>
                </td>
                <td className="p-6">
                  <div className="font-black text-red-600">{fmt(o.total)}</div>
                  {o.payment_method === 'click' && <div className="text-[10px] font-black text-blue-500 uppercase">Click Pay</div>}
                </td>
                <td className="p-6">
                  <span className={`inline-flex items-center rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                    o.status === 'processing' ? 'bg-indigo-50 text-indigo-700' :
                    o.status === 'completed' ? 'bg-green-50 text-green-700' :
                    o.status === 'rejected' ? 'bg-red-50 text-red-700' :
                    o.status === 'verifying' ? 'bg-blue-50 text-blue-700 animate-pulse' :
                    'bg-orange-50 text-orange-700'
                  }`}>
                    {o.status === 'verifying' ? 'Tekshirilmoqda' : 
                     o.status === 'processing' ? 'Tayyorlanmoqda' :
                     o.status === 'completed' ? 'Yetkazildi' : 
                     o.status === 'pending' ? 'Kutilmoqda' : 'Rad etildi'}
                  </span>
                </td>
                <td className="p-6 text-right">
                  <div className="flex items-center justify-end gap-3 flex-wrap">
                    {/* Always allow verification/management for active orders */}
                    {(o.status === 'pending' || o.status === 'verifying' || o.status === 'processing') && (
                      <button 
                        onClick={() => setReceiptModal(o)} 
                        className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-[11px] font-black uppercase text-white shadow-xl shadow-blue-100 hover:bg-blue-700 transition"
                      >
                        <Eye size={16} /> Chekni Tekshirish
                      </button>
                    )}

                    {/* Request / Resend Receipt action for pending/verifying */}
                    {(o.status === 'pending' || o.status === 'verifying') && (
                      <button 
                        onClick={() => rejectReceipt(o.id)} 
                        className="rounded-xl border-2 border-orange-500 px-4 py-2.5 text-[11px] font-black uppercase text-orange-600 hover:bg-orange-50 transition"
                      >
                        Chekni qayta yuboring
                      </button>
                    )}

                    {/* Basic status actions */}
                    <div className="flex gap-2">
                       {o.status === 'processing' && (
                        <button 
                          onClick={() => completeOrder(o.id)} 
                          className="rounded-xl bg-indigo-600 px-6 py-3 text-[11px] font-black text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition uppercase tracking-widest"
                        >
                          Topshirildi
                        </button>
                      )}
                      {o.status === 'completed' && <CheckCircle size={24} className="text-green-500" />}
                      {o.status === 'rejected' && <XCircle size={24} className="text-red-300" />}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {receiptModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-300">
           <div className="relative max-h-[90vh] w-full max-w-xl overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-2xl">
             <button onClick={() => setReceiptModal(null)} className="absolute right-6 top-6 z-10 rounded-full bg-gray-100 p-2 hover:bg-gray-200 transition">
               <X size={24} />
             </button>
             
             <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900">To'lov cheki</h2>
                <p className="text-sm font-bold text-gray-500">Mijoz tomonidan yuborilgan skrinshot</p>
             </div>
             
             <div className="relative mb-8 aspect-[4/5] w-full overflow-hidden rounded-3xl border-4 border-gray-50 bg-gray-50 flex items-center justify-center">
                 {(receiptModal as any).receipt_file_id ? (
                   /* eslint-disable-next-line @next/next/no-img-element */
                   <img 
                     src={`/api/telegram/file?id=${(receiptModal as any).receipt_file_id}`} 
                     alt="Chek" 
                     className="h-full w-full object-contain" 
                   />
                 ) : (
                    <div className="text-center p-8">
                       <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm text-gray-300">
                          <Eye size={40} />
                       </div>
                       <p className="text-lg font-black text-gray-400 italic">Chek hali yuborilmagan</p>
                       <p className="text-xs font-bold text-gray-300 mt-2">Mijoz to'lov qilgandan keyin botga rasm yuborishi kutilmoqda</p>
                    </div>
                 )}
              </div>
             
             <div className="flex flex-wrap items-center gap-4">
               <button onClick={() => rejectOrder((receiptModal as any).id)} className="flex-1 min-w-[120px] rounded-2xl bg-red-50 py-4 font-black text-red-700 transition hover:bg-red-100 text-center">Rad etish</button>
               <button onClick={() => rejectReceipt((receiptModal as any).id)} className="flex-1 min-w-[120px] rounded-2xl bg-orange-100 py-4 font-black text-orange-700 transition hover:bg-orange-200 text-center">Chek xatosi</button>
               <button onClick={() => approveOrder((receiptModal as any).id)} className="flex-1 min-w-[120px] rounded-2xl bg-green-600 py-4 font-black text-white shadow-xl shadow-green-100 transition hover:bg-green-700 text-center">Qabul qilish</button>
             </div>
           </div>
         </div>
      )}
    </div>
  );
}
