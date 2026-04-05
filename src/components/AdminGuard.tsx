"use client";
import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { localProfile } = useAppStore();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const adminPhone = process.env.NEXT_PUBLIC_ADMIN_PHONE;

  useEffect(() => {
    // Check if the current local profile matches the admin phone
    const cleanAdmin = (adminPhone || "").replace(/\s+/g, "");
    const currentPhone = (localProfile?.phone || "").replace(/\s+/g, "");
    
    // Also allow common dev phones as fallback
    const isDevAdmin = currentPhone === "+998994419702" || currentPhone === "+998935519702";
    const isAdmin = (currentPhone === cleanAdmin) || isDevAdmin;

    if (!localProfile || !isAdmin) {
      console.warn("Unauthorized access to admin panel. Redirecting...");
      router.push("/admin/login");
      setIsAuthorized(false);
    } else {
      setIsAuthorized(true);
    }
  }, [localProfile, router, adminPhone]);

  // Loading state
  if (isAuthorized === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 p-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 shadow-lg shadow-red-500/20"></div>
          <p className="text-xs font-black text-gray-500 uppercase tracking-widest animate-pulse">Xavfsiz ulanish tekshirilmoqda...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return <>{children}</>;
}
