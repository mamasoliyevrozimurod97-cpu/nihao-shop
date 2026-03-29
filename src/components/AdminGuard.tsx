"use client";
import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAppStore();
  const router = useRouter();
  const adminPhone = process.env.NEXT_PUBLIC_ADMIN_PHONE; // Sole source of truth

  useEffect(() => {
    // Wait for auth to initialize (null is not logged in, object is logged in)
    if (user !== undefined) { 
      const isAdmin = (user?.phone === adminPhone);
      if (!user || !isAdmin) {
        console.warn("Unauthorized access to admin panel. Redirecting to login...");
        router.push("/admin/login");
      }
    }
  }, [user, router, adminPhone]);

  // While checking auth, show nothing or a loader
  const isAdmin = (user?.phone === adminPhone);
  if (user === undefined || !user || !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950 p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}
