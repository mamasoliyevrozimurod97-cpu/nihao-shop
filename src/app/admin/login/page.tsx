"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Lock, Phone, ArrowLeft, ShieldCheck } from "lucide-react";

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
    try {
      const { error, data } = await supabase.auth.verifyOtp({ phone, token, type: "sms" });
      if (error) {
        setError("Kod noto'g'ri yoki vaqti o'tgan");
      } else if (data.user) {
         // Check if this user is the admin (phone only)
         const isUserAdmin = (data.user.phone === adminPhone || data.user.phone === phone);
         
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
    <div className="flex min-h-screen bg-gray-950 text-white selection:bg-red-500/30">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-red-600/10 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-orange-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 flex w-full flex-col items-center justify-center p-6">
        {/* Back Link */}
        <button 
          onClick={() => router.push("/")}
          className="absolute left-6 top-8 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} /> Asosiyga qaytish
        </button>

        {/* Login Card */}
        <div className="w-full max-w-md overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-2xl md:p-12">
          <div className="mb-10 flex flex-col items-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-red-600 to-red-800 shadow-lg shadow-red-600/20">
              <ShieldCheck size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tight">Admin Kirish</h1>
            <p className="mt-3 text-sm font-medium text-gray-400">
              {step === "phone" 
                ? "Boshqaruv paneliga kirish uchun telefon raqamingizni kiriting" 
                : `${phone} raqamiga yuborilgan kodni kiriting`}
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-center text-xs font-bold text-red-500">
              {error}
            </div>
          )}

          {step === "phone" ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Telefon Raqam</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-500 transition-colors">
                    <Phone size={20} />
                  </div>
                  <input 
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 font-black outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/10 placeholder:text-gray-700"
                    placeholder="+998 90 123 45 67"
                  />
                </div>
              </div>

              <button 
                disabled={loading}
                type="submit" 
                className="group relative w-full overflow-hidden rounded-2xl bg-white py-4 text-sm font-black text-gray-900 transition hover:bg-red-500 hover:text-white"
              >
                <div className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? "Kutilmoqda..." : "SMS Kod Yuborish"}
                </div>
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">SMS Tasdiqlash Kodi</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-500 transition-colors">
                    <Lock size={20} />
                  </div>
                  <input 
                    required
                    type="text"
                    maxLength={6}
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-center font-black tracking-[0.5em] outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/10 placeholder:text-gray-700"
                    placeholder="000000"
                  />
                </div>
              </div>

              <button 
                disabled={loading}
                type="submit" 
                className="group relative w-full overflow-hidden rounded-2xl bg-red-600 py-4 text-sm font-black text-white shadow-xl shadow-red-600/20 transition hover:bg-red-700"
              >
                <div className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? "Tasdiqlanmoqda..." : "Kodni Tasdiqlash"}
                </div>
              </button>

              <button 
                type="button" 
                onClick={() => setStep("phone")}
                className="w-full text-center text-xs font-bold text-gray-500 hover:text-white transition"
              >
                Raqamni o'zgartirish
              </button>
            </form>
          )}

          <div className="mt-10 border-t border-white/5 pt-8 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
              Xavfsiz Boshqaruv Tizimi v2.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
