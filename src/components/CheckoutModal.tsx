"use client";
import { fmt } from "@/lib/data";
import { useAppStore } from "@/lib/store";
import { T } from "@/lib/translations";
import { X, User, Calendar, MapPin, Phone, CreditCard, Wallet, ChevronRight, ShieldCheck, Navigation, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Browser } from "@capacitor/browser";

export default function CheckoutModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { lang, cart, clearCart, darkMode, deliveryConfig, user } = useAppStore();
  const t = T[lang];
  const subTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const [form, setForm] = useState({ name: "", phone: "", region: "", address: "" });
  const [profile, setProfile] = useState({ firstName: "", lastName: "", patronymic: "", homeAddress: "", homePhone: "" });
  const [regions, setRegions] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"card">("card");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveProfile, setSaveProfile] = useState(true);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const { data, error } = await supabase.from('delivery_regions').select('*').eq('is_active', true).order('name');
        if (data && data.length > 0) {
          setRegions(data);
          if (!form.region) setForm(prev => ({ ...prev, region: data[0].name }));
        } else throw new Error('No regions found');
      } catch {
        const fallback = t.viloyatlar.map((v, i) => ({ id: i, name: v, price: deliveryConfig.farPrice }));
        setRegions(fallback);
        if (!form.region) setForm(prev => ({ ...prev, region: fallback[0]?.name || "" }));
      }
    };
    if (isOpen) fetchRegions();
  }, [isOpen, t.viloyatlar]);

  const selectedRegion = regions.find(r => r.name === form.region);
  const baseDeliveryFee = selectedRegion ? Number(selectedRegion.price) : (deliveryConfig.farPrice || 45000);
  const deliveryFee = subTotal >= deliveryConfig.freeThreshold ? 0 : baseDeliveryFee;
  const total = subTotal + deliveryFee;

  const fullName = `${profile.firstName} ${profile.lastName}`.trim() || form.name;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Use profile name if provided
    const orderName = fullName || form.name;
    const orderPhone = profile.homePhone || form.phone;
    const orderAddress = profile.homeAddress || form.address;

    try {
      const { data: prof } = await supabase.from('profiles').select('is_blocked').eq('phone', orderPhone).single();
      if (prof?.is_blocked) {
        alert("Xatolik: Ushbu telefon raqami bloklangan. Iltimos, ma'muriyat bilan bog'laning.");
        setIsSubmitting(false);
        return;
      }

      const { data, error } = await supabase.from('orders').insert([{
        name: orderName,
        phone: orderPhone,
        region: form.region,
        address: orderAddress,
        items: cart,
        sub_total: subTotal,
        delivery_fee: deliveryFee,
        total: total,
        status: 'pending',
        payment_method: paymentMethod,
        lang: lang
      }]).select('id').single();

      if (error) throw error;

      const orderId = data.id;
      const BOT_USERNAME = 'nixouo_bot';
      const botLink = `https://t.me/${BOT_USERNAME}?start=PAY_${orderId}_${paymentMethod}`;

      clearCart();
      onClose();
      await Browser.open({ url: botLink });
    } catch (err) {
      console.error('Checkout error:', err);
      alert("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const dm = darkMode;
  const inputCls = `w-full rounded-xl border p-3 font-medium outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100 ${dm ? 'border-gray-700 bg-gray-800 focus:ring-red-900/30 text-white' : 'border-gray-200 bg-gray-50'}`;

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className={`relative w-full max-w-lg overflow-hidden rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl ${dm ? 'bg-gray-950 text-gray-100' : 'bg-white text-gray-900'} animate-in fade-in slide-in-from-bottom sm:zoom-in-95 duration-300 flex flex-col max-h-[95vh]`}>
        
        {/* HEADER */}
        <div className={`shrink-0 p-6 border-b flex items-center justify-between ${dm ? 'border-gray-800 bg-gray-900' : 'border-gray-50 bg-white'}`}>
          <div className="flex items-center gap-3">
             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg">
                <ShoppingCart size={20} />
             </div>
             <div>
                <h2 className="text-lg font-black">{t.checkout}</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{fmt(total)}</p>
             </div>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <X size={20} />
          </button>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
          
          {/* Main Form Fields */}
          <section className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Ism (Majburiy)</label>
                   <input 
                     required
                     value={profile.firstName}
                     onChange={e => setProfile({...profile, firstName: e.target.value})}
                     className={inputCls}
                     placeholder="Abdulloh"
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Familiya (Majburiy)</label>
                   <input 
                     required
                     value={profile.lastName}
                     onChange={e => setProfile({...profile, lastName: e.target.value})}
                     className={inputCls}
                     placeholder="Karimov"
                   />
                </div>
             </div>

             <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Sharif (Otchistva — Majburiy)</label>
                <input 
                  required
                  value={profile.patronymic || ''}
                  onChange={e => setProfile({...profile, patronymic: e.target.value})}
                  className={inputCls}
                  placeholder="Masalan: Abdulloh o'g'li"
                />
             </div>

             <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Telefon raqam (Majburiy)</label>
                <input 
                  required
                  type="tel"
                  value={profile.homePhone}
                  onChange={e => setProfile({...profile, homePhone: e.target.value})}
                  className={inputCls}
                  placeholder="+998 90 123 45 67"
                />
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Hudud</label>
                   <select 
                     value={form.region} 
                     onChange={e => setForm({...form, region: e.target.value})} 
                     className={inputCls}
                   >
                     {regions.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                   </select>
                </div>
                <div className="space-y-1.5">
                   <div className="flex items-center justify-between ml-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Manzil (Majburiy)</label>
                      <button 
                        type="button"
                        onClick={async () => {
                          if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(async (pos) => {
                              const { latitude, longitude } = pos.coords;
                              try {
                                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                                const data = await res.json();
                                if (data.display_name) setProfile({...profile, homeAddress: data.display_name});
                              } catch (e) { alert("Xatolik bo'ldi."); }
                            });
                          }
                        }}
                        className="text-[9px] font-black text-red-600 uppercase flex items-center gap-1"
                      >
                         <Navigation size={10} /> Lokatsiya
                      </button>
                   </div>
                   <input 
                     required
                     value={profile.homeAddress}
                     onChange={e => setProfile({...profile, homeAddress: e.target.value})}
                     className={inputCls}
                     placeholder="Ko'cha, uy..."
                   />
                </div>
             </div>
          </section>

          {/* Payment Section */}
          <section className="space-y-3">
             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">To'lov usuli</label>
             <div className="grid grid-cols-1">
                <div className="flex items-center justify-center gap-3 rounded-2xl border-2 border-red-500 bg-red-50 p-4 text-red-700 font-black text-xs uppercase tracking-widest">
                   <CreditCard size={20} />
                   {t.cardPay}
                </div>
             </div>
          </section>

          {/* Safety Badge */}
          <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 p-4 text-emerald-600 dark:text-emerald-400">
             <ShieldCheck size={20} />
             <p className="text-[10px] font-black uppercase tracking-widest leading-tight">
                Ma'lumotlar xavfsiz saqlanadi va faqat buyurtma uchun ishlatiladi.
             </p>
          </div>
        </div>

        {/* STICKY FOOTER ACTION */}
        <div className={`shrink-0 p-6 border-t ${dm ? 'border-gray-800 bg-gray-900' : 'border-gray-50 bg-white'}`}>
          <button 
            disabled={isSubmitting} 
            onClick={handleSubmit}
            className="w-full rounded-2xl bg-gradient-to-r from-red-600 to-red-700 py-5 text-center text-sm font-black uppercase tracking-widest text-white shadow-2xl shadow-red-500/30 transition hover:from-red-500 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>{t.orderNow} <ChevronRight size={18} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
