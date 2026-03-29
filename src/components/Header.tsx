"use client";
import { useAppStore } from "@/lib/store";
import { T } from "@/lib/translations";
import { ShoppingCart, Heart, Search, Menu, User } from "lucide-react";
import AuthModal from "./AuthModal";
import Link from "next/link";

export default function Header() {
  const { lang, setLang, darkMode, setDarkMode, cart, wishlist, setCartOpen, activePage, setActivePage, authOpen, setAuthOpen, user } = useAppStore();
  const t = T[lang];
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const isAdmin = user && user.email === adminEmail;

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg transition-colors duration-300">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-6">
        
        {/* Logo */}
        <div onClick={() => setActivePage('home')} className="flex shrink-0 cursor-pointer items-center gap-3">
          <div className="flex h-10 w-10 animate-bounce items-center justify-center rounded-xl bg-white text-2xl shadow-md">
            🛒
          </div>
          <div className="hidden md:block">
            <div className="text-xl font-black tracking-wide">{t.siteName}</div>
            <div className="text-[10px] font-medium opacity-80">{t.tagline}</div>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex ml-4">
          <button onClick={() => setActivePage('home')} className={`rounded-lg px-3 py-2 text-sm font-bold transition ${activePage === 'home' ? 'bg-white/30' : 'hover:bg-white/20'}`}>🏠 {t.home}</button>
          <button onClick={() => setActivePage('catalog')} className={`rounded-lg px-3 py-2 text-sm font-bold transition ${activePage === 'catalog' ? 'bg-white/30' : 'hover:bg-white/20'}`}>📦 {t.catalog}</button>
          <button onClick={() => setActivePage('discounts')} className={`rounded-lg px-3 py-2 text-sm font-bold transition ${activePage === 'discounts' ? 'bg-white/30' : 'hover:bg-white/20'}`}>🔥 {t.discounts}</button>
          
          {isAdmin && (
             <Link href="/admin" className="rounded-lg bg-yellow-400 px-3 py-2 text-sm font-black text-red-900 shadow-md transition hover:bg-yellow-300">
               ⚙️ {t.adminPanel}
             </Link>
          )}
        </nav>

        <div className="flex-1" />

        {/* Search */}
        <div className="relative hidden flex-1 max-w-xs md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70" size={16} />
          <input
            placeholder={t.search}
            className="w-full rounded-xl bg-white/20 py-2 pl-9 pr-4 text-sm text-white placeholder-white/70 outline-none focus:bg-white/30 transition"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <div className="flex gap-1">
            {(["uz", "ru", "zh", "en"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`rounded-md px-2 py-1 text-xs font-bold transition-colors ${lang === l ? "bg-white text-red-800" : "bg-white/10 text-white hover:bg-white/20"}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Theme Toggle */}
          <button onClick={() => setDarkMode(!darkMode)} className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition">
            {darkMode ? "☀️" : "🌙"}
          </button>

          {/* Wishlist */}
          <button className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition">
            <Heart size={18} />
            {wishlist.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Cart */}
          <button onClick={() => setCartOpen(true)} className="btn-glow relative flex items-center gap-2 rounded-xl bg-white/20 px-3 py-2 text-sm font-bold transition">
            <ShoppingCart size={18} />
            <span className="hidden md:inline">{t.cart}</span>
            {cart.length > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-red-500 text-[11px] font-black text-white shadow-md">
                {cart.reduce((sum, item) => sum + item.qty, 0)}
              </span>
            )}
          </button>
          
          {/* User / Login - Only shown if already logged in as ADMIN */}
          {isAdmin && (
            <button onClick={() => setAuthOpen(true)} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-bold text-red-800 hover:bg-gray-100 transition">
              <User size={16} /> Admin 👑
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 md:hidden hover:bg-white/20">
            <Menu size={20} />
          </button>
        </div>
      </div>
      
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </header>
  );
}
