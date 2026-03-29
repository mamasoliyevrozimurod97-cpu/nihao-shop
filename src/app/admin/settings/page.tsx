"use client";
import { useAppStore } from "@/lib/store";
import { useState } from "react";
import { Save } from "lucide-react";

export default function AdminSettingsPage() {
  const { deliveryConfig, setDeliveryConfig } = useAppStore();
  const [config, setConfig] = useState(deliveryConfig);

  const handleSave = () => {
    setDeliveryConfig({
      nearbyPrice: Number(config.nearbyPrice),
      farPrice: Number(config.farPrice),
      freeThreshold: Number(config.freeThreshold),
    });
    alert("Sozlamalar saqlandi!");
  };

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-black text-gray-900">Do'kon Sozlamalari</h1>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold">Yetkazib berish (Dastavka) narxlari</h2>
        
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Yaqin hududlar uchun narx (so'm)</label>
            <input 
              type="number" 
              value={config.nearbyPrice} 
              onChange={e => setConfig({...config, nearbyPrice: Number(e.target.value)})}
              className="w-full rounded-xl border p-3 font-medium outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100" 
            />
            <p className="mt-1 text-xs text-gray-500">Toshkent shahri markaziy tumanlari uchun qo'llaniladi.</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Uzoq viloyatlar uchun narx (so'm)</label>
            <input 
              type="number" 
              value={config.farPrice} 
              onChange={e => setConfig({...config, farPrice: Number(e.target.value)})}
              className="w-full rounded-xl border p-3 font-medium outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100" 
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Bepul yetkazib berish chegarasi (so'm)</label>
            <input 
              type="number" 
              value={config.freeThreshold} 
              onChange={e => setConfig({...config, freeThreshold: Number(e.target.value)})}
              className="w-full rounded-xl border p-3 font-medium outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100" 
            />
            <p className="mt-1 text-xs text-gray-500">Misol: 1 000 000 so'mdan oshiq xaridlarga dastavka bepul bo'ladi.</p>
          </div>
        </div>

        <button onClick={handleSave} className="mt-8 flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-bold text-white shadow hover:bg-red-700 transition">
          <Save size={18} /> Saqlash
        </button>
      </div>
    </div>
  );
}
