"use client";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import { mapProduct } from "@/lib/data";

export default function ProductListener() {
  const setProducts = useAppStore((state) => state.setProducts);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        const mapped = data.map(mapProduct);
        setProducts(mapped);
      }
    };

    fetchProducts();

    // Optional: Real-time updates for products
    const channel = supabase
      .channel('public:products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchProducts)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [setProducts]);

  return null;
}
