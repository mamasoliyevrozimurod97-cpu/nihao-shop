"use client";
import { fmt } from "@/lib/data";
import { useAppStore } from "@/lib/store";
import { T } from "@/lib/translations";
import { X, ShoppingCart, Zap, Star, Check, Heart, Share2, Clock, ArrowRight, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

export default function ProductModal({ p, isOpen, onClose, onSelectProduct }: { p: any, isOpen: boolean, onClose: () => void, onSelectProduct?: (p: any) => void }) {
  const { lang, addToCart, darkMode, products } = useAppStore();
  const t = T[lang];
  
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<any>(null);
  const [mainImage, setMainImage] = useState(p?.image);
  const [quantity, setQuantity] = useState(1);
  const [related, setRelated] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (p) {
        setMainImage(p.image);
        setSelectedVariant(null);
        setSelectedSize(null);
        setQuantity(1);
        if (scrollRef.current) scrollRef.current.scrollTop = 0;

        // Fetch related products from same category
        let rel = products.filter((item: any) => item.category === p.category && item.id !== p.id).slice(0, 5);
        
        // Fallback: If not enough related products, fill with featured
        if (rel.length < 4) {
            const featured = products.filter(item => item.isFeatured && item.id !== p.id && !rel.find(r => r.id === item.id)).slice(0, 5 - rel.length);
            rel = [...rel, ...featured];
        }
        setRelated(rel);
    }
  }, [p, products]);

  if (!isOpen || !p) return null;

  const currentPrice = selectedVariant?.price_override ? Number(selectedVariant.price_override) : p.price;
  const name = lang === "uz" ? p.nameUz : lang === "ru" ? p.nameRu : (p.nameEn || p.nameUz);

  // Split variants: image-based (Colors) and text-only (Sizes)
  const colorVariants = p.variants?.filter((v: any) => v.image_url) || [];
  const sizeVariants = p.variants?.filter((v: any) => !v.image_url) || [];

  const handleAdd = () => {
    const itemToAdd = {
        ...p,
        selectedVariant: selectedVariant,
        selectedSize: selectedSize,
        price: currentPrice,
        qty: quantity,
        displayName: name + (selectedVariant ? ` (${selectedVariant.name})` : '') + (selectedSize ? ` [${selectedSize.name}]` : '')
    };
    addToCart(itemToAdd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose} />
      
      <div className={`relative w-full max-w-4xl max-h-[92vh] md:max-h-[90vh] overflow-hidden rounded-t-[3rem] md:rounded-[3rem] shadow-2xl flex flex-col animate-in slide-in-from-bottom-20 duration-500 ${darkMode ? 'bg-gray-950 text-white' : 'bg-[#fcfdff] text-slate-900 border border-white'}`}>
        
        {/* Top Price Banner (Uzum Style) */}
        <div className="sticky top-0 z-30 bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6 text-white flex items-center justify-between shadow-lg">
           <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                 <span className="text-3xl font-black italic tracking-tighter">{fmt(currentPrice)}</span>
                 {p.oldPrice && <span className="text-sm font-bold opacity-60 line-through">{fmt(p.oldPrice)}</span>}
                 <span className="rounded-lg bg-pink-500 px-2 py-0.5 text-[10px] font-black uppercase">-{p.discount || 0}%</span>
              </div>
              <p className="text-[10px] font-black opacity-80 uppercase tracking-widest mt-1 italic">Uzum kartasi bilan oson to'lov</p>
           </div>
           <div className="flex gap-4">
              <button className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition"><Heart size={20} /></button>
              <button className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition"><Share2 size={20} /></button>
              <button onClick={onClose} className="rounded-full bg-white/20 p-2 text-white hover:bg-white/40 transition md:hidden"><X size={20} /></button>
           </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar pb-32">
           {/* Section 1: Hero Image (Mobile optimized) */}
           <div className="relative aspect-square w-full md:aspect-[16/9] overflow-hidden bg-white dark:bg-gray-900 border-b border-slate-50 dark:border-gray-800">
              <Image src={mainImage} alt={name} fill className="object-contain" priority />
              <button onClick={onClose} className="absolute right-6 top-6 z-30 hidden md:flex rounded-full bg-slate-100 p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"><X size={24} /></button>
           </div>

           {/* Section 2: Details */}
           <div className="px-8 py-10 md:px-14">
              <div className="flex items-center gap-2 mb-3">
                 <span className="rounded-lg bg-emerald-500 px-2 py-0.5 text-[8px] font-black tracking-widest text-white uppercase"><Check size={10} className="inline mr-1" /> ORIGINAL</span>
                 <ArrowRight size={10} className="text-slate-300" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.category}</span>
              </div>
              
              <h1 className="text-3xl font-black tracking-tighter leading-[1.1] mb-6 md:text-4xl italic">{name}</h1>
              
              <div className="flex items-center gap-3 mb-8">
                 <div className="flex items-center gap-1 rounded-xl bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 border border-orange-100 dark:border-orange-800/20">
                    <span className="text-base font-black text-orange-600">{p.rating || 5}</span>
                    <div className="flex items-center text-orange-500"><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /></div>
                 </div>
                 <span className="text-xs font-bold text-slate-400">{p.reviews || 28} ta sharh • 100+ ta buyurtma</span>
              </div>

              <div className="flex items-center gap-2 mb-10 py-3 px-4 rounded-2xl bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-800 text-purple-600">
                 <ShoppingBag size={18} />
                 <span className="text-xs font-black uppercase tracking-widest leading-none">Bu haftada 99 kishi sotib oldi</span>
              </div>

              {/* COLORS SECTION */}
              {colorVariants.length > 0 && (
                <div className="mb-10">
                   <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-5 italic flex items-baseline gap-2">Rang: <span className="text-slate-900 dark:text-white text-sm lowercase tracking-normal">{selectedVariant?.name || 'tanlang...'}</span></h3>
                   <div className="flex flex-wrap gap-4">
                      {colorVariants.map((v: any, i: number) => (
                        <button 
                          key={i}
                          onClick={() => { setSelectedVariant(v); setMainImage(v.image_url); }}
                          className={`relative h-24 w-20 overflow-hidden rounded-2xl border-4 transition-all active:scale-95 ${selectedVariant?.name === v.name ? 'border-red-500 scale-110 shadow-xl' : 'border-slate-100 dark:border-gray-800 hover:border-red-200'}`}
                        >
                           <Image src={v.image_url} alt={v.name} fill className="object-cover" />
                        </button>
                      ))}
                   </div>
                </div>
              )}

              {/* SIZES SECTION */}
              {sizeVariants.length > 0 && (
                <div className="mb-10">
                   <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-5 italic flex items-baseline gap-2">O'lcham: <span className="text-slate-900 dark:text-white text-sm uppercase tracking-normal">{selectedSize?.name || 'tanlang...'}</span></h3>
                   <div className="flex flex-wrap gap-3">
                      {sizeVariants.map((v: any, i: number) => (
                        <button 
                          key={i}
                          onClick={() => setSelectedSize(v)}
                          className={`min-w-[4rem] rounded-2xl border-2 px-6 py-4 text-sm font-black transition-all active:scale-90 ${selectedSize?.name === v.name ? 'border-red-600 bg-red-50 text-red-600 dark:bg-red-900/20' : 'border-slate-100 dark:border-gray-800 hover:border-red-300'}`}
                        >
                           {v.name}
                        </button>
                      ))}
                   </div>
                </div>
              )}

              <div className="mb-14">
                 <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 italic">Mahsulot tasnifi</h3>
                 <p className="text-base font-bold text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl whitespace-pre-line">{p.description || "Ushbu mahsulot haqida qo'shimcha ma'lumot mavjud emas."}</p>
              </div>

              {/* RECOMMENDED SECTION (ADVERTISING) */}
              {related.length > 0 && (
                <div className="border-t border-slate-100 dark:border-gray-800 pt-12">
                   <div className="mb-8 flex items-center justify-between">
                      <h3 className="text-xl font-black italic tracking-tighter uppercase">Sizga yoqishi mumkin</h3>
                      <div className="rounded-lg bg-red-100 dark:bg-red-900/30 px-2 py-1 text-[8px] font-black uppercase text-red-600 animate-pulse tracking-widest border border-red-200">REKLAMA</div>
                   </div>
                   <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar snap-x">
                      {related.map((r: any) => (
                        <div 
                          key={r.id} 
                          onClick={() => { if(onSelectProduct) onSelectProduct(r); }} 
                          className="min-w-[12rem] flex flex-col gap-3 group cursor-pointer animate-in fade-in slide-in-from-right-4 duration-500 snap-start"
                        >
                           <div className="relative aspect-square overflow-hidden rounded-[2.5rem] bg-white border-4 border-slate-50 dark:border-gray-900 shadow-md group-hover:bg-red-50 transition-colors">
                              <Image src={r.image} alt={r.nameUz} fill className="object-cover transition-transform group-hover:scale-110" />
                              <div className="absolute right-3 top-3 h-6 w-6 rounded-full bg-white/80 dark:bg-black/60 shadow-inner flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><ArrowRight size={14} className="text-red-500" /></div>
                           </div>
                           <div>
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{r.category}</div>
                              <div className="line-clamp-1 text-sm font-black text-slate-800 dark:text-white mt-1 group-hover:text-red-600 transition-colors tracking-tight">{r.nameUz}</div>
                              <div className="flex items-center gap-2 mt-1">
                                 <div className="text-base font-black text-red-600 italic tracking-tighter">{fmt(r.price)}</div>
                                 {r.oldPrice && <div className="text-[10px] font-bold line-through text-slate-300 italic">{fmt(r.oldPrice)}</div>}
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              )}
           </div>
        </div>

        {/* Sticky Weekly Discounts Banner (Mobile style) */}
        <div className="sticky bottom-[88px] md:bottom-0 z-40 bg-gradient-to-r from-purple-500 to-indigo-500 px-8 py-4 text-white flex items-center justify-between mx-4 md:mx-0 rounded-2xl md:rounded-none mb-4 md:mb-0 shadow-2xl">
            <div className="flex items-center gap-3">
               <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/20 text-white"><Clock size={20} /></div>
               <div>
                  <div className="text-xs font-black leading-tight">HAFTALIK CHEGIRMALAR</div>
                  <div className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Aksiya tugashiga oz qoldi</div>
               </div>
            </div>
            <div className="text-xl font-black italic tracking-tighter opacity-80">46:06:04</div>
        </div>

        {/* Fixed Footer Bar */}
        <div className="sticky bottom-0 z-50 bg-white dark:bg-gray-950 border-t border-slate-100 dark:border-gray-800 px-8 py-6 flex items-center gap-6 shadow-[0_-20px_50px_rgba(0,0,0,0.1)]">
           <div className="hidden md:flex items-center rounded-2xl border-2 border-slate-100 dark:border-gray-800 overflow-hidden">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-gray-900 transition">-</button>
              <span className="w-12 text-center font-black">{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-gray-900 transition">+</button>
           </div>
           <button 
             onClick={handleAdd}
             className="flex-1 flex items-center justify-center gap-4 rounded-3xl bg-red-600 py-6 text-lg font-black text-white shadow-2xl shadow-red-600/30 hover:bg-red-700 transition active:scale-95 group/btn"
           >
             <ShoppingCart size={24} className="group-hover/btn:-rotate-12 transition-transform" /> 
             <span>SAVATGA</span> 
             <span className="hidden md:inline opacity-40 mx-2">|</span>
             <span className="hidden md:inline italic">{(t as any).deliveryTomorrow || 'Ertaga'}</span>
           </button>
        </div>

      </div>
      <style jsx>{` .custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; } .no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } `}</style>
    </div>
  );
}
