"use client";
import { useAppStore } from "@/lib/store";
import { T } from "@/lib/translations";
import { Home, LayoutGrid, ShoppingCart, User, Percent } from "lucide-react";

export default function BottomNav() {
  const { lang, activePage, setActivePage, cart, setCartOpen } = useAppStore();
  const t = T[lang];

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const navItems = [
    { id: 'home', icon: <Home size={20} />, label: t.home },
    { id: 'catalog', icon: <LayoutGrid size={20} />, label: t.catalog },
    { id: 'discounts', icon: <Percent size={20} />, label: t.discounts },
    { id: 'cart', icon: <ShoppingCart size={20} />, label: t.cart, count: cartCount },
    { id: 'profile', icon: <User size={20} />, label: t.profile },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white px-2 pb-safe-offset-2 pt-2 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] md:hidden transition-colors duration-300 dark:bg-gray-950 dark:border-gray-800">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === 'cart') {
                setCartOpen(true);
              } else {
                setActivePage(item.id as any);
              }
            }}
            className={`flex flex-col items-center gap-1 p-2 transition-all ${
              (activePage === item.id || (item.id === 'cart' && false)) 
                ? "text-red-600 scale-110" 
                : "text-gray-400 hover:text-gray-600 dark:text-gray-500"
            }`}
          >
            <div className="relative">
              {item.icon}
              {item.count ? item.count > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-black text-white shadow-sm ring-1 ring-white">
                  {item.count}
                </span>
              ) : null}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
