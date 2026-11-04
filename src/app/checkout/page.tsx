import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getDeliveryOptions } from "@/lib/delivery";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = {
  title: "Оформление заказа — Бутик BUTELLA",
  description: "Оформление заказа женской одежды с доставкой по Кызылорде и Казахстану. Оплата Kaspi.",
};

export default function CheckoutPage() {
  const deliveryOptions = getDeliveryOptions();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
      {/* Back to Cart link */}
      <div className="mb-6">
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-neutral-500 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Вернуться в корзину</span>
        </Link>
      </div>

      <div className="mb-10">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#A0826C] font-semibold block mb-1">
          Бутик женской одежды • Кызылорда
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#141414]">
          Оформление заказа
        </h1>
      </div>

      <CheckoutForm deliveryOptions={deliveryOptions} />
    </div>
  );
}
