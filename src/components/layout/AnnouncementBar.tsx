import React from "react";
import { Phone } from "lucide-react";
import { InstagramIcon } from "@/components/ui/InstagramIcon";

export function AnnouncementBar() {
  return (
    <div className="bg-[#141414] text-[#FAF8F5] text-xs py-2 px-4 border-b border-white/10">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1.5 font-light tracking-wide">
        <div className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse" />
          <span>Бутик в Кызылорде • Доставка с примеркой по всему Казахстану</span>
        </div>

        <div className="flex items-center gap-4 text-neutral-300">
          <a
            href="tel:+77771234567"
            className="flex items-center gap-1 hover:text-[#C5A059] transition-colors"
          >
            <Phone className="w-3 h-3" />
            <span className="hidden sm:inline">+7 (777) 123-45-67</span>
          </a>
          <a
            href="https://instagram.com/butella_kz"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-[#C5A059] transition-colors"
          >
            <InstagramIcon className="w-3.5 h-3.5" />
            <span>@butella_kz</span>
          </a>
        </div>
      </div>
    </div>
  );
}
