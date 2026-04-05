"use client";
import { useAppStore } from "@/lib/store";
import { T } from "@/lib/translations";
import { ShoppingCart, Search, User, Sun, Moon, Flame, Globe } from "lucide-react";
import AuthModal from "./AuthModal";
import Link from "next/link";
import { useState } from "react";

const LANGS = ["uz", "ru", "zh", "en"] as const;

export default function Header() {
  const { lang, setLang, darkMode, setDarkMode, cart, setCartOpen, activePage, setActivePage, authOpen, setAuthOpen, user } = useAppStore();
  const t = T[lang];
  const adminPhone = process.env.NEXT_PUBLIC_ADMIN_PHONE;
  const isAdmin = user && user.phone === adminPhone;
  const [langOpen, setLangOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 transition-all duration-300">


      {/* Main bar */}
      <div className={`${darkMode ? 'bg-gray-950/95 border-gray-800' : 'bg-white/95 border-gray-100'} md:backdrop-blur-xl border-b transition-colors duration-300`}>
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-6">

          {/* Logo */}
          <div onClick={() => setActivePage('home')} className="flex shrink-0 cursor-pointer items-center gap-3 group">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-red-700 text-white shadow-xl shadow-red-200 dark:shadow-red-900/30 transition-transform group-hover:scale-105 will-change-transform">
              <ShoppingCart size={22} />
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-green-400 ring-2 ring-white" />
            </div>
            <div className="hidden md:block">
              <div className="text-xl font-black tracking-tight text-gray-900 dark:text-white italic">
                NIHAO <span className="text-red-600">SHOP</span>
              </div>
              <div className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">v2.0 · Premium Store</div>
            </div>
          </div>

          {/* Nav */}
          <nav className="hidden items-center gap-1 md:flex ml-6">
            <NavLink active={activePage === 'home'} onClick={() => setActivePage('home')}>{t.home}</NavLink>
            <NavLink active={activePage === 'catalog'} onClick={() => setActivePage('catalog')}>{t.catalog}</NavLink>
            <NavLink active={activePage === 'discounts'} onClick={() => setActivePage('discounts')}>
              <Flame size={12} className="inline mr-1 text-orange-500 fill-orange-500" />{t.discounts}
            </NavLink>
            {isAdmin && (
              <Link href="/admin" className="ml-2 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-xl transition hover:from-red-600 hover:to-red-700">
                {t.adminPanel}
              </Link>
            )}
          </nav>

          <div className="flex-1" />

          {/* Search */}
          <div className="relative hidden flex-1 max-w-sm lg:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              placeholder={t.search}
              className={`w-full rounded-2xl border py-3 pl-11 pr-4 text-sm font-bold outline-none transition-all focus:border-red-500 focus:ring-4 focus:ring-red-500/10 ${darkMode ? 'border-gray-700 bg-gray-900 text-white placeholder-gray-500' : 'border-gray-100 bg-gray-50 text-gray-900 placeholder-slate-400'}`}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Lang switcher */}
            <div className="relative">
              <button onClick={() => setLangOpen(!langOpen)} className={`hidden md:flex h-10 items-center gap-1.5 px-3 rounded-xl border text-xs font-black uppercase tracking-wider transition-colors ${darkMode ? 'border-gray-700 bg-gray-900 text-gray-400 hover:text-white' : 'border-gray-100 bg-gray-50 text-gray-500 hover:text-red-600'}`}>
                <Globe size={14} /> {lang}
              </button>
              {langOpen && (
                <div className={`absolute right-0 top-12 z-50 rounded-2xl border shadow-2xl overflow-hidden ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}>
                  {LANGS.map(l => (
                    <button key={l} onClick={() => { setLang(l); setLangOpen(false); }}
                      className={`flex w-full items-center px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-colors ${lang === l ? 'text-red-600 bg-red-50' : darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-50'}`}>
                      {l === 'uz' ? '🇺🇿' : l === 'ru' ? '🇷🇺' : l === 'zh' ? '🇨🇳' : '🇬🇧'} {l.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark mode */}
            <button onClick={() => setDarkMode(!darkMode)} className={`hidden md:flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${darkMode ? 'border-gray-700 bg-gray-900 text-yellow-400 hover:text-yellow-300' : 'border-gray-100 bg-gray-50 text-gray-400 hover:text-slate-800'}`}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Cart */}
            <button onClick={() => setCartOpen(true)} className="group relative flex items-center gap-2 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 px-5 py-2.5 text-sm font-black text-white shadow-xl shadow-slate-200 dark:shadow-none hover:from-red-600 hover:to-red-700 transition-all active:scale-95">
              <ShoppingCart size={18} className="transition-transform group-hover:-rotate-12" />
              <span className="hidden md:inline">{t.cart}</span>
              {cart.length > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 animate-bounce items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white ring-2 ring-white dark:ring-gray-950">
                  {cart.reduce((sum, item) => sum + item.qty, 0)}
                </span>
              )}
            </button>

            {/* User */}
            <button onClick={() => setAuthOpen(true)} className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all lg:h-auto lg:w-auto lg:px-4 lg:py-2.5 lg:gap-2 ${user ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800' : darkMode ? 'border-gray-700 bg-gray-900 text-gray-400 hover:text-white' : 'border-gray-100 bg-gray-50 text-gray-400 hover:text-red-600'}`}>
              <User size={18} />
              <span className="hidden lg:inline text-xs font-black uppercase tracking-widest">
                {user ? (isAdmin ? "Admin 👑" : t.profile) : 'Kirish'}
              </span>
            </button>
          </div>
        </div>
      </div>
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </header>
  );
}

function NavLink({ children, active, onClick }: { children: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`relative px-4 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all rounded-xl ${active ? 'text-red-600 bg-red-50 dark:bg-red-900/20' : 'text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900'}`}>
      {children}
    </button>
  );
}
