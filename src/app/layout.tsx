import type { Metadata, Viewport } from "next";
import "./globals.css";
import AuthListener from "@/components/AuthListener";
import ProductListener from "@/components/ProductListener";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Nihao Shop",
  description: "Premium Online Store",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
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

