"use client";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import Cart from "@/components/Cart";
import CheckoutModal from "@/components/CheckoutModal";
import ProductModal from "@/components/ProductModal";
import { useAppStore } from "@/lib/store";
import { cats, catIcon, catLabels } from "@/lib/data";
import { T } from "@/lib/translations";
import { useState, useEffect, useMemo } from "react";
import { Sparkles, Zap, ShoppingBag, ArrowRight, TrendingUp, Shield, Truck, HeartHandshake, MapPin, Navigation } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { fmt } from "@/lib/data";

export default function Home() {
  const { lang, products, darkMode, cartOpen, setCartOpen, activePage, setActivePage, checkoutOpen, setCheckoutOpen } = useAppStore();
  const t = T[lang];
  const [filterCat, setFilterCat] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [banner, setBanner] = useState<any>(null);
  const [storeInfo, setStoreInfo] = useState<any>(null);

  const displayProducts = useMemo(() => {
    return products.filter((p: any) => {
      const q = searchQuery.toLowerCase();
      const queryMatch = !searchQuery ||
        p.nameUz.toLowerCase().includes(q) ||
        p.nameRu.toLowerCase().includes(q) ||
        p.nameEn.toLowerCase().includes(q);
      if (!queryMatch) return false;
      if (filterCat !== 'all' && p.category !== filterCat) return false;
      if (activePage === 'discounts' && !(p.discount > 0)) return false;
      return true;
    });
  }, [products, searchQuery, filterCat, activePage]);

  useEffect(() => {
    supabase.from('banners').select('*').eq('is_active', true).limit(1).single()
      .then(({ data }) => { if (data) setBanner(data); });

    supabase.from('store_settings').select('*').eq('key', 'delivery_config').single()
      .then(({ data }) => { if (data && data.value) setStoreInfo(data.value); });
  }, []);

  const featured = useMemo(() => products.filter(p => p.isFeatured).slice(0, 4), [products]);
  const dm = darkMode;

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans selection:bg-red-200 selection:text-red-900 ${dm ? 'bg-gray-950 text-gray-100' : 'bg-[#f8f9ff] text-gray-900'}`}>
      <Header />
      <Cart isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
      <ProductModal
        p={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">

        {activePage === 'home' && (
          <>
            {/* ===== HERO SECTION ===== */}
            <section className="relative mb-16 mt-4 overflow-hidden rounded-[2.5rem] shadow-2xl">
              {/* Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-red-950" />
              <div className="absolute -right-32 -top-32 hidden md:block h-[500px] w-[500px] rounded-full bg-red-600/15 blur-[100px]" />
              <div className="absolute -bottom-20 left-1/3 hidden md:block h-[300px] w-[300px] rounded-full bg-blue-600/10 blur-[80px]" />

              {/* Decorative grid */}
              <div className="absolute inset-0 opacity-5"
                style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}
              />

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center px-8 py-16 md:px-16 md:py-24">
                {/* Left */}
                <div className="space-y-7 animate-in fade-in slide-in-from-left-8 duration-700">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest backdrop-blur-md text-white">
                    <Sparkles size={11} className="text-yellow-400 fill-yellow-400" />
                    {banner?.[`product_tag_${lang}`] || t.newArrivals}
                    <span className="ml-1 h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                  </div>

                  <h1 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tighter text-white">
                    {(banner?.[`title_${lang}`] || "NIHAO").split(' ')[0]}{' '}
                    <span className="bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
                      {(banner?.[`title_${lang}`] || "SHOP").split(' ').slice(1).join(' ') || 'SHOP'}
                    </span>
                  </h1>

                  <p className="max-w-md text-base font-bold text-slate-400 leading-relaxed">
                    {banner?.[`subtitle_${lang}`] || t.hero2}
                  </p>

                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      onClick={() => { setActivePage('catalog'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className="group flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 px-8 py-4 text-sm font-black text-white shadow-2xl shadow-red-600/30 transition-all hover:shadow-red-500/40 hover:scale-105 active:scale-95"
                    >
                      {banner?.[`button_text_${lang}`] || t.shopNow}
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </button>

                    <div className="flex -space-x-2.5">
                      {["🧑", "👩", "👨", "🧕"].map((e, i) => (
                        <div key={i} className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-slate-900 bg-slate-800 text-sm shadow">{e}</div>
                      ))}
                      <div className="flex items-center gap-1.5 pl-4 text-xs font-bold text-slate-400">
                        <TrendingUp size={12} className="text-green-400" />
                        <span className="text-white font-black">10k+</span> xaridor
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-8 pt-2">
                    {[['500+', "Mahsulot"], ['98%', "Mamnun xaridorlar"], ['24/7', "Qo'llab-quvvatlash"]].map(([v, l]) => (
                      <div key={l}>
                        <div className="text-2xl font-black text-white">{v}</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{l}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: product showcase */}
                <div className="hidden lg:flex relative items-center justify-center animate-in fade-in zoom-in duration-700 delay-200">
                  <div className="relative h-[26rem] w-[26rem]">
                    <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-tr from-white/5 to-white/10 border border-white/10 rotate-3 overflow-hidden group">
                      <div className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700"
                        style={{ backgroundImage: `url(${banner?.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                      <div className="absolute bottom-8 left-8 right-8">
                        <p className="text-2xl font-black italic tracking-tighter uppercase text-white mb-1.5">{banner?.[`product_name_${lang}`] || 'Smart Watch Pro'}</p>
                        <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">{banner?.[`product_tag_${lang}`] || 'Eksklyuziv taklif'}</p>
                      </div>
                    </div>

                    {/* Floating badge */}
                    <div className="absolute -right-6 top-8 rounded-2xl bg-white px-4 py-3 shadow-2xl border border-gray-100">
                      <div className="text-xs font-black text-slate-900">Eng mashhur</div>
                      <div className="text-[10px] text-slate-400 font-bold">Bugun 43 ta sotildi</div>
                    </div>

                    <div className="absolute -left-6 bottom-16 rounded-2xl bg-red-600 px-4 py-3 shadow-2xl text-white">
                      <div className="text-xs font-black">-40% Chegirma</div>
                      <div className="text-[10px] opacity-80 font-bold">Bugun uchun</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ===== TRUST BADGES ===== */}
            <section className={`mb-14 grid grid-cols-2 md:grid-cols-4 gap-4`}>
              {[
                { icon: <Truck size={22} />, title: "Tez Yetkazib Berish", sub: "1-3 ish kuni ichida" },
                { icon: <Shield size={22} />, title: "100% Kafolat", sub: "Sifatli mahsulotlar" },
                { icon: <HeartHandshake size={22} />, title: "24/7 Yordam", sub: "Har doim yordamda" },
                { icon: <Zap size={22} />, title: "Tez Buyurtma", sub: "Telegram orqali" },
              ].map((b, i) => (
                <div key={i} className={`flex items-center gap-4 rounded-2xl p-5 border transition-all hover:border-red-200 hover:shadow-lg ${dm ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100 shadow-sm'}`}>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">{b.icon}</div>
                  <div>
                    <div className={`text-xs font-black ${dm ? 'text-white' : 'text-slate-800'}`}>{b.title}</div>
                    <div className="text-[10px] font-bold text-slate-400 mt-0.5">{b.sub}</div>
                  </div>
                </div>
              ))}
            </section>

            {/* ===== FEATURED ===== */}
            {featured.length > 0 && (
              <section className="mb-16">
                <div className="mb-8 flex items-end justify-between">
                  <div>
                    <h2 className={`text-3xl font-black tracking-tight flex items-center gap-2.5 ${dm ? 'text-white' : 'text-slate-900'}`}>
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-400/30">
                        <Zap size={18} fill="white" />
                      </span>
                      {t.featured}
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Eng ko'p sotilayotgan mahsulotlar</p>
                  </div>
                  <button
                    onClick={() => setActivePage('catalog')}
                    className="flex items-center gap-1.5 text-sm font-black text-red-600 hover:underline">
                    Hammasi <ArrowRight size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                  {featured.map(p => <ProductCard key={p.id} p={p} onOpen={() => setSelectedProduct(p)} />)}
                </div>
              </section>
            )}

            {/* ===== CATEGORIES ===== */}
            <section className={`mb-16 rounded-[2.5rem] p-10 border ${dm ? 'bg-gray-900/80 border-gray-800' : 'bg-white border-gray-100 shadow-xl shadow-slate-100/50'}`}>
              <div className="mb-8 text-center">
                <h2 className={`text-3xl font-black tracking-tight uppercase ${dm ? 'text-white' : 'text-slate-900'}`}>Kategoriyalar</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Sevimli toifani tanlang</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {cats.slice(1).map(c => (
                  <button
                    key={c}
                    onClick={() => { setFilterCat(c); setActivePage('catalog'); }}
                    className={`group flex flex-col items-center gap-3 rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1.5 hover:border-red-400 hover:shadow-xl hover:shadow-red-500/10 ${dm ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-gray-50 border-gray-100 hover:bg-white'}`}
                  >
                    <div className="text-4xl transition-transform duration-500 group-hover:scale-125 group-hover:rotate-6">{catIcon[c]}</div>
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors group-hover:text-red-600 ${dm ? 'text-gray-400' : 'text-slate-500'}`}>
                      {catLabels[c] || c}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </>
        )}

        {/* ===== CATALOG / DISCOUNTS ===== */}
        {(activePage === 'catalog' || activePage === 'discounts' || filterCat !== 'all') && (
          <section className="mb-20 pt-4">
            <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className={`text-4xl font-black tracking-tighter uppercase ${dm ? 'text-white' : 'text-slate-900'}`}>
                  {activePage === 'discounts' ? t.discounts : filterCat !== 'all' ? catLabels[filterCat] : t.catalog}
                </h2>
                <div className="mt-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <ShoppingBag size={12} className="text-red-500" />
                  {displayProducts.length} ta mahsulot topildi
                </div>
              </div>

              <div className="relative w-full md:max-w-sm">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                <input
                  type="text"
                  placeholder={t.search}
                  className={`w-full rounded-2xl border-2 py-4 pl-12 pr-5 text-sm font-bold transition-all outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 ${dm ? 'border-gray-700 bg-gray-900 text-white placeholder-gray-500' : 'border-slate-100 bg-white text-gray-900 placeholder-slate-400 shadow-lg'}`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:gap-6">
              {displayProducts.map(p => <ProductCard key={p.id} p={p} onOpen={() => setSelectedProduct(p)} />)}
            </div>

            {displayProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-40 text-center">
                <div className="text-7xl mb-6">🔍</div>
                <p className="text-2xl font-black uppercase tracking-tighter text-slate-300">Mahsulot topilmadi</p>
                <p className="text-sm text-slate-400 mt-2 font-bold">Boshqa so'z bilan qidiring</p>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className={`mt-10 border-t ${dm ? 'border-gray-800 bg-gray-950 text-gray-500' : 'border-gray-100 bg-white text-slate-400'}`}>
        <div className="mx-auto max-w-7xl px-8 py-16 flex flex-col md:flex-row justify-between items-center gap-10">
          <div>
            <h3 className={`text-2xl font-black tracking-tighter italic ${dm ? 'text-white' : 'text-slate-900'}`}>
              NIHAO <span className="text-red-600">SHOP</span>
              <span className="ml-2 text-[11px] normal-case font-bold text-slate-400 not-italic">v2.0</span>
            </h3>
            <p className="text-sm font-bold mt-1">Professional darajadagi onlayn do'kon.</p>
            
            {storeInfo?.store_address && (
              <div className="mt-4 flex flex-col items-center md:items-start gap-2">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <MapPin size={12} className="text-red-500" /> {storeInfo.store_address}
                </div>
                {storeInfo.store_maps_url && (
                  <a 
                    href={storeInfo.store_maps_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-gray-900 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white hover:bg-red-600 hover:text-white transition"
                  >
                    <Navigation size={12} /> Xaritada ko'rish
                  </a>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest">
            <a href="#" className="hover:text-red-600 transition">Telegram</a>
            <a href="#" className="hover:text-red-600 transition">Instagram</a>
            <a href="#" className="hover:text-red-600 transition">Bog'lanish</a>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest">© 2026 Barcha huquqlar himoyalangan.</p>
        </div>
      </footer>
    </div>
  );
}
