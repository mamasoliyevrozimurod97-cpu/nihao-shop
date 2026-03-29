"use client";
import { Product, fmt, stars } from "@/lib/data";
import { useAppStore } from "@/lib/store";
import { T } from "@/lib/translations";
import { Heart, ShoppingCart } from "lucide-react";
import Image from "next/image";

export default function ProductCard({ p }: { p: Product }) {
  const { lang, addToCart, wishlist, toggleWishlist, darkMode } = useAppStore();
  const t = T[lang];
  const name = lang === "uz" ? p.nameUz : lang === "ru" ? p.nameRu : p.nameZh;
  const isWishlisted = wishlist.some(i => i.id === p.id);

  return (
    <div className={`card-hover group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border ${darkMode ? 'border-gray-800 bg-gray-900' : 'border-red-100 bg-white'} shadow-sm transition-all duration-300`}>
      {/* Badges */}
      <div className="absolute left-3 top-3 z-10 flex flex-col gap-1">
        {p.discount > 0 && <span className="rounded-lg bg-red-600 px-2 py-1 text-xs font-black tracking-wide text-white shadow-sm">-{p.discount}%</span>}
        {p.isNew && <span className="rounded-lg bg-green-500 px-2 py-1 text-xs font-black tracking-wide text-white shadow-sm">NEW</span>}
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); toggleWishlist(p); }}
        className={`absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow-sm backdrop-blur-md transition hover:scale-110 ${isWishlisted ? "text-red-500" : "text-gray-400"}`}
      >
        <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
      </button>

      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        <Image src={p.image} alt={name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 300px" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-500">{t[p.category as keyof typeof t] || p.category}</div>
        <h3 className={`line-clamp-2 text-sm font-bold leading-tight ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{name}</h3>
        
        <div className="mt-2 flex items-center gap-1 text-xs">
          <span className="text-yellow-400">{stars(p.rating)}</span>
          <span className="text-gray-400">({p.reviews})</span>
        </div>

        <div className="mt-auto pt-4 flex items-end justify-between">
          <div>
            {p.oldPrice && <div className="text-xs line-through text-gray-400">{fmt(p.oldPrice)}</div>}
            <div className={`text-base font-black ${darkMode ? 'text-red-400' : 'text-red-700'}`}>{fmt(p.price)}</div>
          </div>
          
          <button
            onClick={(e) => { e.stopPropagation(); addToCart(p); }}
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${p.stock > 0 ? (darkMode ? 'bg-red-900 text-white hover:bg-red-800' : 'bg-red-50 text-red-700 hover:bg-red-600 hover:text-white') : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            disabled={p.stock <= 0}
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
