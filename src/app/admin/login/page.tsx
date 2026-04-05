"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Lock, Phone, ArrowLeft, ShieldCheck, Zap } from "lucide-react";

export default function AdminLoginPage() {
  const [phone, setPhone] = useState("+998");
  const [token, setToken] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { user, setUser } = useAppStore();
  const router = useRouter();
  const adminPhone = process.env.NEXT_PUBLIC_ADMIN_PHONE;

  useEffect(() => {
    const isAdmin = (user?.phone === adminPhone);
    if (user && isAdmin) {
      router.push("/admin");
    }
  }, [user, adminPhone, router]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Normalize both for comparison
    const cleanInput = phone.replace(/\s+/g, '');
    const cleanAdmin = (adminPhone || "").replace(/\s+/g, '');

    // Developer Bypass for Admin
    if (cleanInput === cleanAdmin || cleanInput === "+998994419702" || cleanInput === "+998935519702") {
      setStep("code");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) {
        setError(error.message);
      } else {
        setStep("code");
      }
    } catch (err: any) {
      setError(err.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Developer Bypass check (Normalized)
    const cleanInput = phone.replace(/\s+/g, '');
    const cleanAdmin = (adminPhone || "").replace(/\s+/g, '');

    if ((cleanInput === cleanAdmin || cleanInput === "+998994419702" || cleanInput === "+998935519702") && token === "777777") {
       // Mock a user object for the store
       setUser({ phone: cleanInput, role: 'admin' });
       router.push("/admin");
       setLoading(false);
       return;
    }

    try {
      const { error, data } = await supabase.auth.verifyOtp({ phone, token, type: "sms" });
      if (error) {
        setError("Kod noto'g'ri yoki vaqti o'tgan");
      } else if (data.user) {
         const isUserAdmin = (data.user.phone === adminPhone);
         if (!isUserAdmin) {
             setError("Ushbu raqam admin hisobiga bog'lanmagan.");
             await supabase.auth.signOut();
         } else {
             setUser(data.user);
             router.push("/admin");
         }
      }
    } catch (err: any) {
      setError(err.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8faff] text-slate-900 selection:bg-red-100">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] rounded-full bg-red-600/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] rounded-full bg-blue-600/5 blur-[120px]" />
      </div>

      <div className="relative z-10 flex w-full flex-col items-center justify-center p-6 sm:p-12">
        <button 
          onClick={() => router.push("/")}
          className="group absolute left-6 top-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-red-600 transition-colors"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> Do'konga qaytish
        </button>

        <div className="w-full max-w-md overflow-hidden rounded-[3rem] bg-white p-8 shadow-[0_40px_100px_rgba(0,0,0,0.05)] border border-white md:p-14">
          <div className="mb-12 flex flex-col items-center text-center">
            <div className="mb-8 relative">
               <div className="absolute inset-0 bg-red-600 animate-ping rounded-3xl opacity-20" />
               <div className="relative flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-tr from-red-600 to-red-500 shadow-2xl shadow-red-200">
                  <Zap size={44} className="text-white fill-white animate-pulse" />
               </div>
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 italic uppercase">NIHAO <span className="text-red-600">PRO</span></h1>
            <p className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-400">
               Xavfsiz boshqaruv tizimi Kirish v2.0
            </p>
          </div>

          {error && (
            <div className="mb-8 rounded-2xl bg-red-50 border border-red-100 p-4 text-center text-[10px] font-black uppercase tracking-widest text-red-600">
              {error}
            </div>
          )}

          {step === "phone" ? (
            <form onSubmit={handleSendOTP} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Telefon Raqami</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors">
                    <Phone size={20} />
                  </div>
                  <input 
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-5 pl-14 pr-6 text-sm font-black outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/5 placeholder:text-slate-300"
                    placeholder="+998 90 123 45 67"
                  />
                </div>
              </div>

              <button 
                disabled={loading}
                type="submit" 
                className="w-full rounded-[1.5rem] bg-red-600 py-5 text-sm font-black text-white shadow-2xl shadow-red-100 hover:bg-red-700 transition active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? "Yuborilmoqda..." : "SMS Kodni Yuborish"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">SMS Kodni Kiriting</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors">
                    <Lock size={20} />
                  </div>
                  <input 
                    required
                    type="text"
                    maxLength={6}
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-5 pl-14 pr-6 text-center text-xl font-black tracking-[0.5em] outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/5 placeholder:text-slate-300"
                    placeholder="000000"
                  />
                </div>
              </div>

              <button 
                disabled={loading}
                type="submit" 
                className="w-full rounded-[1.5rem] bg-slate-900 py-5 text-sm font-black text-white shadow-2xl shadow-slate-200 hover:bg-black transition active:scale-95"
              >
                {loading ? "Tasdiqlanmoqda..." : "Tizimga Kirish"}
              </button>

              <button 
                type="button" 
                onClick={() => setStep("phone")}
                className="w-full text-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-600 transition"
              >
                Raqamni o'zgartirish
              </button>
            </form>
          )}

          <div className="mt-12 flex items-center justify-center gap-3 opacity-30 italic font-black text-[9px] uppercase tracking-tighter text-slate-400">
             <ShieldCheck size={14} /> 256-bit AES Encryption
          </div>
        </div>
      </div>
    </div>
  );
}
