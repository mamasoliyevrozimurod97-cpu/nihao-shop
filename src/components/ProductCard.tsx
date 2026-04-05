"use client";
import { Product, fmt } from "@/lib/data";
import { useAppStore } from "@/lib/store";
import { T } from "@/lib/translations";
import { Heart, ShoppingCart, Zap, Star, Eye } from "lucide-react";
import Image from "next/image";

export default function ProductCard({ p, onOpen }: { p: any, onOpen?: () => void }) {
  const { lang, addToCart, wishlist, toggleWishlist, darkMode } = useAppStore();
  const t = T[lang];
  const name = lang === "uz" ? p.nameUz : lang === "ru" ? p.nameRu : p.nameEn;
  const isWishlisted = wishlist.some((i: any) => i.id === p.id);
  const stars = 5;

  return (
    <div
      onClick={onOpen}
      className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-[1.75rem] border transition-transform transition-colors duration-500 hover:-translate-y-2 will-change-transform ${darkMode ? 'border-gray-800 bg-gray-900 hover:border-gray-700 hover:shadow-2xl' : 'border-slate-100 bg-white shadow-lg shadow-slate-100/80 hover:shadow-2xl hover:border-red-100'}`}
    >
      {/* Badges */}
      <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
        {p.discount > 0 && (
          <span className="rounded-xl bg-red-600 px-2.5 py-1 text-[10px] font-black tracking-wider text-white shadow-lg shadow-red-500/30">
            -{p.discount}%
          </span>
        )}
        {p.isNew && (
          <span className="rounded-xl bg-emerald-500 px-2.5 py-1 text-[10px] font-black tracking-wider text-white shadow-lg shadow-emerald-500/30">
            ✨ Yangi
          </span>
        )}
        {p.isFeatured && (
          <span className="rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 px-2.5 py-1 text-[10px] font-black tracking-wider text-white shadow-lg shadow-amber-500/30">
            <Zap size={9} className="inline mr-0.5 fill-white" />TOP
          </span>
        )}
      </div>

      {/* Wishlist */}
      <button
        onClick={(e) => { e.stopPropagation(); toggleWishlist(p); }}
        className={`absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full shadow-xl transition-all hover:scale-110 active:scale-95 ${isWishlisted ? "bg-red-500 text-white" : "bg-white/90 dark:bg-gray-800/90 text-slate-300 hover:text-red-500"}`}
      >
        <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
      </button>

      {/* Image */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-100 dark:bg-gray-800">
        <Image
          src={p.image} alt={name} fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 50vw, 300px"
        />
        {/* Hover overlay with quick view */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
          <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-800 shadow-xl">
            <Eye size={12} /> Ko'rish
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-1 text-[9px] font-black uppercase tracking-[0.25em] text-red-500/70">{t[p.category as keyof typeof t] || p.category}</div>
        <h3 className={`line-clamp-2 text-[13px] font-black leading-snug tracking-tight mb-3 ${darkMode ? 'text-gray-100' : 'text-slate-900'}`}>{name}</h3>

        {/* Stars */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex gap-0.5">
            {[...Array(stars)].map((_, i) => (
              <Star key={i} size={10} className="text-amber-400 fill-amber-400" />
            ))}
          </div>
          <span className={`text-[10px] font-bold ${darkMode ? 'text-gray-500' : 'text-slate-400'}`}>({p.reviews || 0})</span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-2">
          <div>
            {p.oldPrice && (
              <div className="text-[10px] font-bold line-through text-slate-300 mb-0.5">{fmt(p.oldPrice)}</div>
            )}
            <div className={`text-base font-black tracking-tight ${darkMode ? 'text-red-400' : 'text-slate-900'}`}>{fmt(p.price)}</div>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); addToCart(p); }}
            disabled={p.stock <= 0}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-all active:scale-90 shadow-lg disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed ${p.stock > 0 ? (darkMode ? 'bg-red-600 text-white hover:bg-red-500 shadow-red-600/30' : 'bg-slate-900 text-white hover:bg-red-600 shadow-slate-900/20 hover:shadow-red-600/30') : 'bg-slate-100 text-slate-300'}`}
          >
            <ShoppingCart size={18} className="transition-transform group-hover:-rotate-12" />
          </button>
        </div>
      </div>
    </div>
  );
}
