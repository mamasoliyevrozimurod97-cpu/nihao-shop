import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cdzwtoedvrdnxghazaux.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkend0b2VkdnJkbnhnaGF6YXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2MzMxMTksImV4cCI6MjA5MDIwOTExOX0.p619_rhy1A7esZ3N3PvtPPnyqeIbQfoHYrXA3UA-0VA';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase config.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
