"use client";
import { fmt } from "@/lib/data";
import { useAppStore } from "@/lib/store";
import { T } from "@/lib/translations";
import { Minus, Plus, Trash2, X } from "lucide-react";
import Image from "next/image";

export default function Cart({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { lang, cart, updateQty, removeFromCart, darkMode, setCheckoutOpen, user, setAuthOpen } = useAppStore();
  const t = T[lang];

  if (!isOpen) return null;

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      {/* Drawer */}
      <div className={`relative flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'} animate-in slide-in-from-right duration-300`}>
        {/* Header */}
        <div className={`flex items-center justify-between border-b p-5 ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
          <h2 className="text-xl font-black">{t.cart} ({cart.length})</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100 hover:text-red-600 transition">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-gray-400">
              <div className="mb-4 text-6xl">🛒</div>
              <p className="text-lg font-bold">{t.emptyCart}</p>
              <button onClick={onClose} className="mt-6 rounded-xl bg-red-600 px-6 py-3 font-bold text-white shadow-md hover:bg-red-700 transition">
                {t.continueShopping}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {cart.map((item) => (
                <div key={item.id} className={`flex gap-4 rounded-2xl border p-3 ${darkMode ? 'border-gray-800 bg-gray-800/50' : 'border-gray-100 bg-gray-50'}`}>
                  {/* Image */}
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                    <Image src={item.image} alt="product" fill className="object-cover" />
                  </div>
                  
                  {/* Details */}
                  <div className="flex flex-1 flex-col py-1">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="line-clamp-2 text-sm font-bold leading-tight">{lang === 'uz' ? item.nameUz : lang === 'ru' ? item.nameRu : item.nameZh}</h4>
                      <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 transition">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-2 py-1 shadow-sm">
                        <button onClick={() => updateQty(item.id, -1)} className="text-gray-500 hover:text-red-600"><Minus size={14}/></button>
                        <span className="w-4 text-center text-xs font-bold text-gray-900">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="text-gray-500 hover:text-green-600"><Plus size={14}/></button>
                      </div>
                      <div className="text-sm font-black text-red-600">{fmt(item.price * item.qty)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className={`border-t p-5 ${darkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-white'}`}>
            <div className="mb-4 flex justify-between items-center text-lg font-black">
              <span>{t.total}:</span>
              <span className="text-red-600 text-xl">{fmt(total)}</span>
            </div>
            <button 
              onClick={() => {
                onClose();
                setCheckoutOpen(true);
              }}
              className="btn-glow w-full rounded-2xl bg-gradient-to-r from-red-600 to-red-700 py-4 text-center font-black tracking-wide text-white shadow-lg"
            >
              {t.checkout}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
