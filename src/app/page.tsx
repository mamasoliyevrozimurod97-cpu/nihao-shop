"use client";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import Cart from "@/components/Cart";
import CheckoutModal from "@/components/CheckoutModal";
import { useAppStore } from "@/lib/store";
import { cats } from "@/lib/data";
import { T } from "@/lib/translations";
import { useState } from "react";

export default function Home() {
  const { lang, products, darkMode, cartOpen, setCartOpen, activePage, checkoutOpen, setCheckoutOpen } = useAppStore();
  const t = T[lang];
  // Production build trigger for Env Vars
  const [filterCat, setFilterCat] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const catIcon: Record<string, string> = {all:"🛍️",electronics:"📱",clothing:"👗",home_goods:"🏠",food:"🥗",sports:"⚽",beauty:"💄",toys:"🧸",construction:"🔨"};

  // Active page logic
  const displayProducts = products.filter(p => {
    const q = searchQuery.toLowerCase();
    const queryMatch = !searchQuery || 
      p.nameUz.toLowerCase().includes(q) ||
      p.nameRu.toLowerCase().includes(q) ||
      p.nameZh.toLowerCase().includes(q) ||
      p.nameEn.toLowerCase().includes(q);
    
    if (!queryMatch) return false;
    if (filterCat !== 'all' && p.category !== filterCat) return false;
    if (activePage === 'discounts' && !(p.discount > 0)) return false;
    return true;
  });

  const featured = products.filter(p => p.isFeatured);
  const newArrivals = products.filter(p => p.isNew);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <Header />

      <Cart isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        
        {activePage === 'home' && (
          <>
            {/* Hero Section */}
            <section className="relative mb-12 overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-red-600 via-red-500 to-orange-500 px-8 py-14 text-white shadow-2xl md:px-16 md:py-20">
              <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white/10 blur-3xl"></div>
              <div className="absolute -bottom-32 left-10 h-80 w-80 rounded-full bg-black/10 blur-3xl"></div>
              
              <div className="relative z-10 max-w-xl">
                <div className="mb-6 inline-flex rounded-full bg-white/20 px-4 py-1.5 text-xs font-black tracking-widest backdrop-blur-sm">
                  🔥 {t.bestSellers} · {t.newArrivals}
                </div>
                <h1 className="mb-4 text-5xl font-black leading-tight tracking-tight drop-shadow-md md:text-7xl">
                  {t.hero1}
                </h1>
                <p className="mb-8 text-xl font-bold text-red-100 drop-shadow md:text-2xl">
                  {t.hero2}
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <button onClick={() => {
                      window.scrollTo({top: 800, behavior: 'smooth'});
                  }} className="btn-glow flex items-center justify-center rounded-2xl bg-white px-8 py-4 text-sm font-black text-red-700 shadow-xl transition-transform hover:-translate-y-1">
                    {t.shopNow} →
                  </button>
                  <button className="flex items-center justify-center rounded-2xl border-2 border-white/40 bg-white/10 px-8 py-4 text-sm font-bold backdrop-blur-sm transition-colors hover:bg-white/20">
                    ⭐ {t.featured}
                  </button>
                </div>
                <div className="mt-8 flex items-center gap-2 text-sm font-semibold opacity-90">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs">🚚</span>
                  {t.hero3}
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 select-none text-[12rem] opacity-[0.07]">
                🛒
              </div>
            </section>

            {/* Categories */}
            <section className="mb-16">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="section-title text-2xl font-black">🗂️ {t.categories}</h2>
              </div>
              <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 hide-scrollbar">
                {cats.slice(1).map(c => (
                  <button
                    key={c}
                    onClick={() => setFilterCat(c)}
                    className={`card-hover group flex min-w-[110px] shrink-0 snap-center flex-col items-center gap-3 rounded-3xl border p-5 transition-all
                      ${filterCat === c 
                        ? 'border-red-500 bg-red-50 text-red-700 shadow-md ring-2 ring-red-500/20' 
                        : darkMode ? 'border-gray-800 bg-gray-900 text-gray-300 hover:border-gray-700' : 'border-gray-200 bg-white text-gray-600 hover:border-red-200 hover:bg-red-50/50'}`}
                  >
                    <span className="text-4xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">{catIcon[c]}</span>
                    <span className="text-center text-[11px] font-black uppercase tracking-wider">{t[c as keyof typeof t] || c}</span>
                  </button>
                ))}
              </div>
            </section>
          </>
        )}

        {(activePage === 'catalog' || activePage === 'discounts' || filterCat !== 'all' || activePage === 'home') && (
          <section className="mb-16">
            {/* Search Bar */}
            <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:max-w-md">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none opacity-40">
                  🔍
                </div>
                <input 
                  type="text" 
                  placeholder={lang === 'uz' ? "Mahsulotlarni qidirish..." : lang === 'ru' ? "Поиск продуктов..." : "Search products..."}
                  className={`w-full rounded-2xl border-2 py-4 pl-12 pr-4 font-bold outline-none transition-all duration-300
                    ${darkMode ? 'border-gray-800 bg-gray-900 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-gray-100 bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 shadow-sm'}`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest opacity-40">
                {displayProducts.length} {t.products}
              </div>
            </div>

            <div className="mb-8 flex items-end justify-between border-b border-gray-200 pb-4 dark:border-gray-800">
              <h2 className="section-title text-2xl font-black">
                {activePage === 'discounts' ? `🔥 ${t.discounts}` : activePage === 'catalog' ? `📦 ${t.catalog}` : filterCat !== 'all' ? `🗂️ ${t[filterCat as keyof typeof t] || filterCat}` : `⭐ ${t.featured}`}
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-6">
              {displayProducts.map(p => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          </section>
        )}

      </main>
      
      {/* Footer */}
      <footer className={`mt-auto border-t py-12 text-center text-sm ${darkMode ? 'border-gray-800 bg-gray-950 text-gray-500' : 'border-gray-200 bg-white text-gray-500'}`}>
        <p className="font-bold">© 2026 {t.siteName}. Barcha huquqlar himoyalangan.</p>
        <p className="mt-2 text-xs opacity-70">Powered by Next.js & Tailwind CSS</p>
      </footer>
    </div>
  );
}
