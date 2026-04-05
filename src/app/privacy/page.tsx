"use client";
import { ChevronLeft, ShieldCheck, Lock, Eye, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";

export default function PrivacyPolicy() {
  const { darkMode } = useAppStore();
  const dm = darkMode;

  return (
    <div className={`min-h-screen ${dm ? 'bg-gray-950 text-gray-100' : 'bg-slate-50 text-slate-900'} p-6 md:p-12 font-sans`}>
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 mb-8 text-[10px] font-black uppercase tracking-widest text-red-600 hover:gap-3 transition-all">
          <ChevronLeft size={16} /> Bosh sahifaga qaytish
        </Link>

        <header className="mb-12">
          <div className="h-16 w-16 rounded-3xl bg-red-600 flex items-center justify-center text-white mb-6 shadow-xl shadow-red-500/20">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-4xl font-black tracking-tight italic mb-4 uppercase italic">MAXFIYLIK SIYOSATI</h1>
          <p className="text-slate-400 font-bold">Oxirgi yangilanish: 2026-yil 5-aprel</p>
        </header>

        <div className={`space-y-12 ${dm ? 'text-gray-300' : 'text-slate-700'} leading-relaxed font-medium`}>
          <section className="space-y-4">
            <h2 className="text-xl font-black flex items-center gap-3 uppercase italic tracking-tighter text-red-600">
               <Eye size={20} /> 1. Ma'lumotlarni yig'ish
            </h2>
            <p>
              "Nihao Shop" ilovasi orqali buyurtma berish jarayonida biz foydalanuvchidan quyidagi ma'lumotlarni so'rashimiz mumkin:
            </p>
            <ul className="list-disc pl-6 space-y-2">
               <li>Foydalanuvchi ismi va familiyasi;</li>
               <li>Telefon raqami;</li>
               <li>Yetkazib berish manzili va geografik joylashuvi (lokatsiya);</li>
               <li>Tug'ilgan sana (ixtiyoriy, chegirmalar uchun).</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black flex items-center gap-3 uppercase italic tracking-tighter text-red-600">
               <Lock size={20} /> 2. Ma'lumotlardan foydalanish
            </h2>
            <p>
              Siz taqdim etgan ma'lumotlar faqatgina buyurtmalarni qayta ishlash, to'lovlarni amalga oshirish va mahsulotni ko'rsatilgan manzilga yetkazib berish maqsadida ishlatiladi.
            </p>
            <p>
              Biz sizning telefon raqamingizdan buyurtma holati haqida xabar berish yoki muhim yangiliklarni (agar siz rozilik bersangiz) yuborish uchun foydalanamiz.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black flex items-center gap-3 uppercase italic tracking-tighter text-red-600">
               <CheckCircle2 size={20} /> 3. Ma'lumotlar xavfsizligi
            </h2>
            <p>
              Biz sizning shaxsiy ma'lumotlaringizni himoya qilish uchun zamonaviy shifrlash texnologiyalaridan va xavfsiz serverlardan (Supabase) foydalanamiz. 
            </p>
            <p>
              Sizning ma'lumotlaringiz uchinchi shaxslarga sotilmaydi yoki qonunchilikda ko'rsatilgan hollardan tashqari boshqalarga berilmaydi.
            </p>
          </section>

          <section className="p-8 rounded-[2rem] bg-slate-100 dark:bg-gray-900 border border-white dark:border-gray-800">
             <h3 className="font-black mb-4 uppercase italic tracking-tighter">Bog'lanish</h3>
             <p className="text-sm">
                Agar maxfiylik siyosati bo'yicha savollaringiz bo'lsa, biz bilan Telegram orqali bog'lanishingiz mumkin.
             </p>
          </section>
        </div>
        
        <footer className="mt-20 pt-8 border-t border-slate-200 dark:border-gray-800 text-center">
           <p className="text-[10px] font-black tracking-widest uppercase text-slate-400">© 2026 Nihao Shop — Barcha huquqlar himoyalangan.</p>
        </footer>
      </div>
    </div>
  );
}
