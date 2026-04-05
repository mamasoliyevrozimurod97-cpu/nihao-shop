"use client";
import { useAppStore } from "@/lib/store";
import { T } from "@/lib/translations";
import { X, Mail, Lock, User } from "lucide-react";
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
  const { lang, darkMode, localProfile, setLocalProfile } = useAppStore();
  const t = T[lang];
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    patronymic: '',
    phone: '+998',
    address: ''
  });

  useEffect(() => {
    // Load from localStorage on mount or when modal opens
    if (isOpen) {
      const saved = localStorage.getItem('nihao_profile');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setFormData(parsed);
          setLocalProfile(parsed);
        } catch (e) {
          console.error("Profile parsing error", e);
        }
      }
    }
  }, [isOpen, setLocalProfile]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate
    if (!formData.firstName || !formData.lastName || !formData.patronymic || !formData.phone || !formData.address) {
      alert(lang === 'uz' ? "Iltimos, barcha maydonlarni to'ldiring" : "Пожалуйста, заполните все поля");
      setLoading(false);
      return;
    }

    // Save to store and localStorage
    setLocalProfile(formData);
    localStorage.setItem('nihao_profile', JSON.stringify(formData));
    
    setTimeout(() => {
      setLoading(false);
      onClose();
    }, 500);
  };

  const inputCls = `w-full rounded-xl border py-3 px-4 font-bold outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100 ${darkMode ? 'border-gray-700 bg-gray-800 text-white placeholder-gray-500' : 'border-gray-200 bg-gray-50'}`;
  const labelCls = "mb-1.5 block text-[10px] font-black uppercase tracking-widest opacity-60 ml-1";

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Content */}
      <div className={`relative w-full max-w-sm overflow-hidden rounded-[2rem] shadow-2xl p-8 ${darkMode ? 'bg-gray-900 border border-gray-800 text-gray-100' : 'bg-white text-gray-900'} animate-in fade-in zoom-in-95 duration-200`}>
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-red-500 rounded-full bg-gray-100 dark:bg-gray-800 p-2">
          <X size={16} />
        </button>
        
        <div>
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-2xl text-red-600">
              <User size={28} />
            </div>
            <h3 className="text-2xl font-black">
              {lang === 'uz' ? 'Ro\'yxatdan o\'tish' : 'Регистрация'}
            </h3>
            <p className="mt-1 text-xs opacity-60">
              {lang === 'uz' ? 'Ma\'lumotlaringizni kiriting' : 'Введите ваши данные'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Ism</label>
                <input 
                  required 
                  value={formData.firstName} 
                  onChange={e => setFormData({...formData, firstName: e.target.value})} 
                  className={inputCls} 
                  placeholder="Ali" 
                />
              </div>
              <div>
                <label className={labelCls}>Familiya</label>
                <input 
                  required 
                  value={formData.lastName} 
                  onChange={e => setFormData({...formData, lastName: e.target.value})} 
                  className={inputCls} 
                  placeholder="Valiyev" 
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Sharif (Otchistva)</label>
              <input 
                required 
                value={formData.patronymic} 
                onChange={e => setFormData({...formData, patronymic: e.target.value})} 
                className={inputCls} 
                placeholder="Ivanovich" 
              />
            </div>

            <div>
              <label className={labelCls}>Telefon raqam</label>
              <input 
                required 
                type="tel"
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
                className={inputCls} 
                placeholder="+998901234567" 
              />
            </div>

            <div>
              <label className={labelCls}>Yashash manzili</label>
              <textarea 
                required 
                rows={2}
                value={formData.address} 
                onChange={e => setFormData({...formData, address: e.target.value})} 
                className={`${inputCls} resize-none`} 
                placeholder="Ko'cha, uy raqami, xonadon..." 
              />
            </div>

            <button disabled={loading} type="submit" className="btn-glow mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 py-3.5 text-center font-black tracking-wide text-white shadow-lg hover:from-red-700 hover:to-red-800 transition disabled:opacity-70">
              {loading ? "Saqlanmoqda..." : (lang === 'uz' ? 'Profilni saqlash' : 'Сохранить профиль')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
