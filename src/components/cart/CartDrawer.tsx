"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const {
    items,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
    subtotal,
    totalItems,
  } = useCart();

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
        onClick={closeCart}
      />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-md bg-[#FDFBF7] text-[#141414] shadow-2xl flex flex-col h-full z-10 animate-slide-left border-l border-[#E6DCD1]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E6DCD1]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
            <h2 className="font-serif text-lg tracking-wider uppercase font-medium">
              Корзина ({totalItems})
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-2 -mr-2 text-neutral-500 hover:text-black transition-colors rounded-full hover:bg-neutral-100"
            aria-label="Закрыть корзину"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-[#FAF8F5] border border-[#E6DCD1] flex items-center justify-center mb-4 text-neutral-400">
              <ShoppingBag className="w-8 h-8 stroke-[1.2]" />
            </div>
            <h3 className="font-serif text-xl mb-2 text-[#141414]">Ваша корзина пуста</h3>
            <p className="text-sm text-neutral-500 max-w-xs mb-6 font-light">
              Выберите понравившиеся модели из нашей новой коллекции одежды
            </p>
            <button
              onClick={closeCart}
              className="bg-[#141414] text-white px-6 py-3 text-xs uppercase tracking-widest hover:bg-[#C5A059] hover:text-black transition-all duration-300"
            >
              Перейти к покупкам
            </button>
          </div>
        ) : (
          <>
            {/* Items list */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-[#E6DCD1]/60">
              {items.map((item) => (
                <div key={item.variantId} className="pt-4 first:pt-0 flex gap-4">
                  {/* Thumbnail */}
                  <div className="relative w-20 h-28 bg-neutral-100 shrink-0 overflow-hidden rounded-xs">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="80px"
                      className="object-cover object-center"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={closeCart}
                          className="font-serif text-sm font-medium hover:text-[#C5A059] transition-colors line-clamp-1"
                        >
                          {item.title}
                        </Link>
                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="text-neutral-400 hover:text-red-600 transition-colors p-1 -mt-1 -mr-1"
                          title="Удалить товар"
                        >
                          <Trash2 className="w-4 h-4 stroke-[1.5]" />
                        </button>
                      </div>

                      <div className="text-xs text-neutral-500 mt-1 space-x-2">
                        <span>Размер: <strong className="text-neutral-800">{item.size}</strong></span>
                        <span>•</span>
                        <span>Цвет: <strong className="text-neutral-800">{item.color}</strong></span>
                      </div>

                      <div className="text-sm font-medium text-[#141414] mt-2">
                        {formatPrice(item.price)}
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-[#E6DCD1] rounded-xs bg-white">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="p-1.5 text-neutral-600 hover:text-black hover:bg-neutral-50 transition-colors"
                          aria-label="Уменьшить количество"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="p-1.5 text-neutral-600 hover:text-black hover:bg-neutral-50 disabled:opacity-30 transition-colors"
                          aria-label="Увеличить количество"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-xs font-semibold text-neutral-800">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer summary */}
            <div className="p-5 border-t border-[#E6DCD1] bg-[#FAF8F5] space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm text-neutral-600">
                  <span>Сумма заказа:</span>
                  <span className="font-medium text-neutral-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-neutral-500">
                  <span>Доставка:</span>
                  <span>Рассчитывается при оформлении</span>
                </div>
                <p className="text-[11px] text-[#A0826C] pt-1">
                  ✨ Примерка в бутике Кызылорды доступна при самовывозе
                </p>
              </div>

              <div className="border-t border-[#E6DCD1] pt-3">
                <div className="flex justify-between text-base font-medium text-[#141414] mb-3">
                  <span>Итого к оплате:</span>
                  <span className="font-serif text-lg">{formatPrice(subtotal)}</span>
                </div>

                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full bg-[#141414] text-white py-3.5 px-4 text-xs uppercase tracking-widest font-medium flex items-center justify-center gap-2 hover:bg-[#C5A059] hover:text-black transition-all duration-300 shadow-sm"
                >
                  <span>Оформить заказ</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
