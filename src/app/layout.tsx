import type { Metadata } from "next";
import "./globals.css";
import AuthListener from "@/components/AuthListener";
import ProductListener from "@/components/ProductListener";

export const metadata: Metadata = {
  title: "NIHAO.UZ — Online Do'kon",
  description: "O'zbekistonning №1 online do'koni. Butun O'zbekiston po'ylab yetkazib beramiz.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body className="antialiased font-sans bg-gray-50 text-gray-900">
        <AuthListener />
        <ProductListener />
        {children}
      </body>
    </html>
  );
}
