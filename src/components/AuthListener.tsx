"use client";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";

export default function AuthListener() {
  const { setUser } = useAppStore();

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for changes on auth state (log in, log out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser]);

  return null;
}
