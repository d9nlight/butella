"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X, Search, Heart, User } from "lucide-react";
import { useCart } from "@/context/CartContext";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems, openCart } = useCart();
  const pathname = usePathname();

  const navLinks = [
    { label: "Главная", href: "/" },
    { label: "Каталог", href: "/catalog" },
    { label: "Платья", href: "/catalog?cat=Платья" },
    { label: "Костюмы", href: "/catalog?cat=Костюмы" },
    { label: "Верхняя одежда", href: "/catalog?cat=Верхняя+одежда" },
    { label: "О бутике", href: "/#boutique" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#E6DCD1]/60 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 text-neutral-800 hover:text-black focus:outline-none"
              aria-label="Открыть меню"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 stroke-[1.5]" />
              ) : (
                <Menu className="w-6 h-6 stroke-[1.5]" />
              )}
            </button>
          </div>

          {/* Brand Logo */}
          <div className="flex-1 lg:flex-initial text-center lg:text-left">
            <Link href="/" className="inline-block group">
              <span className="font-serif text-2xl sm:text-3xl tracking-[0.25em] text-[#141414] font-medium block uppercase group-hover:text-[#A0826C] transition-colors">
                BUTELLA
              </span>
              <span className="text-[9px] tracking-[0.35em] text-neutral-500 uppercase block -mt-1 font-sans">
                Boutique • Kyzylorda
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm tracking-widest uppercase transition-colors duration-200 py-1 border-b-2 ${
                    isActive
                      ? "text-black border-[#141414] font-medium"
                      : "text-neutral-600 border-transparent hover:text-black hover:border-[#C5A059]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions: Search, Manage Link, Cart Bag */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            <Link
              href="/catalog"
              className="p-2 text-neutral-700 hover:text-black transition-colors"
              title="Поиск товаров"
            >
              <Search className="w-5 h-5 stroke-[1.5]" />
            </Link>

            <Link
              href="/manage"
              className="p-2 text-neutral-600 hover:text-black transition-colors hidden sm:block"
              title="Вход для владельца бутиков"
            >
              <User className="w-5 h-5 stroke-[1.5]" />
            </Link>

            {/* Shopping Bag Button */}
            <button
              onClick={openCart}
              className="relative p-2 text-neutral-800 hover:text-black transition-transform active:scale-95"
              aria-label="Корзина покупок"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#141414] text-white text-[10px] font-semibold w-5 h-5 rounded-full flex items-center justify-center animate-scale-in">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E6DCD1] bg-[#FDFBF7] px-4 pt-3 pb-6 animate-fade-in">
          <div className="space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-light tracking-wider text-neutral-800 hover:text-[#C5A059] border-b border-neutral-100 uppercase"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 flex flex-col gap-2">
              <Link
                href="/manage"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm text-neutral-500 hover:text-black py-1"
              >
                <User className="w-4 h-4" />
                <span>Управление бутиком (/manage)</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
