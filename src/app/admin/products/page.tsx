"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Edit2, Trash2, X, Upload } from "lucide-react";
import { fmt } from "@/lib/data";
import Image from "next/image";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name_uz: '',
    name_ru: '',
    name_zh: '',
    name_en: '',
    price: 0,
    cost_price: 0,
    image: '',
    category: '',
    stock: 0,
    description: ''
  });

  useEffect(() => {
    fetchProducts();
    const sub = supabase.channel('admin_products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchProducts)
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  };

  const handleOpenModal = (product: any = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name_uz: product.name_uz,
        name_ru: product.name_ru || '',
        name_zh: product.name_zh || '',
        name_en: product.name_en || '',
        price: product.price,
        cost_price: product.cost_price || 0,
        image: product.image,
        category: product.category || '',
        stock: product.stock || 0,
        description: product.description || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name_uz: '', name_ru: '', name_zh: '', name_en: '',
        price: 0, cost_price: 0, image: '', category: '', stock: 0, description: ''
      });
    }
    setIsModalOpen(true);
  };

  const [uploading, setUploading] = useState(false);

  // Handle Image Upload to Supabase Storage
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const filePath = `product-images/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file, { 
          cacheControl: '3600',
          upsert: false 
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      if (data?.publicUrl) {
        console.log("✅ Rasm yuklandi:", data.publicUrl);
        setFormData(prev => ({ ...prev, image: data.publicUrl }));
      }
    } catch (error: any) {
      console.error("❌ Yuklashda xato:", error);
      alert("Rasm yuklashda xatolik yuz berdi: " + (error.message || "Noma'lum xato"));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Filter formData to only include columns in the SQL schema
    const savePayload = {
      name_uz: formData.name_uz,
      name_ru: formData.name_ru,
      name_zh: formData.name_zh,
      name_en: formData.name_en,
      price: formData.price,
      image: formData.image,
      category: formData.category,
      stock: formData.stock,
      description: formData.description
    };

    if (editingProduct) {
      await supabase.from('products').update(savePayload).eq('id', editingProduct.id);
    } else {
      await supabase.from('products').insert([savePayload]);
    }

    setIsModalOpen(false);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Ushbu mahsulotni o'chirishni xohlaysizmi?")) {
      await supabase.from('products').delete().eq('id', id);
    }
  };

  if (loading && products.length === 0) return <div className="p-8 text-center animate-pulse text-xl font-black">Mahsulotlar yuklanmoqda...</div>;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-black text-gray-900 tracking-tight">Mahsulotlar</h1>
           <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Jami: {products.length} ta mahsulot</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 rounded-2xl bg-red-600 px-6 py-3 text-sm font-black text-white shadow-xl shadow-red-200 transition hover:bg-red-700 hover:scale-105 active:scale-95"
        >
          <Plus size={20} /> Yangi qo'shish
        </button>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-2xl shadow-gray-200/50">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/50 text-gray-400 uppercase text-[10px] font-black tracking-widest">
            <tr>
              <th className="p-6">Mahsulot</th>
              <th className="p-6">Kategoriya</th>
              <th className="p-6">Narxi</th>
              <th className="p-6">Zaxira (Stock)</th>
              <th className="p-6 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map((p) => (
              <tr key={p.id} className="group transition hover:bg-gray-50/80">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-gray-100 shadow-inner">
                      <Image src={p.image} alt={p.nameUz} fill className="object-cover transition group-hover:scale-110" />
                    </div>
                    <div>
                      <div className="font-black text-gray-900 text-base">{p.name_uz}</div>
                      <div className="text-[10px] text-gray-400 font-bold">{p.id.slice(0,8)}</div>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                   <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-[11px] font-black text-gray-600 uppercase tracking-wider">{p.category}</span>
                </td>
                <td className="p-6 font-black text-red-600 text-base">{fmt(p.price)}</td>
                <td className="p-6">
                  <span className={`inline-flex items-center rounded-xl px-3 py-1 text-xs font-bold ${p.stock > 10 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {p.stock} dona
                  </span>
                </td>
                <td className="p-6 text-right">
                  <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(p)} className="rounded-xl p-2.5 text-blue-600 hover:bg-blue-50 transition shadow-sm bg-white border border-blue-100">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="rounded-xl p-2.5 text-red-600 hover:bg-red-50 transition shadow-sm bg-white border border-red-100">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            <div className={`p-8 ${formData.category === 'Electronics' ? 'bg-blue-600' : 'bg-red-600'} text-white flex items-center justify-between`}>
              <h2 className="text-2xl font-black">{editingProduct ? "Mahsulotni tahrirlash" : "Yangi mahsulot"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="rounded-full bg-white/20 p-2 hover:bg-white/30 transition">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2 space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest opacity-40">Mahsulot Nomi (UZ/RU/ZH/EN)</label>
                  <div className="grid grid-cols-2 gap-4">
                    <input required placeholder="Nom (UZ)" className="modal-input" value={formData.name_uz} onChange={e => setFormData({...formData, name_uz: e.target.value})} />
                    <input placeholder="Nom (RU)" className="modal-input" value={formData.name_ru} onChange={e => setFormData({...formData, name_ru: e.target.value})} />
                    <input placeholder="Nom (ZH)" className="modal-input" value={formData.name_zh} onChange={e => setFormData({...formData, name_zh: e.target.value})} />
                    <input placeholder="Nom (EN)" className="modal-input" value={formData.name_en} onChange={e => setFormData({...formData, name_en: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest opacity-40">Kategoriya</label>
                  <select className="modal-input w-full" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="">Tanlang...</option>
                    <option value="electronics">Elektronika</option>
                    <option value="clothing">Kiyim-kechak</option>
                    <option value="home_goods">Uy jihozlari</option>
                    <option value="food">Oziq-ovqatlar</option>
                    <option value="sports">Sport anjomlari</option>
                    <option value="beauty">Go'zallik va parvarish</option>
                    <option value="toys">O'yinchoqlar</option>
                    <option value="construction">Qurilish mollari</option>
                    <option value="accessories">Aksessuarlar</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest opacity-40">Narxi (So'm)</label>
                  <input required type="number" className="modal-input" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest opacity-40">Tannarxi (Cost Price)</label>
                  <input required type="number" className="modal-input border-blue-200" value={formData.cost_price} onChange={e => setFormData({...formData, cost_price: Number(e.target.value)})} />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest opacity-40">Zaxira soni (Stock)</label>
                  <input required type="number" className="modal-input" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest opacity-40">Rasm Yuklash</label>
                  <div className="flex gap-2">
                     <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-gray-300 p-3 hover:bg-gray-50 transition border-2">
                        <Upload size={18} className="text-red-500" />
                        <span className="text-xs font-bold text-gray-500 truncate">
                          {uploading ? "Yuklanmoqda..." : (formData.image ? "Rasm tayyor ✅" : "Kompyuterdan tanlash")}
                        </span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                     </label>
                  </div>
                  {formData.image && (
                    <div className="mt-2 relative h-20 w-32 overflow-hidden rounded-xl border">
                      <Image src={formData.image} alt="Preview" fill className="object-cover" />
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest opacity-40">Tavsif (Description)</label>
                  <textarea rows={3} className="modal-input w-full resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-2xl bg-gray-100 py-4 font-black transition hover:bg-gray-200">Bekor qilish</button>
                 <button type="submit" disabled={loading || uploading} className="flex-1 rounded-2xl bg-red-600 py-4 font-black text-white shadow-xl shadow-red-100 transition hover:bg-red-700 disabled:opacity-50">
                   {loading ? "Saqlanmoqda..." : (editingProduct ? "O'zgarishlarni saqlash" : "Mahsulotni qo'shish")}
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .modal-input {
          width: 100%;
          border-radius: 1rem;
          border: 1px solid #e5e7eb;
          padding: 0.75rem 1rem;
          font-weight: 600;
          outline: none;
          transition: all 0.2s;
        }
        .modal-input:focus {
          border-color: #ef4444;
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
      `}</style>
    </div>
  );
}
