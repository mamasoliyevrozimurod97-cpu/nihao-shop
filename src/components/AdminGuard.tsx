"use client";
import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAppStore();
  const router = useRouter();
  const adminPhone = process.env.NEXT_PUBLIC_ADMIN_PHONE; // Sole source of truth

  useEffect(() => {
    // Only perform redirect logic once auth state is initialized (not undefined)
    if (user !== undefined) {
      const cleanInput = (user?.phone || "").replace(/\s+/g, "");
      const cleanAdmin = (adminPhone || "").replace(/\s+/g, "");
      const isAdmin = (cleanInput === cleanAdmin);

      if (!user || !isAdmin) {
        console.warn("Unauthorized access to admin panel. Redirecting to login...");
        router.push("/admin/login");
      }
    }
  }, [user, router, adminPhone]);

  // While checking auth (initializing), show loader
  if (user === undefined) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 p-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 shadow-lg shadow-red-500/20"></div>
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest animate-pulse">Xavfsiz ulanish tekshirilmoqda...</p>
        </div>
      </div>
    );
  }

  // Pre-rendering check for safety
  const isAdmin = (user?.phone === adminPhone);
  if (!user || !isAdmin) {
    return null; // Let useEffect handle the redirect
  }

  return <>{children}</>;
}
