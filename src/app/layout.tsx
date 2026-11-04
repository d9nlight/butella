import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";

const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BUTELLA — Бутик женской одежды в Кызылорде",
  description:
    "Эксклюзивная коллекция женской одежды в Кызылорде. Премиальные платья, костюмы и верхняя одежда. Доставка по Кызылорде и всему Казахстану. Оплата Kaspi.",
  keywords: [
    "женская одежда Кызылорда",
    "бутик Butella",
    "платья Кызылорда",
    "костюмы женские",
    "модная одежда Казахстан",
    "шопинг Кызылорда",
  ],
  openGraph: {
    title: "BUTELLA — Бутик женской одежды в Кызылорде",
    description: "Эксклюзивная женская одежда. Доставка по Казахстану. Оплата Kaspi.",
    type: "website",
    locale: "ru_KZ",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#141414",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${playfair.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#141414] antialiased">
        <CartProvider>
          <AnnouncementBar />
          <Suspense fallback={<div className="h-20 bg-[#FDFBF7]" />}>
            <Header />
          </Suspense>
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
