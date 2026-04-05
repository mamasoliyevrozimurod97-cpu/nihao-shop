"use client";
import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { T, Language } from "@/lib/translations";
import { 
  ShoppingCart, 
  Menu, 
  X, 
  User, 
  Search, 
  Moon, 
  Sun, 
  Globe, 
  ChevronDown,
  ShieldCheck,
  Zap,
  Navigation
} from "lucide-react";
import AuthModal from "./AuthModal";
import CartDrawer from "./CartDrawer";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LANGS = ["uz", "ru", "zh", "en"] as const;

export default function Header() {
  const { lang, setLang, darkMode, setDarkMode, cart, setCartOpen, localProfile } = useAppStore();
  const t = T[lang];
  const pathname = usePathname();
  const [authOpen, setAuthOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const adminPhone = process.env.NEXT_PUBLIC_ADMIN_PHONE;
  const isAdmin = localProfile && localProfile.phone.replace(/\s+/g, '') === (adminPhone || "").replace(/\s+/g, '');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        isScrolled 
          ? "py-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg border-b border-gray-100 dark:border-gray-800" 
          : "py-4 bg-transparent"
      }`}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            
            {/* Logo */}
            <Link href="/" className="group flex items-center gap-2">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 shadow-lg shadow-red-500/30 transition-transform group-hover:scale-110">
                <Zap className="text-white fill-white" size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tighter leading-none text-gray-900 dark:text-white uppercase italic">
                  NIHAO<span className="text-red-600">.UZ</span>
                </span>
                <span className="text-[10px] font-bold tracking-widest opacity-40 uppercase">Shop Digital</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1 bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
              <Link href="/" className={`px-5 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition ${pathname === '/' ? 'bg-white dark:bg-gray-700 text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
                {t.home}
              </Link>
              <Link href="/catalog" className={`px-5 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition ${pathname === '/catalog' ? 'bg-white dark:bg-gray-700 text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
                {t.catalog}
              </Link>
              {isAdmin && (
                <Link href="/admin" className="px-5 py-2 text-xs font-black uppercase tracking-widest rounded-xl bg-red-600 text-white shadow-lg shadow-red-500/20 hover:bg-red-700 transition">
                  Admin
                </Link>
              )}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Language */}
              <div className="relative">
                <button 
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Globe size={18} />
                </button>
                {langOpen && (
                  <div className="absolute top-12 right-0 w-32 overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200">
                    {LANGS.map(l => (
                      <button
                        key={l}
                        onClick={() => { setLang(l); setLangOpen(false); }}
                        className={`w-full px-4 py-3 text-[10px] font-black uppercase tracking-widest text-left transition ${lang === l ? 'bg-red-600 text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Theme */}
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* Cart */}
              <button 
                onClick={() => setCartOpen(true)}
                className="group relative flex h-10 items-center gap-2 rounded-full bg-gray-900 dark:bg-white px-4 text-white dark:text-gray-900 hover:scale-105 transition active:scale-95"
              >
                <ShoppingCart size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">{t.cart}</span>
                {totalItems > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[9px] font-black text-white ring-2 ring-white dark:ring-gray-900">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Profile */}
              <button 
                onClick={() => setAuthOpen(true)}
                className="flex items-center gap-2 rounded-full bg-gray-100 dark:bg-gray-800 p-1 pr-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 shadow-sm border border-gray-100 dark:border-gray-600">
                  <User size={16} />
                </div>
                <div className="hidden flex-col items-start lg:flex">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 leading-none mb-0.5">
                    {localProfile ? 'Profile' : 'Login'}
                  </span>
                  <span className="text-[10px] font-black truncate max-w-[70px]">
                    {localProfile ? localProfile.firstName : t.login}
                  </span>
                </div>
              </button>

            </div>
          </div>
        </div>
      </header>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      <CartDrawer />
      <div className="h-16 lg:h-20" /> {/* Spacer */}
    </>
  );
}
