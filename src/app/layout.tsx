import type { Metadata } from "next";
import "./globals.css";
import AuthListener from "@/components/AuthListener";
import ProductListener from "@/components/ProductListener";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Nihao Shop",
  description: "Premium Online Store",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover",
  themeColor: "#f8f9ff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body className="antialiased font-sans bg-gray-50 text-gray-900 pb-20 md:pb-0">
        <AuthListener />
        <ProductListener />
        {children}
        <BottomNav />
      </body>
    </html>
  );
}

