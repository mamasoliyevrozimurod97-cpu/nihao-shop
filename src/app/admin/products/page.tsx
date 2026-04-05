"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Edit2, Trash2, X, Upload, Search, Star, Sparkles, Layers, Check, DollarSign, Database, Loader2 } from "lucide-react";
import { fmt } from "@/lib/data";
import { seedProductsData } from "@/lib/seedData";
import Image from "next/image";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");

  const [formData, setFormData] = useState({
    name_uz: '', name_ru: '', name_zh: '', name_en: '',
    price: 0, cost_price: 0, old_price: 0,
    image: '', category: 'all', stock: 0, description: '',
    is_new: true, is_featured: false,
    variants: [] as { name: string, stock: number, price_override: number | null, image_url?: string }[]
  });

  useEffect(() => {
    fetchProducts();
    const sub = supabase.channel('admin_products').on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchProducts).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  useEffect(() => {
    let result = products.filter(p => p.name_uz.toLowerCase().includes(search.toLowerCase()) || p.id.includes(search));
    if (catFilter !== "all") result = result.filter(p => p.category === catFilter);
    setFilteredProducts(result);
  }, [search, catFilter, products]);

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*, product_variants(*)').order('created_at', { ascending: false });
    if (data) {
      setProducts(data);
      setFilteredProducts(data);
    }
    setLoading(false);
  };

  const handleOpenModal = (product: any = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name_uz: product.name_uz, name_ru: product.name_ru || '', name_zh: product.name_zh || '', name_en: product.name_en || '',
        price: product.price, cost_price: product.cost_price || 0, old_price: product.old_price || 0,
        image: product.image, category: product.category || 'all', stock: product.stock || 0, description: product.description || '',
        is_new: product.is_new ?? true, is_featured: product.is_featured ?? false,
        variants: product.product_variants || []
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name_uz: '', name_ru: '', name_zh: '', name_en: '', price: 0, cost_price: 0, old_price: 0,
        image: '', category: 'all', stock: 0, description: '', is_new: true, is_featured: false, variants: []
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = { ...formData };
    delete (payload as any).variants; // Separate save

    let productId = editingProduct?.id;

    if (editingProduct) {
      await supabase.from('products').update(payload).eq('id', editingProduct.id);
    } else {
      const { data } = await supabase.from('products').insert([payload]).select().single();
      productId = data?.id;
    }

    if (productId) {
      // 1. Delete old variants
      await supabase.from('product_variants').delete().eq('product_id', productId);
      // 2. Insert new variants
      if (formData.variants.length > 0) {
        await supabase.from('product_variants').insert(
          formData.variants.map(v => ({ 
            product_id: productId, 
            name: v.name, 
            stock: v.stock, 
            price_override: v.price_override,
            image_url: v.image_url 
          }))
        );
      }
    }

    setIsModalOpen(false);
    fetchProducts();
  };

  const addVariant = () => setFormData({ ...formData, variants: [...formData.variants, { name: '', stock: 0, price_override: null }] });
  const removeVariant = (i: number) => setFormData({ ...formData, variants: formData.variants.filter((_, idx) => idx !== i) });

  const updateVariant = (i: number, field: string, val: any) => {
     const next = [...formData.variants];
     (next[i] as any)[field] = val;
     setFormData({ ...formData, variants: next });
  };

  const uploadVariantImg = async (i: number, file: File) => {
    if (!file) return;
    const path = `variant-images/${Date.now()}-${file.name}`;
    await supabase.storage.from('products').upload(path, file);
    const { data } = supabase.storage.from('products').getPublicUrl(path);
    updateVariant(i, 'image_url', data.publicUrl);
  };

  const uploadImg = async (e: any) => {
     const file = e.target.files[0];
     if (!file) return;
     const path = `product-images/${Date.now()}-${file.name}`;
     await supabase.storage.from('products').upload(path, file);
     const { data } = supabase.storage.from('products').getPublicUrl(path);
     setFormData({ ...formData, image: data.publicUrl });
  };

  const handleSeed = async () => {
    if (!confirm("Diqqat! Bu amal bazaga 27 ta yangi mahsulot qo'shadi. Davom etasizmi?")) return;
    setIsSeeding(true);

    // Prepare all products for bulk insert
    const productsToInsert = seedProductsData.map(({ variants, ...p }) => ({
      name_uz: p.name_uz,
      name_ru: p.name_uz,
      name_zh: p.name_uz,
      name_en: p.name_uz,
      price: p.price,
      old_price: p.old_price ?? null,
      image: p.image,
      category: p.category,
      stock: 50,
      is_new: true,
      is_featured: p.is_featured ?? false,
      description: `Ushbu ${p.name_uz} mahsuloti yuqori sifatli va zamonaviy dizaynga ega.`,
    }));

    const { data: insertedProducts, error: prodError } = await supabase
      .from('products')
      .insert(productsToInsert)
      .select();

    if (prodError) {
      alert(`Xatolik: ${prodError.message}`);
      setIsSeeding(false);
      return;
    }

    // Insert variants for products that have them
    if (insertedProducts && insertedProducts.length > 0) {
      const allVariants: any[] = [];
      insertedProducts.forEach((newProd, idx) => {
        const original = seedProductsData[idx];
        if (original.variants && original.variants.length > 0) {
          original.variants.forEach((v: any) => {
            allVariants.push({
              product_id: newProd.id,
              name: v.name,
              image_url: v.image_url || null,
              stock: 20,
            });
          });
        }
      });

      if (allVariants.length > 0) {
        const { error: varError } = await supabase.from('product_variants').insert(allVariants);
        if (varError) {
          alert(`Variantlarda xatolik: ${varError.message}`);
        }
      }
    }

    alert(`✅ ${insertedProducts?.length ?? 0} ta mahsulot muvaffaqiyatli qo'shildi!`);
    setIsSeeding(false);
    fetchProducts();
  };

  if (loading && products.length === 0) return <div className="flex h-[60vh] items-center justify-center font-black animate-pulse text-slate-300">Mahsulotlar yuklanmoqda...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Katalog <span className="text-red-600">({filteredProducts.length})</span></h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Sizning maxsulotlaringiz</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Maxsulot qidirish..." className="h-12 w-64 rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm font-bold outline-none focus:border-red-500" />
           </div>
           
           <button 
             onClick={handleSeed} 
             disabled={isSeeding}
             className="flex items-center gap-2 rounded-2xl bg-amber-500 px-6 py-3 text-sm font-black text-white shadow-xl shadow-amber-100 transition hover:bg-amber-600 active:scale-95 disabled:opacity-50"
           >
             {isSeeding ? <Loader2 className="animate-spin" size={20} /> : <Database size={20} />}
             <span>Bazani to'ldirish</span>
           </button>

           <button onClick={() => handleOpenModal()} className="flex items-center gap-2 rounded-2xl bg-red-600 px-6 py-3 text-sm font-black text-white shadow-xl shadow-red-100 transition hover:bg-red-700 active:scale-95"><Plus size={20} /> Yangi Qo'shish</button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[2.5rem] border border-white bg-white/50 backdrop-blur-md shadow-2xl shadow-slate-200/40">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-black tracking-[0.2em]">
            <tr>
              <th className="p-8">Rasm / Nomi</th>
              <th className="p-8">Kategoriya</th>
              <th className="p-8">Narxi</th>
              <th className="p-8">Zaxira</th>
              <th className="p-8">Status</th>
              <th className="p-8 text-right">Amal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.map((p) => (
              <tr key={p.id} className="group transition hover:bg-white">
                <td className="p-8">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 overflow-hidden rounded-2xl bg-slate-100 border border-slate-50 shadow-inner"><Image src={p.image} alt={p.name_uz} width={80} height={80} className="h-full w-full object-cover" /></div>
                    <div>
                      <div className="font-black text-slate-900 mb-1">{p.name_uz}</div>
                      <div className="flex gap-2">
                        {p.is_featured && <span className="flex items-center gap-1 rounded-lg bg-orange-50 px-2 py-0.5 text-[8px] font-black text-orange-600 uppercase tracking-widest border border-orange-100"><Star size={8} fill="currentColor" /> Top</span>}
                        {p.is_new && <span className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-0.5 text-[8px] font-black text-emerald-600 uppercase tracking-widest border border-emerald-100"><Sparkles size={8} fill="currentColor" /> Yangi</span>}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-8"><span className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.category}</span></td>
                <td className="p-8">
                   <div className="font-black text-red-600">{fmt(p.price)}</div>
                   {p.old_price > 0 && <div className="text-[10px] line-through text-slate-300 font-bold">{fmt(p.old_price)}</div>}
                </td>
                <td className="p-8">
                   <div className={`text-xs font-black ${p.stock < 10 ? 'text-orange-500' : 'text-slate-900'}`}>{p.stock} dona</div>
                   {p.product_variants?.length > 0 && <div className="text-[10px] font-bold text-slate-400">{p.product_variants.length} xil variant</div>}
                </td>
                <td className="p-8">
                   <div className="flex items-center gap-1 text-emerald-500 font-black text-[10px] uppercase tracking-widest"><Check size={14} /> Sotuvda</div>
                </td>
                <td className="p-8 text-right">
                   <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenModal(p)} className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition border border-slate-100"><Edit2 size={16} /></button>
                      <button onClick={async () => { if(confirm("O'chirilsinmi?")) await supabase.from('products').delete().eq('id', p.id); fetchProducts(); }} className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 transition border border-slate-100"><Trash2 size={16} /></button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-[3rem] bg-[#f8faff] shadow-2xl animate-in zoom-in-95 duration-300">
             <form onSubmit={handleSave} className="flex h-full flex-col">
                <div className="flex h-20 items-center justify-between border-b border-slate-100 bg-white px-10">
                   <h2 className="text-2xl font-black text-slate-900">{editingProduct ? "Maxsulotni Tahrirlash" : "Yangi Maxsulot Qo'shish"}</h2>
                   <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-full bg-slate-50 p-2 text-slate-400"><X size={24} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                   <div className="grid grid-cols-3 gap-10">
                      {/* Left: Image & Promos */}
                      <div className="space-y-6">
                         <div className="relative aspect-square w-full overflow-hidden rounded-[2.5rem] border-8 border-white bg-slate-50 shadow-xl group">
                            {formData.image ? <Image src={formData.image} alt="Preview" fill className="object-cover" /> : <div className="flex h-full items-center justify-center text-slate-200"><Upload size={60} /></div>}
                            <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                               <input type="file" className="hidden" onChange={uploadImg} />
                               <span className="rounded-xl bg-white px-4 py-2 text-xs font-black uppercase text-slate-900">Rasm Yuklash</span>
                            </label>
                         </div>

                         {/* URL orqali rasm */}
                         <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Yoki Rasm URL</label>
                           <div className="flex gap-2">
                             <input
                               type="url"
                               placeholder="https://example.com/image.jpg"
                               value={formData.image}
                               onChange={e => setFormData({...formData, image: e.target.value})}
                               className="flex-1 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-xs font-bold outline-none focus:border-red-500 shadow-sm"
                             />
                             {formData.image && (
                               <button type="button" onClick={() => setFormData({...formData, image: ''})} className="rounded-2xl border border-slate-100 bg-white px-3 py-3 text-slate-400 hover:text-red-500 transition">
                                 <X size={16} />
                               </button>
                             )}
                           </div>
                         </div>

                         <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100 space-y-4">
                            <label className="flex items-center justify-between cursor-pointer group">
                               <span className="text-sm font-black text-slate-600 transition group-hover:text-red-600">Top Maxsulot</span>
                               <input type="checkbox" checked={formData.is_featured} onChange={e=>setFormData({...formData, is_featured: e.target.checked})} className="h-5 w-5 accent-red-600" />
                            </label>
                            <label className="flex items-center justify-between cursor-pointer group">
                               <span className="text-sm font-black text-slate-600 transition group-hover:text-red-600">Yangi Maxsulot</span>
                               <input type="checkbox" checked={formData.is_new} onChange={e=>setFormData({...formData, is_new: e.target.checked})} className="h-5 w-5 accent-red-600" />
                            </label>
                         </div>
                      </div>

                      {/* Middle: Details */}
                      <div className="col-span-2 space-y-8">
                         <div className="grid grid-cols-2 gap-4">
                            <InputField label="Nom (UZ)" value={formData.name_uz} onChange={(v: string)=>setFormData({...formData, name_uz: v})} />
                            <InputField label="Nom (RU)" value={formData.name_ru} onChange={(v: string)=>setFormData({...formData, name_ru: v})} />
                            <div className="col-span-2"><InputField label="Tavsif" textarea value={formData.description} onChange={(v: string)=>setFormData({...formData, description: v})} /></div>
                            <InputField label="Narxi (So'm)" type="number" value={formData.price} onChange={(v: string)=>setFormData({...formData, price: Number(v)})} icon={<DollarSign size={16} />} />
                            <InputField label="Eski Narxi" type="number" value={formData.old_price} onChange={(v: string)=>setFormData({...formData, old_price: Number(v)})} />
                            <InputField label="Umumiy Zaxira (Stock)" type="number" value={formData.stock} onChange={(v: string)=>setFormData({...formData, stock: Number(v)})} />
                            <div className="space-y-2">
                               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Kategoriya</label>
                               <select value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})} className="w-full rounded-2xl border border-slate-100 bg-white p-4 text-sm font-bold outline-none focus:border-red-500 shadow-sm">
                                  <option value="all">Tanlang...</option>
                                  <option value="electronics">Elektronika</option>
                                  <option value="clothing">Kiyim-kechak</option>
                                  <option value="food">Oziq-ovqat</option>
                               </select>
                            </div>
                         </div>

                         {/* Variants Section */}
                         <div className="space-y-4 pt-6 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                               <h3 className="text-lg font-black text-slate-800 flex items-center gap-2"><Layers size={20} className="text-red-500" /> Razmer / Rang Variantlari</h3>
                               <button type="button" onClick={addVariant} className="rounded-xl bg-slate-900 px-4 py-2 text-[10px] font-black text-white hover:bg-slate-800 transition uppercase tracking-widest">Variant qo'shish</button>
                            </div>
                            <div className="space-y-3">
                               {formData.variants.map((v, i) => (
                                 <div key={i} className="flex items-center gap-3 animate-in slide-in-from-right-4 duration-300">
                                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-200 group">
                                       {v.image_url ? <Image src={v.image_url} alt="Variant" fill className="object-cover" /> : <div className="flex h-full items-center justify-center text-slate-300"><Upload size={16} /></div>}
                                       <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <input type="file" className="hidden" onChange={(e)=>e.target.files && uploadVariantImg(i, e.target.files[0])} />
                                          <span className="text-[8px] font-black uppercase text-white">Yo'q</span>
                                       </label>
                                    </div>
                                    <input placeholder="Nomi (M, L, Qizil...)" value={v.name} onChange={e=>updateVariant(i, 'name', e.target.value)} className="flex-1 rounded-xl border border-slate-200 bg-white p-3 text-xs font-bold outline-none focus:border-red-500" />
                                    <input type="number" placeholder="Zaxira" value={v.stock} onChange={e=>updateVariant(i, 'stock', Number(e.target.value))} className="w-24 rounded-xl border border-slate-200 bg-white p-3 text-xs font-bold outline-none focus:border-red-500" />
                                    <input type="number" placeholder="Narx (Perekrit)" value={v.price_override || ''} onChange={e=>updateVariant(i, 'price_override', e.target.value ? Number(e.target.value) : null)} className="w-32 rounded-xl border border-slate-200 bg-white p-3 text-xs font-bold outline-none focus:border-red-500" />
                                    <button type="button" onClick={()=>removeVariant(i)} className="p-3 text-slate-300 hover:text-red-500 transition"><X size={18} /></button>
                                 </div>
                               ))}
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="flex h-24 items-center justify-end gap-4 border-t border-slate-100 bg-white px-10 shadow-2xl">
                   <button type="button" onClick={()=>setIsModalOpen(false)} className="rounded-2xl border-2 border-slate-100 px-8 py-3 text-sm font-black text-slate-400 hover:bg-slate-50 transition">Bekor qilish</button>
                   <button type="submit" className="rounded-2xl bg-red-600 px-12 py-3 text-sm font-black text-white shadow-xl shadow-red-100 hover:bg-red-700 transition">Saqlash</button>
                </div>
             </form>
          </div>
        </div>
      )}

      <style jsx>{` .custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; } `}</style>
    </div>
  );
}

function InputField({ label, value, onChange, type = "text", textarea = false, icon = null }: any) {
  return (
    <div className="space-y-2">
       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">{label}</label>
       <div className="relative">
          {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
          {textarea ? (
            <textarea value={value} onChange={e=>onChange(e.target.value)} rows={3} className="w-full rounded-2xl border border-slate-100 bg-white p-4 text-sm font-bold outline-none focus:border-red-500 shadow-sm resize-none" />
          ) : (
            <input type={type} value={value} onChange={e=>onChange(e.target.value)} className={`w-full rounded-2xl border border-slate-100 bg-white p-4 text-sm font-bold outline-none focus:border-red-500 shadow-sm ${icon ? 'pl-10' : ''}`} />
          )}
       </div>
    </div>
  );
}
