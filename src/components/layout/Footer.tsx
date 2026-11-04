import React from "react";
import Link from "next/link";
import { MapPin, Phone, Clock, ShieldCheck, Truck, CreditCard } from "lucide-react";
import { InstagramIcon } from "@/components/ui/InstagramIcon";

export function Footer() {
  return (
    <footer className="bg-[#141414] text-[#FAF8F5] pt-16 pb-12 border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Proposition Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 mb-12 border-b border-white/10 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0 text-[#C5A059]">
              <MapPin className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div>
              <h4 className="font-serif text-lg text-white">Бутик в Кызылорде</h4>
              <p className="text-xs text-neutral-400 mt-1 font-light">
                ул. Абая 45 • Примерка в уютной обстановке
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0 text-[#C5A059]">
              <Truck className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div>
              <h4 className="font-serif text-lg text-white">Быстрая доставка</h4>
              <p className="text-xs text-neutral-400 mt-1 font-light">
                По Кызылорде в день заказа • По всему Казахстану
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0 text-[#C5A059]">
              <CreditCard className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div>
              <h4 className="font-serif text-lg text-white">Kaspi Оплата</h4>
              <p className="text-xs text-neutral-400 mt-1 font-light">
                Kaspi Pay, Kaspi Red, рассрочка и QR-код
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Links & Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <span className="font-serif text-2xl tracking-[0.25em] text-white block uppercase">
              BUTELLA
            </span>
            <p className="text-xs leading-relaxed text-neutral-400 font-light">
              Премиальный бутик женской одежды в Кызылорде. Элегантность, безупречный крой и вдохновение для каждого вашего дня.
            </p>
            <div className="flex items-center space-x-4 pt-2">
              <a
                href="https://instagram.com/butella_kz"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-[#C5A059] hover:text-black flex items-center justify-center transition-all duration-300"
                aria-label="Instagram Butella"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/77771234567"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-[#C5A059] hover:text-black flex items-center justify-center transition-all duration-300"
                aria-label="WhatsApp Butella"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Catalog Categories */}
          <div>
            <h5 className="text-xs uppercase tracking-[0.2em] font-medium text-neutral-300 mb-4">
              Категории
            </h5>
            <ul className="space-y-2.5 text-xs text-neutral-400 font-light">
              <li>
                <Link href="/catalog?cat=Платья" className="hover:text-white transition-colors">
                  Платья
                </Link>
              </li>
              <li>
                <Link href="/catalog?cat=Костюмы" className="hover:text-white transition-colors">
                  Костюмы & Комплекты
                </Link>
              </li>
              <li>
                <Link href="/catalog?cat=Верхняя+одежда" className="hover:text-white transition-colors">
                  Пальто & Тренчи
                </Link>
              </li>
              <li>
                <Link href="/catalog?cat=Блузы+и+топы" className="hover:text-white transition-colors">
                  Блузы & Рубашки
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="hover:text-[#C5A059] transition-colors">
                  Смотреть все →
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h5 className="text-xs uppercase tracking-[0.2em] font-medium text-neutral-300 mb-4">
              Покупателям
            </h5>
            <ul className="space-y-2.5 text-xs text-neutral-400 font-light">
              <li>
                <Link href="/#delivery" className="hover:text-white transition-colors">
                  Доставка и оплата
                </Link>
              </li>
              <li>
                <Link href="/#fitting" className="hover:text-white transition-colors">
                  Примерка в Кызылорде
                </Link>
              </li>
              <li>
                <Link href="/#returns" className="hover:text-white transition-colors">
                  Возврат и обмен
                </Link>
              </li>
              <li>
                <Link href="/manage" className="hover:text-[#C5A059] transition-colors">
                  Панель бутика (/manage)
                </Link>
              </li>
            </ul>
          </div>

          {/* Boutique Visit Info */}
          <div className="space-y-3">
            <h5 className="text-xs uppercase tracking-[0.2em] font-medium text-neutral-300 mb-4">
              Наш бутик
            </h5>
            <div className="flex items-start gap-2.5 text-xs text-neutral-400 font-light">
              <MapPin className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
              <span>г. Кызылорда, ул. Абая 45 (Бутик BUTELLA)</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-neutral-400 font-light">
              <Clock className="w-4 h-4 text-[#C5A059] shrink-0" />
              <span>Ежедневно 10:00 — 20:00</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-neutral-400 font-light">
              <Phone className="w-4 h-4 text-[#C5A059] shrink-0" />
              <a href="tel:+77771234567" className="hover:text-white">
                +7 (777) 123-45-67
              </a>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center text-[11px] text-neutral-500 font-light gap-4">
          <p>© 2026 BUTELLA Boutique. Все права защищены. Кызылорда, Казахстан.</p>
          <p className="tracking-widest uppercase text-[10px]">Made for elegant women</p>
        </div>
      </div>
    </footer>
  );
}
