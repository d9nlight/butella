"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-[#FAF8F5] border border-[#E6DCD1] flex items-center justify-center mx-auto mb-6 text-neutral-400">
          <ShoppingBag className="w-8 h-8 stroke-[1.2]" />
        </div>
        <h1 className="font-serif text-3xl mb-3 text-[#141414]">Ваша корзина пуста</h1>
        <p className="text-sm text-neutral-500 font-light mb-8 max-w-sm mx-auto">
          Ознакомьтесь с нашей новой коллекцией женской одежды и выберите образ по вкусу
        </p>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 bg-[#141414] text-white px-8 py-4 text-xs uppercase tracking-widest hover:bg-[#C5A059] hover:text-black transition-all"
        >
          <span>В каталог</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/catalog"
          className="text-xs uppercase tracking-wider text-neutral-500 hover:text-black flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Продолжить покупки</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 bg-[#FAF8F5] border border-[#E6DCD1] rounded-xs p-6 divide-y divide-[#E6DCD1]">
          <div className="pb-4 flex justify-between items-center">
            <h1 className="font-serif text-2xl text-[#141414]">
              Корзина покупок ({totalItems})
            </h1>
          </div>

          {items.map((item) => (
            <div key={item.variantId} className="py-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
              <div className="flex gap-4 items-center">
                <div className="relative w-20 h-26 bg-neutral-200 shrink-0 rounded-xs overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="80px"
                    className="object-cover object-center"
                  />
                </div>
                <div>
                  <Link
                    href={`/product/${item.slug}`}
                    className="font-serif text-base text-[#141414] hover:text-[#C5A059] transition-colors"
                  >
                    {item.title}
                  </Link>
                  <div className="text-xs text-neutral-500 mt-1 space-x-3">
                    <span>Размер: <strong className="text-neutral-800">{item.size}</strong></span>
                    <span>Цвет: <strong className="text-neutral-800">{item.color}</strong></span>
                  </div>
                  <div className="text-xs font-medium text-neutral-900 mt-1 sm:hidden">
                    {formatPrice(item.price)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                <div className="hidden sm:block text-sm font-medium text-neutral-900 w-24 text-right">
                  {formatPrice(item.price)}
                </div>

                {/* Quantity */}
                <div className="flex items-center border border-[#E6DCD1] rounded-xs bg-white">
                  <button
                    onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                    className="p-2 text-neutral-600 hover:text-black hover:bg-neutral-50 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center text-xs font-medium">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                    disabled={item.quantity >= item.maxStock}
                    className="p-2 text-neutral-600 hover:text-black hover:bg-neutral-50 disabled:opacity-30 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="text-sm font-semibold text-neutral-900 w-28 text-right">
                  {formatPrice(item.price * item.quantity)}
                </div>

                <button
                  onClick={() => removeItem(item.variantId)}
                  className="text-neutral-400 hover:text-red-600 p-2 transition-colors"
                  title="Удалить"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-4 bg-[#FAF8F5] border border-[#E6DCD1] rounded-xs p-6 space-y-6">
          <h2 className="font-serif text-xl text-[#141414] border-b border-[#E6DCD1] pb-3">
            Сумма заказа
          </h2>

          <div className="space-y-3 text-xs text-neutral-600">
            <div className="flex justify-between">
              <span>Товары ({totalItems}):</span>
              <span className="font-medium text-neutral-900">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Доставка:</span>
              <span>Самовывоз в Кызылорде (Бесплатно) или курьер</span>
            </div>
            <div className="border-t border-[#E6DCD1] pt-3 flex justify-between text-base font-medium text-[#141414]">
              <span>Итого:</span>
              <span className="font-serif text-xl">{formatPrice(subtotal)}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="w-full bg-[#141414] text-white py-4 px-6 text-xs uppercase tracking-widest font-medium flex items-center justify-center gap-2 hover:bg-[#C5A059] hover:text-black transition-all shadow-md"
          >
            <span>Перейти к оформлению</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <div className="text-[11px] text-neutral-500 font-light space-y-1 pt-2">
            <p>✓ Оплата Kaspi QR, Kaspi Pay или наличными при получении</p>
            <p>✓ Возможность примерки перед покупкой в бутике (Кызылорда)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
