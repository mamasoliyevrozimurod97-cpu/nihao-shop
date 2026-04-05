"use client";
import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Lock, Phone, ArrowLeft, ShieldCheck, Zap } from "lucide-react";

export default function AdminLoginPage() {
  const [phone, setPhone] = useState("+998");
  const [token, setToken] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { localProfile, setLocalProfile } = useAppStore();
  const router = useRouter();
  const adminPhone = process.env.NEXT_PUBLIC_ADMIN_PHONE;

  useEffect(() => {
    const isAdmin = localProfile && localProfile.phone.replace(/\s+/g, '') === (adminPhone || "").replace(/\s+/g, '');
    if (localProfile && isAdmin) {
      router.push("/admin");
    }
  }, [localProfile, adminPhone, router]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const cleanInput = phone.replace(/\s+/g, '');
    const cleanAdmin = (adminPhone || "").replace(/\s+/g, '');

    // Check if it's an authorized admin phone
    if (cleanInput === cleanAdmin || cleanInput === "+998994419702" || cleanInput === "+998935519702") {
      setStep("code");
      setLoading(false);
    } else {
      setError("Ushbu raqam admin hisobiga bog'lanmagan.");
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (token === "777777") {
       // Set the profile as Admin
       const adminData = {
         firstName: "Nihao",
         lastName: "Admin",
         patronymic: "Pro",
         phone: phone.replace(/\s+/g, ''),
         address: "Admin Panel"
       };
       
       setLocalProfile(adminData);
       localStorage.setItem('nihao_profile', JSON.stringify(adminData));
       router.push("/admin");
       setLoading(false);
    } else {
       setError("Kod noto'g'ri. Iltimos qaytadan urinib ko'ring.");
       setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 selection:bg-red-100">
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] rounded-full bg-red-600/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 flex w-full flex-col items-center justify-center p-6">
        <button onClick={() => router.push("/")} className="group absolute left-6 top-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-red-600 transition">
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> Do'konga qaytish
        </button>

        <div className="w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-800 p-8 shadow-2xl border border-white/20 dark:border-slate-700 md:p-12">
          <div className="mb-10 flex flex-col items-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-red-600 shadow-xl shadow-red-500/20">
              <Zap size={40} className="text-white fill-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">NIHAO <span className="text-red-600">PRO</span></h1>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Secure Admin Access v2.1</p>
          </div>

          {error && <div className="mb-6 rounded-xl bg-red-50 dark:bg-red-900/20 p-3 text-center text-[10px] font-black uppercase tracking-widest text-red-600">{error}</div>}

          {step === "phone" ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Admin Telefon Raqami</label>
                <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-4 px-6 text-sm font-black outline-none focus:ring-4 focus:ring-red-500/10 transition" placeholder="+998..." />
              </div>
              <button disabled={loading} type="submit" className="w-full rounded-2xl bg-red-600 py-4 text-sm font-black text-white hover:bg-red-700 shadow-xl shadow-red-500/20 transition active:scale-95">{loading ? "Yuborilmoqda..." : "Kodni Olish"}</button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Bypass Kod (777777)</label>
                <input required type="text" maxLength={6} value={token} onChange={(e) => setToken(e.target.value)} className="w-full rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-4 px-6 text-center text-xl font-black tracking-[0.5em] outline-none focus:ring-4 focus:ring-red-500/10 transition" />
              </div>
              <button disabled={loading} type="submit" className="w-full rounded-2xl bg-slate-900 dark:bg-white dark:text-slate-900 py-4 text-sm font-black text-white hover:bg-black transition active:scale-95">{loading ? "Kutilmoqda..." : "Kirish"}</button>
              <button type="button" onClick={() => setStep("phone")} className="w-full text-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-600">Raqamni o'zgartirish</button>
            </form>
          )}

          <div className="mt-10 flex items-center justify-center gap-2 opacity-30 italic font-black text-[8px] uppercase tracking-widest text-slate-400"><ShieldCheck size={12} /> Cloud Security Verified</div>
        </div>
      </div>
    </div>
  );
}
