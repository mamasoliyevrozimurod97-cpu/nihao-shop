"use client";
import { useAppStore } from "@/lib/store";
import { T } from "@/lib/translations";
import { X, User } from "lucide-react";
import { useState, useEffect } from "react";

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { lang, darkMode, localProfile, setLocalProfile } = useAppStore();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    patronymic: '',
    phone: '+998',
    address: ''
  });

  useEffect(() => {
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
    
    if (!formData.firstName || !formData.lastName || !formData.patronymic || !formData.phone || !formData.address) {
      alert(lang === 'uz' ? "Iltimos, barcha maydonlarni to'ldiring" : "Пожалуйста, заполните все поля");
      setLoading(false);
      return;
    }

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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className={`relative w-full max-w-sm overflow-hidden rounded-[2rem] shadow-2xl p-8 ${darkMode ? 'bg-gray-900 border border-gray-800 text-gray-100' : 'bg-white text-gray-900'} animate-in fade-in zoom-in-95 duration-200`}>
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-red-500 rounded-full bg-gray-100 dark:bg-gray-800 p-2">
          <X size={16} />
        </button>
        
        {localProfile ? (
          <div className="flex flex-col">
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-2xl text-red-600">
                <User size={28} />
              </div>
              <h3 className="text-2xl font-black">
                {lang === 'uz' ? 'Profilingiz' : 'Ваш Профиль'}
              </h3>
            </div>
            
            <div className="mb-6 rounded-2xl bg-gray-50 dark:bg-gray-800 p-4">
              <p className="text-xs opacity-60 mb-1">Ma'lumotlar saqlandi:</p>
              <p className="font-bold truncate text-red-600 text-lg">{localProfile.firstName} {localProfile.lastName}</p>
              <p className="text-sm opacity-80">{localProfile.phone}</p>
            </div>

            <button 
              onClick={() => { localStorage.removeItem('nihao_profile'); setLocalProfile(undefined); setFormData({ firstName: '', lastName: '', patronymic: '', phone: '+998', address: '' }); }} 
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-100 dark:bg-gray-800 py-4 text-sm font-bold text-red-600 transition hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              🚪 {lang === 'uz' ? 'Profilni tozalash' : 'Очистить профиль'}
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-2xl text-red-600">
                <User size={28} />
              </div>
              <h3 className="text-2xl font-black">
                {lang === 'uz' ? 'Ro\'yxatdan o\'tish' : 'Регистрация'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Ism</label>
                  <input required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className={inputCls} placeholder="Ali" />
                </div>
                <div>
                  <label className={labelCls}>Familiya</label>
                  <input required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className={inputCls} placeholder="Valiyev" />
                </div>
              </div>

              <div>
                <label className={labelCls}>Sharif (Otchistva)</label>
                <input required value={formData.patronymic} onChange={e => setFormData({...formData, patronymic: e.target.value})} className={inputCls} placeholder="Ivanovich" />
              </div>

              <div>
                <label className={labelCls}>Telefon raqam</label>
                <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={inputCls} placeholder="+99890..." />
              </div>

              <div>
                <label className={labelCls}>Yashash manzili</label>
                <textarea required rows={2} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className={`${inputCls} resize-none`} placeholder="Manzil..." />
              </div>

              <button disabled={loading} type="submit" className="btn-glow mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 py-4 text-center font-black text-white shadow-lg transition disabled:opacity-70">
                {loading ? "Saqlanmoqda..." : (lang === 'uz' ? 'Profilni saqlash' : 'Сохранить профиль')}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
