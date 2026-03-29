import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 z-20 h-screen w-64 border-r border-gray-200 bg-white">
        <div className="flex h-16 items-center justify-center border-b border-gray-200">
          <h1 className="text-xl font-black text-red-700">NIHAO ADMIN</h1>
        </div>
        <nav className="flex flex-col gap-2 p-4">
          <Link href="/admin" className="rounded-xl p-3 font-bold text-gray-600 hover:bg-gray-100 focus:bg-red-50 focus:text-red-700 transition-colors">📊 Dashboard</Link>
          <Link href="/admin/products" className="rounded-xl p-3 font-bold text-gray-600 hover:bg-gray-100 focus:bg-red-50 focus:text-red-700 transition-colors">🛒 Mahsulotlar</Link>
          <Link href="/admin/delivery" className="rounded-xl p-3 font-bold text-gray-600 hover:bg-gray-100 focus:bg-red-50 focus:text-red-700 transition-colors">🚚 Yetkazib berish</Link>
          <Link href="/admin/orders" className="rounded-xl p-3 font-bold text-gray-600 hover:bg-gray-100 focus:bg-red-50 focus:text-red-700 transition-colors">📦 Buyurtmalar</Link>
          <Link href="/admin/settings" className="rounded-xl p-3 font-bold text-gray-600 hover:bg-gray-100 focus:bg-red-50 focus:text-red-700 transition-colors">⚙️ Sozlamalar</Link>
          <Link href="/" className="mt-8 rounded-xl p-3 font-bold text-gray-400 hover:bg-gray-100 transition-colors">⬅️ Do'konga qaytish</Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="ml-64 flex-1">
        <div className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-8">
          <h2 className="text-lg font-bold text-gray-800">Boshqaruv Paneli</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Administrator</span>
            <div className="h-8 w-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold">A</div>
          </div>
        </div>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
