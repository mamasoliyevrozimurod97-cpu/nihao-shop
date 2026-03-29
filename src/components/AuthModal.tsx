"use client";
import { useAppStore } from "@/lib/store";
import { T } from "@/lib/translations";
import { X, Mail, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { fmt } from "@/lib/data";

function OrderHistory({ userId }: { userId: string }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [userId]);

  if (loading) return <div className="py-8 text-center animate-pulse opacity-50">Yuklanmoqda...</div>;
  if (orders.length === 0) return <div className="py-8 text-center opacity-40 text-sm italic">Hali buyurtmalar yo'q</div>;

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div key={order.id} className="rounded-xl border border-gray-100 dark:border-gray-800 p-3 text-sm transition hover:border-gray-200 dark:hover:border-gray-700 bg-white/50 dark:bg-black/20">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-bold">#{order.id.slice(0, 8)}</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
              order.status === 'processing' ? 'bg-green-100 text-green-700' :
              order.status === 'rejected' ? 'bg-red-100 text-red-700' :
              order.status === 'verifying' ? 'bg-blue-100 text-blue-700' :
              'bg-orange-100 text-orange-700'
            }`}>
              {order.status}
            </span>
          </div>
          <div className="flex items-center justify-between opacity-70">
            <span>{new Date(order.created_at).toLocaleDateString()}</span>
            <span className="font-black text-red-600">{fmt(order.total)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { lang, darkMode, user } = useAppStore();
  const t = T[lang];
  const [loading, setLoading] = useState(false);
  
  const [phone, setPhone] = useState('+998');
  const [token, setToken] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');

  if (!isOpen) return null;

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) {
        alert("Xatolik: " + error.message);
      } else {
        setStep('code');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
      if (error) {
        alert("Xatolik: Kod noto'g'ri yoki vaqti o'tgan. (" + error.message + ")");
      } else {
        onClose();
        setStep('phone');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Content */}
      <div className={`relative w-full max-w-sm overflow-hidden rounded-[2rem] shadow-2xl p-8 ${darkMode ? 'bg-gray-900 border border-gray-800 text-gray-100' : 'bg-white text-gray-900'} animate-in fade-in zoom-in-95 duration-200`}>
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-red-500 rounded-full bg-gray-100 dark:bg-gray-800 p-2">
          <X size={16} />
        </button>
        
        {user ? (
          <div className="flex flex-col h-full max-h-[80vh]">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-2xl font-black">
                {lang === 'uz' ? 'Profilingiz' : 'Ваш Профиль'}
              </h3>
            </div>
            
            <div className="mb-4 rounded-2xl bg-gray-50 dark:bg-gray-800 p-4">
              <p className="text-xs opacity-60 mb-1">Tizimga kirdingiz:</p>
              <p className="font-bold truncate text-red-600">{user.phone || user.email}</p>
            </div>

            {/* Order History */}
            <div className="flex-1 overflow-y-auto mb-6 pr-1 custom-scrollbar">
              <h4 className="mb-3 text-sm font-black uppercase tracking-wider opacity-50">
                {lang === 'uz' ? 'Buyurtmalar tarixi' : 'История заказов'}
              </h4>
              <OrderHistory userId={user.id} />
            </div>

            <button onClick={handleLogout} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-100 dark:bg-gray-800 py-3.5 text-sm font-bold text-red-600 transition hover:bg-red-50 dark:hover:bg-red-900/20">
              🚪 {lang === 'uz' ? 'Tizimdan chiqish' : 'Выйти'}
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-3xl text-red-600">
                {step === 'phone' ? <Mail size={32} /> : <Lock size={32} />}
              </div>
              <h3 className="text-2xl font-black">
                {step === 'phone' ? (lang === 'uz' ? 'Kirish' : 'Вход') : (lang === 'uz' ? 'Kodni kiriting' : 'Введите код')}
              </h3>
              <p className="mt-2 text-sm opacity-60">
                {step === 'phone' ? (lang === 'uz' ? 'Telefon raqamingiz orqali tizimga kiring' : 'Войдите через номер телефона') : (lang === 'uz' ? `${phone} raqamiga yuborilgan kodni kiriting` : `Введите kod, yuborilgan na ${phone}`)}
              </p>
            </div>

            {step === 'phone' ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-bold opacity-80">Telefon raqam</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      required 
                      type="tel" 
                      value={phone} 
                      onChange={e => setPhone(e.target.value)} 
                      className={`w-full rounded-xl border py-3.5 pl-10 pr-4 font-black outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100 ${darkMode ? 'border-gray-700 bg-gray-800 focus:ring-red-900/30 text-white' : 'border-gray-200 bg-gray-50'}`} 
                      placeholder="+998901234567" 
                    />
                  </div>
                </div>

                <button disabled={loading} type="submit" className="btn-glow mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 py-4 text-center font-black tracking-wide text-white shadow-lg hover:from-red-700 hover:to-red-800 transition disabled:opacity-70">
                  {loading ? "Kutilmoqda..." : (lang === 'uz' ? 'SMS kod yuborish' : 'Отправить SMS-код')}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-bold opacity-80">SMS Kod</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      required 
                      type="text"
                      maxLength={6} 
                      value={token} 
                      onChange={e => setToken(e.target.value)} 
                      className={`w-full rounded-xl border py-3.5 pl-10 pr-4 font-black tracking-[0.5em] text-center outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100 ${darkMode ? 'border-gray-700 bg-gray-800 focus:ring-red-900/30 text-white' : 'border-gray-200 bg-gray-50'}`} 
                      placeholder="000000" 
                    />
                  </div>
                </div>

                <button disabled={loading} type="submit" className="btn-glow mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-green-700 py-4 text-center font-black tracking-wide text-white shadow-lg hover:from-green-700 hover:to-green-800 transition disabled:opacity-70">
                  {loading ? "Tasdiqlanmoqda..." : (lang === 'uz' ? 'Kodni tasdiqlash' : 'Подтвердить код')}
                </button>

                <button type="button" onClick={() => setStep('phone')} className="w-full text-sm font-bold text-gray-400 hover:text-red-600 transition">
                  {lang === 'uz' ? 'Raqamni o\'zgartirish' : 'Изменить номер'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
