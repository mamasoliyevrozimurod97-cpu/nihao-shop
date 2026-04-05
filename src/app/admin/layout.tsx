"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Package, Truck, Settings, ArrowLeft, User, Bell, Users, Megaphone, Layers } from "lucide-react";
import AdminGuard from "@/components/AdminGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <div className="min-h-screen bg-slate-950">{children}</div>;
  }

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-[#f8faff] text-slate-900 font-sans selection:bg-red-100 selection:text-red-900">
        {/* Modern Sidebar */}
        <aside className="fixed left-0 top-0 z-30 h-screen w-72 border-r border-slate-200 bg-white shadow-[20px_0_40px_rgba(0,0,0,0.02)]">
          <div className="flex h-20 items-center px-8 border-b border-slate-50">
             <Link href="/admin" className="flex items-center gap-3 active:scale-95 transition-transform">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-red-600 to-red-500 shadow-lg shadow-red-200 flex items-center justify-center text-white scale-110">
                   <Package size={22} className="animate-pulse" />
                </div>
                <span className="text-xl font-black tracking-tighter text-slate-800">NIHAO <span className="text-red-600">PRO</span></span>
             </Link>
          </div>

          <div className="flex flex-col justify-between h-[calc(100vh-80px)] p-6">
            <nav className="space-y-1">
              <p className="px-4 mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Asosiy Menyular</p>
              <SidebarLink href="/admin" icon={<LayoutDashboard size={20} />} label="Dashboard" />
              <SidebarLink href="/admin/orders" icon={<ShoppingBag size={20} />} label="Buyurtmalar" />
              <SidebarLink href="/admin/products" icon={<Package size={20} />} label="Mahsulotlar" />
              <SidebarLink href="/admin/customers" icon={<Users size={20} />} label="Mijozlar" />
              
              <p className="px-4 mt-8 mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Operatsiyalar</p>
              <SidebarLink href="/admin/departments" icon={<Package size={20} />} label="Bo'limlar" />
              <SidebarLink href="/admin/groups" icon={<Users size={20} />} label="Guruhlar" />
              <SidebarLink href="/admin/materials" icon={<Package size={20} />} label="Materiallar" />
              
              <p className="px-4 mt-8 mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tizim</p>
              <SidebarLink href="/admin/banners" icon={<Layers size={20} />} label="Bannerlar" />
              <SidebarLink href="/admin/marketing" icon={<Megaphone size={20} />} label="Marketing" />
              <SidebarLink href="/admin/delivery" icon={<Truck size={20} />} label="Yetkazib berish" />
              <SidebarLink href="/admin/settings" icon={<Settings size={20} />} label="Sozlamalar" />
            </nav>

            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-4 rounded-2xl bg-slate-50 px-6 py-4 text-sm font-black text-slate-500 transition hover:bg-red-50 hover:text-red-600 group">
                <ArrowLeft size={18} className="transition group-hover:-translate-x-1" />
                Do'konga qaytish
              </Link>
              <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-2xl relative overflow-hidden group">
                 <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/5 transition group-hover:scale-150 duration-700" />
                 <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Mavjud Balans</p>
                 <p className="text-xl font-black mb-4">9,420,000 UZS</p>
                 <button className="w-full rounded-xl bg-white/10 py-2.5 text-xs font-black transition hover:bg-white/20">Yechib olish</button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Interface Area */}
        <main className="ml-72 flex-1 min-h-screen">
          <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-white/40 bg-white/80 px-10 backdrop-blur-xl">
             <div className="flex flex-col">
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Boshqaruv Paneli</h2>
                <p className="text-xs font-bold text-slate-300">Xush kelibsiz, Admin!</p>
             </div>

             <div className="flex items-center gap-6">
                <button className="relative rounded-2xl bg-slate-50 p-3 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
                  <Bell size={20} />
                  <span className="absolute right-3 top-3 flex h-2 w-2 rounded-full bg-red-500 ring-4 ring-white"></span>
                </button>
                <div className="h-10 w-[1px] bg-slate-100" />
                <div className="flex items-center gap-4 group cursor-pointer">
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-800">Administrator</p>
                    <p className="text-[10px] font-bold text-green-500 uppercase tracking-tighter">Onlayn</p>
                  </div>
                  <div className="h-12 w-12 rounded-[1.25rem] bg-gradient-to-tr from-slate-200 to-slate-100 border-4 border-white shadow-md flex items-center justify-center text-slate-400 transition group-hover:shadow-lg">
                    <User size={24} />
                  </div>
                </div>
             </div>
          </header>

          <div className="p-10 max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}

function SidebarLink({ href, icon, label }: { href: string; icon: any; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link 
      href={href} 
      className={`group flex items-center gap-4 rounded-[1.25rem] px-6 py-4 text-sm font-black transition-all active:scale-95 ${
        isActive 
          ? "bg-red-600 text-white shadow-lg shadow-red-200" 
          : "text-slate-500 hover:bg-red-50 hover:text-red-700"
      }`}
    >
      <div className={`transition-transform group-hover:scale-110 group-hover:rotate-3 ${isActive ? "" : ""}`}>{icon}</div>
      {label}
    </Link>
  );
}
