"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Layers, Plus, Edit2, Trash2, CheckCircle, XCircle, Image as ImageIcon, Save, X } from "lucide-react";

export default function BannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);

  const fetchBanners = async () => {
    const { data } = await supabase.from('banners').select('*').order('created_at', { ascending: false });
    if (data) setBanners(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(formData.entries());

    if (editingBanner) {
      await supabase.from('banners').update(data).eq('id', editingBanner.id);
    } else {
      await supabase.from('banners').insert([data]);
    }

    setShowModal(false);
    setEditingBanner(null);
    fetchBanners();
  };

  const toggleActive = async (id: string, current: boolean) => {
    if (!current) {
        // Deactivate all first (since we only want one active)
        await supabase.from('banners').update({ is_active: false }).neq('id', id);
        // Activate the chosen one
        await supabase.from('banners').update({ is_active: true }).eq('id', id);
    } else {
        await supabase.from('banners').update({ is_active: false }).eq('id', id);
    }
    fetchBanners();
  };

  const deleteBanner = async (id: string) => {
    if (confirm("Haqiqatdan ham o'chirmoqchimisiz?")) {
      await supabase.from('banners').delete().eq('id', id);
      fetchBanners();
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center font-black animate-pulse text-slate-300">Yuklanmoqda...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Layers className="text-red-600" /> Bosh sahifa Bannerlari
          </h1>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest text-[10px]">Asosiy sahifadagi hero bo'limini boshqarish</p>
        </div>
        <button 
          onClick={() => { setEditingBanner(null); setShowModal(true); }}
          className="flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-xs font-black text-white shadow-xl hover:bg-slate-800 transition active:scale-95"
        >
          <Plus size={18} /> Yangi Banner
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {banners.map((b) => (
          <div key={b.id} className={`group relative rounded-[2.5rem] bg-white p-6 shadow-xl border-2 transition-all ${b.is_active ? 'border-emerald-500/30' : 'border-white'}`}>
            <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditingBanner(b); setShowModal(true); }} className="p-2 rounded-full bg-white/90 shadow-md hover:bg-slate-50 text-slate-600"><Edit2 size={14}/></button>
                <button onClick={() => deleteBanner(b.id)} className="p-2 rounded-full bg-white/90 shadow-md hover:bg-red-50 text-red-600"><Trash2 size={14}/></button>
            </div>

            <div className="relative aspect-video w-full rounded-[2rem] bg-slate-100 overflow-hidden mb-5">
                <img src={b.image_url} alt="Banner" className="h-full w-full object-cover" />
                {b.is_active && (
                    <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-black text-white shadow-lg">
                        <CheckCircle size={12} /> ACTIVE
                    </div>
                )}
            </div>

            <h3 className="text-lg font-black text-slate-800 mb-1">{b.title_uz}</h3>
            <p className="text-xs font-bold text-slate-400 mb-6 truncate">{b.subtitle_uz}</p>

            <button 
                onClick={() => toggleActive(b.id, b.is_active)}
                className={`w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${b.is_active ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
            >
                {b.is_active ? 'Faolsizlantirish' : 'Faollashtirish'}
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] bg-white p-10 shadow-2xl">
            <button onClick={() => setShowModal(false)} className="absolute right-8 top-8 text-slate-400 hover:text-slate-600"><X /></button>
            
            <h2 className="mb-8 text-2xl font-black text-slate-900">{editingBanner ? 'Bannerni tahrirlash' : 'Yangi banner qo\'shish'}</h2>
            
            <form onSubmit={handleSave} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Image Section */}
                <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Asosiy Rasm URL</label>
                    <div className="flex gap-4">
                        <input name="image_url" defaultValue={editingBanner?.image_url} required placeholder="https://..." className="flex-1 rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 text-sm font-bold focus:border-red-500 focus:outline-none" />
                        <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300"><ImageIcon /></div>
                    </div>
                </div>

                {/* Uzbek Section */}
                <div className="p-6 rounded-[2rem] bg-slate-50 space-y-4">
                    <p className="font-black text-xs text-slate-400 uppercase tracking-widest flex items-center gap-2">🇺🇿 O'zbekcha</p>
                    <input name="title_uz" defaultValue={editingBanner?.title_uz} required placeholder="Sarlavha" className="w-full rounded-xl border border-white bg-white px-4 py-3 text-sm font-bold focus:border-red-500 focus:outline-none" />
                    <input name="subtitle_uz" defaultValue={editingBanner?.subtitle_uz} required placeholder="Pastki matn" className="w-full rounded-xl border border-white bg-white px-4 py-3 text-sm font-bold focus:border-red-500 focus:outline-none" />
                    <input name="button_text_uz" defaultValue={editingBanner?.button_text_uz} required placeholder="Tugma matni" className="w-full rounded-xl border border-white bg-white px-4 py-3 text-sm font-bold focus:border-red-500 focus:outline-none" />
                    <div className="grid grid-cols-2 gap-2">
                        <input name="product_name_uz" defaultValue={editingBanner?.product_name_uz} placeholder="Mahsulot nomi" className="rounded-xl border border-white bg-white px-4 py-3 text-xs font-bold focus:border-red-500 focus:outline-none" />
                        <input name="product_tag_uz" defaultValue={editingBanner?.product_tag_uz} placeholder="Mahsulot teg (ex: Eksklyuziv)" className="rounded-xl border border-white bg-white px-4 py-3 text-xs font-bold focus:border-red-500 focus:outline-none" />
                    </div>
                </div>

                {/* Russian Section */}
                <div className="p-6 rounded-[2rem] bg-slate-50 space-y-4 text-slate-500">
                    <p className="font-black text-xs text-slate-400 uppercase tracking-widest flex items-center gap-2">🇷🇺 Ruscha</p>
                    <input name="title_ru" defaultValue={editingBanner?.title_ru} required placeholder="Заголовок" className="w-full rounded-xl border border-white bg-white px-4 py-3 text-sm font-bold focus:border-red-500 focus:outline-none" />
                    <input name="subtitle_ru" defaultValue={editingBanner?.subtitle_ru} required placeholder="Подзаголовок" className="w-full rounded-xl border border-white bg-white px-4 py-3 text-sm font-bold focus:border-red-500 focus:outline-none" />
                    <input name="button_text_ru" defaultValue={editingBanner?.button_text_ru} required placeholder="Текст кнопки" className="w-full rounded-xl border border-white bg-white px-4 py-3 text-sm font-bold focus:border-red-500 focus:outline-none" />
                    <div className="grid grid-cols-2 gap-2">
                        <input name="product_name_ru" defaultValue={editingBanner?.product_name_ru} placeholder="Имя продукта" className="rounded-xl border border-white bg-white px-4 py-3 text-xs font-bold focus:border-red-500 focus:outline-none" />
                        <input name="product_tag_ru" defaultValue={editingBanner?.product_tag_ru} placeholder="Тэг продукта" className="rounded-xl border border-white bg-white px-4 py-3 text-xs font-bold focus:border-red-500 focus:outline-none" />
                    </div>
                </div>

                {/* English Section */}
                <div className="p-6 rounded-[2rem] bg-slate-50 space-y-4">
                    <p className="font-black text-xs text-slate-400 uppercase tracking-widest flex items-center gap-2">🇺🇸 English</p>
                    <input name="title_en" defaultValue={editingBanner?.title_en} required placeholder="Title" className="w-full rounded-xl border border-white bg-white px-4 py-3 text-sm font-bold focus:border-red-500 focus:outline-none" />
                    <input name="subtitle_en" defaultValue={editingBanner?.subtitle_en} required placeholder="Subtitle" className="w-full rounded-xl border border-white bg-white px-4 py-3 text-sm font-bold focus:border-red-500 focus:outline-none" />
                    <input name="button_text_en" defaultValue={editingBanner?.button_text_en} required placeholder="Button text" className="w-full rounded-xl border border-white bg-white px-4 py-3 text-sm font-bold focus:border-red-500 focus:outline-none" />
                    <div className="grid grid-cols-2 gap-2">
                        <input name="product_name_en" defaultValue={editingBanner?.product_name_en} placeholder="Product Name" className="rounded-xl border border-white bg-white px-4 py-3 text-xs font-bold focus:border-red-500 focus:outline-none" />
                        <input name="product_tag_en" defaultValue={editingBanner?.product_tag_en} placeholder="Product Tag" className="rounded-xl border border-white bg-white px-4 py-3 text-xs font-bold focus:border-red-500 focus:outline-none" />
                    </div>
                </div>

                {/* Chinese Section */}
                <div className="p-6 rounded-[2rem] bg-slate-50 space-y-4">
                    <p className="font-black text-xs text-slate-400 uppercase tracking-widest flex items-center gap-2">🇨🇳 Chinese</p>
                    <input name="title_zh" defaultValue={editingBanner?.title_zh} required placeholder="标题" className="w-full rounded-xl border border-white bg-white px-4 py-3 text-sm font-bold focus:border-red-500 focus:outline-none" />
                    <input name="subtitle_zh" defaultValue={editingBanner?.subtitle_zh} required placeholder="副标题" className="w-full rounded-xl border border-white bg-white px-4 py-3 text-sm font-bold focus:border-red-500 focus:outline-none" />
                    <input name="button_text_zh" defaultValue={editingBanner?.button_text_zh} required placeholder="按钮文字" className="w-full rounded-xl border border-white bg-white px-4 py-3 text-sm font-bold focus:border-red-500 focus:outline-none" />
                    <div className="grid grid-cols-2 gap-2">
                        <input name="product_name_zh" defaultValue={editingBanner?.product_name_zh} placeholder="产品名称" className="rounded-xl border border-white bg-white px-4 py-3 text-xs font-bold focus:border-red-500 focus:outline-none" />
                        <input name="product_tag_zh" defaultValue={editingBanner?.product_tag_zh} placeholder="产品标签" className="rounded-xl border border-white bg-white px-4 py-3 text-xs font-bold focus:border-red-500 focus:outline-none" />
                    </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-2xl border border-slate-100 bg-white px-8 py-4 text-xs font-black text-slate-500 hover:bg-slate-50 transition active:scale-95">Bekor qilish</button>
                <button type="submit" className="flex items-center gap-2 rounded-2xl bg-red-600 px-10 py-4 text-xs font-black text-white shadow-xl shadow-red-600/20 hover:bg-red-700 transition active:scale-95">
                    <Save size={18} /> Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
