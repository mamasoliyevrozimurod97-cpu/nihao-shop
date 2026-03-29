"use client";
import { fmt } from "@/lib/data";
import { useAppStore } from "@/lib/store";
import { T } from "@/lib/translations";
import { X, CreditCard, Wallet, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CheckoutModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { lang, cart, clearCart, darkMode, deliveryConfig, user } = useAppStore();
  const t = T[lang];
  const subTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const [form, setForm] = useState({ name: "", phone: "", region: "", address: "" });
  const [regions, setRegions] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "click" | "payme">("card");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const { data, error } = await supabase.from('delivery_regions').select('*').eq('is_active', true).order('name');
        if (data && data.length > 0) {
          setRegions(data);
          if (!form.region) setForm(prev => ({ ...prev, region: data[0].name }));
        } else {
          throw new Error('No regions found');
        }
      } catch (err) {
        // Fallback to translations if DB is empty, fails, or doesn't exist
        const fallback = t.viloyatlar.map((v, i) => ({ id: i, name: v, price: deliveryConfig.farPrice }));
        setRegions(fallback);
        if (!form.region) setForm(prev => ({ ...prev, region: fallback[0]?.name || "" }));
      }
    };
    if (isOpen) fetchRegions();
  }, [isOpen, t.viloyatlar]);

  // Delivery Logic
  const selectedRegion = regions.find(r => r.name === form.region);
  const baseDeliveryFee = selectedRegion ? Number(selectedRegion.price) : (deliveryConfig.farPrice || 45000);
  const deliveryFee = subTotal >= deliveryConfig.freeThreshold ? 0 : baseDeliveryFee;
  const total = subTotal + deliveryFee;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: cart,
          subTotal,
          deliveryFee,
          total,
          paymentMethod,
          lang,
          userId: user?.id
        })
      });
      const data = await res.json();
      
      if(data.ok && data.botLink) {
        clearCart();
        onClose();
        // Redirect to Telegram Bot for payment
        window.location.href = data.botLink;
      } else {
        alert("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
      }
    } catch(err) {
      alert("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      
      {/* Modal */}
      <div className={`relative w-full max-w-lg overflow-hidden rounded-[2rem] shadow-2xl ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'} animate-in fade-in zoom-in-95 duration-200`}>
        
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-red-600 to-red-800 p-6 text-white">
          <div>
            <h2 className="text-2xl font-black">{t.checkout}</h2>
            <div className="mt-2 text-sm font-medium text-red-100 flex flex-col">
              <span className="opacity-80">Mahsulotlar: {fmt(subTotal)}</span>
              <span className="opacity-80">Yetkazib berish: {deliveryFee === 0 ? "Bepul" : fmt(deliveryFee)}</span>
              <span className="mt-1 font-bold">Jami: <span className="text-xl text-white">{fmt(total)}</span></span>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full bg-white/10 p-2 hover:bg-white/20 transition self-start">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-bold opacity-80">{t.name}</label>
              <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className={`w-full rounded-xl border p-3 font-medium outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100 ${darkMode ? 'border-gray-700 bg-gray-800 focus:ring-red-900/30' : 'border-gray-200 bg-gray-50'}`} placeholder="Falonchi Pistonchiyev" />
            </div>
            
            <div>
              <label className="mb-1 block text-sm font-bold opacity-80">{t.phone}</label>
              <input required type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className={`w-full rounded-xl border p-3 font-medium outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100 ${darkMode ? 'border-gray-700 bg-gray-800 focus:ring-red-900/30' : 'border-gray-200 bg-gray-50'}`} placeholder="+998 90 123 45 67" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-bold opacity-80">{t.region}</label>
                <select value={form.region} onChange={e => setForm({...form, region: e.target.value})} className={`w-full appearance-none rounded-xl border p-3 font-medium outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100 ${darkMode ? 'border-gray-700 bg-gray-800 focus:ring-red-900/30' : 'border-gray-200 bg-gray-50'}`}>
                  {regions.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold opacity-80">{t.deliveryAddress}</label>
                <input required value={form.address} onChange={e => setForm({...form, address: e.target.value})} className={`w-full rounded-xl border p-3 font-medium outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100 ${darkMode ? 'border-gray-700 bg-gray-800 focus:ring-red-900/30' : 'border-gray-200 bg-gray-50'}`} placeholder="Tuman, ko'cha, uy" />
              </div>
            </div>

            <div className="pt-2">
              <label className="mb-3 block text-sm font-bold opacity-80">{t.payWith}</label>
              <div className="grid grid-cols-3 gap-3">
                <button type="button" onClick={() => setPaymentMethod("click")} className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition ${paymentMethod === "click" ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50 dark:border-gray-700'}`}>
                  <Wallet size={24} className={paymentMethod === 'click' ? 'text-blue-500' : 'text-gray-400'} />
                  <span className="text-xs font-black tracking-wide">CLICK</span>
                </button>
                <button type="button" onClick={() => setPaymentMethod("payme")} className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition ${paymentMethod === "payme" ? 'border-cyan-500 bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' : 'border-gray-200 hover:border-cyan-200 hover:bg-gray-50 dark:border-gray-700'}`}>
                  <Wallet size={24} className={paymentMethod === 'payme' ? 'text-cyan-500' : 'text-gray-400'} />
                  <span className="text-xs font-black tracking-wide">PAYME</span>
                </button>
                <button type="button" onClick={() => setPaymentMethod("card")} className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition ${paymentMethod === "card" ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'border-gray-200 hover:border-red-200 hover:bg-gray-50 dark:border-gray-700'}`}>
                  <CreditCard size={24} className={paymentMethod === 'card' ? 'text-red-500' : 'text-gray-400'} />
                  <span className="text-xs font-black tracking-wide">{t.cardPay}</span>
                </button>
              </div>
            </div>
          </div>

          <button disabled={isSubmitting} type="submit" className="btn-glow mt-8 w-full rounded-2xl bg-gradient-to-r from-red-600 to-red-800 py-4 text-center text-lg font-black text-white shadow-xl disabled:opacity-70 disabled:shadow-none">
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Bajarilmoqda...
              </span>
            ) : (
              t.orderNow
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
